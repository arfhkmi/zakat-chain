import { BadRequestException, Injectable } from '@nestjs/common';
import { FitrahCalculatorDto, FitrahResponseDto } from './dto/fitrah-calculator.dto';
import { CalculationType, IncomeCalculatorDto, IncomeRates, IncomeType, WithDeductions, WithoutDeductions } from './dto/income-calculator.dto';

const SCOPE = 'Kuala Lumpur dan Wilayah Persekutuan';

// Response interfaces
export interface DeductionBreakdown {
  selfAllowance: number;
  wives: number;
  childrenUnder18: number;
  childrenAbove18Studying: number;
  parentExpenses: number;
  epf: number;
  selfEducation: number;
  total: number;
}
export interface ZakatResult {
  nisab: number;
  totalAnnualIncome: number;
  totalDeductions?: number;
  eligibleIncome: number;
  zakatContribution: number;
  amountAfterContribution: number;
  isEligible: boolean;
  zakatPerYear: number;
  zakatPerMonth: number;
  deductionBreakdown?: DeductionBreakdown;
}

@Injectable()
export class ZakatService {
  calculateIncome(dto: IncomeCalculatorDto): ZakatResult {
    if (!dto.rates) {
      throw new BadRequestException('rates object is required.');
    }
    const rates = dto.rates;

    switch (dto.calculationType) {
      case CalculationType.WITHOUT_DEDUCTIONS:
        if (!dto.withoutDeductions) {
          throw new BadRequestException(
            'withoutDeductions object is required for WITHOUT_DEDUCTIONS mode.',
          );
        }
        return this.calculateWithoutDeductions(dto.withoutDeductions, rates);

      case CalculationType.WITH_DEDUCTIONS:
        if (!dto.withDeductions) {
          throw new BadRequestException(
            'withDeductions object is required for WITH_DEDUCTIONS mode.',
          );
        }
        return this.calculateWithDeductions(dto.withDeductions, rates);

      default:
        throw new BadRequestException('Invalid calculationType.');
    }
  }

  calculateFitrah(dto: FitrahCalculatorDto): FitrahResponseDto {
    const { numberOfPersons, ratePerPerson } = dto;
    const totalAmount = numberOfPersons * ratePerPerson;
    const personLabel = numberOfPersons === 1 ? 'person' : 'persons';

    return {
      numberOfPersons,
      ratePerPerson,
      totalAmount,
      breakdown: `${numberOfPersons} ${personLabel} * RM ${ratePerPerson} = RM ${totalAmount} (${SCOPE})`,
    };
  }

  // Mode 1: Without Deductions
  private calculateWithoutDeductions(data: WithoutDeductions, rates: IncomeRates): ZakatResult {
    const annualSalary = this.annualize(
      data.incomeType,
      data.monthlyIncome,
      data.annualIncome,
    );

    const zakatRate = rates.rate / 10_000;  // basis points → decimal (250 → 0.025)
    const otherIncome = data.otherIncome ?? 0;
    const totalAnnualIncome = annualSalary + otherIncome;
    const zakatContribution = data.zakatContribution ?? 0;

    const isEligible = totalAnnualIncome >= rates.threshold;

    if (!isEligible) {
      return this.buildResult({ totalAnnualIncome, zakatContribution, isEligible: false, nisab: rates.threshold });
    }

    const grossZakat = round2(totalAnnualIncome * zakatRate);
    const amountAfterContribution = Math.max(0, grossZakat - zakatContribution);

    return this.buildResult({
      totalAnnualIncome,
      zakatContribution,
      isEligible: true,
      grossZakat,
      amountAfterContribution,
      nisab: rates.threshold,
    });
  }

  // Mode 2: With Deductions
  private calculateWithDeductions(data: WithDeductions, rates: IncomeRates): ZakatResult {
    const annualSalary = this.annualize(
      data.incomeType,
      data.monthlyIncome,
      data.annualIncome,
    );

    const zakatRate = rates.rate / 10_000;  // basis points → decimal (250 → 0.025)
    const otherIncome = data.otherIncome ?? 0;
    const totalAnnualIncome = annualSalary + otherIncome;
    const zakatContribution = data.zakatContribution ?? 0;

    const d = data.deductions;

    // Clamp inputs
    const numberOfWives = Math.min(Math.max(0, d.numberOfWives ?? 0), 4);
    const numberOfChildrenUnder18 = Math.max(0, d.numberOfChildrenUnder18 ?? 0);
    const numberOfChildrenAbove18Studying = Math.max(0, d.numberOfChildrenAbove18Studying ?? 0);
    const epfPercentage = Math.min(Math.max(0, d.epfPercentage ?? 0), 100);

    // Calculate each deduction using contract rates
    const selfAllowance = rates.selfDeduction;
    const wives = numberOfWives * rates.wifeDeduction;
    const childrenUnder18 = numberOfChildrenUnder18 * rates.childMinorDeduction;
    const childrenAbove18Studying = numberOfChildrenAbove18Studying * rates.childStudyDeduction;
    const parentExpenses = Math.max(0, d.parentExpenses ?? 0);

    // EPF applies only on salary portion (not otherIncome)
    const epf = round2((epfPercentage / 100) * annualSalary);

    // Self education capped at contract studyMaxDeduction
    const selfEducation = Math.min(
      Math.max(0, d.selfEducationExpenses ?? 0),
      rates.studyMaxDeduction,
    );

    const totalDeductions = round2(
      selfAllowance +
        wives +
        childrenUnder18 +
        childrenAbove18Studying +
        parentExpenses +
        epf +
        selfEducation,
    );

    const eligibleIncome = Math.max(0, round2(totalAnnualIncome - totalDeductions));
    const isEligible = eligibleIncome >= rates.threshold;

    const deductionBreakdown: DeductionBreakdown = {
      selfAllowance,
      wives,
      childrenUnder18,
      childrenAbove18Studying,
      parentExpenses,
      epf,
      selfEducation,
      total: totalDeductions,
    };

    if (!isEligible) {
      return this.buildResult({
        totalAnnualIncome,
        totalDeductions,
        eligibleIncome,
        zakatContribution,
        isEligible: false,
        deductionBreakdown,
        nisab: rates.threshold,
      });
    }

    const grossZakat = round2(eligibleIncome * zakatRate);
    const amountAfterContribution = Math.max(0, grossZakat - zakatContribution);

    return this.buildResult({
      totalAnnualIncome,
      totalDeductions,
      eligibleIncome,
      zakatContribution,
      isEligible: true,
      grossZakat,
      amountAfterContribution,
      deductionBreakdown,
      nisab: rates.threshold,
    });
  }

  // Helpers
  private annualize(
    incomeType: IncomeType,
    monthly?: number,
    annual?: number,
  ): number {
    if (incomeType === IncomeType.MONTHLY) {
      if (!monthly || monthly < 0) {
        throw new BadRequestException(
          'monthlyIncome is required when incomeType is MONTHLY.',
        );
      }
      return round2(monthly * 12);
    }

    if (incomeType === IncomeType.ANNUAL) {
      if (!annual || annual < 0) {
        throw new BadRequestException(
          'annualIncome is required when incomeType is ANNUAL.',
        );
      }
      return annual;
    }

    throw new BadRequestException('Invalid incomeType.');
  }

  private buildResult(params: {
    totalAnnualIncome: number;
    totalDeductions?: number;
    eligibleIncome?: number;
    zakatContribution: number;
    isEligible: boolean;
    grossZakat?: number;
    amountAfterContribution?: number;
    deductionBreakdown?: DeductionBreakdown;
    nisab: number;
  }): ZakatResult {
    const {
      totalAnnualIncome,
      totalDeductions,
      eligibleIncome,
      zakatContribution,
      isEligible,
      amountAfterContribution,
      deductionBreakdown,
      nisab,
    } = params;

    const effectiveEligibleIncome = eligibleIncome ?? totalAnnualIncome;
    const zakatPerYear = amountAfterContribution ?? 0;
    const zakatPerMonth = round2(zakatPerYear / 12);

    return {
      nisab,
      totalAnnualIncome,
      ...(totalDeductions !== undefined && { totalDeductions }),
      eligibleIncome: effectiveEligibleIncome,
      zakatContribution,
      amountAfterContribution: amountAfterContribution ?? 0,
      isEligible,
      zakatPerYear,
      zakatPerMonth,
      ...(deductionBreakdown && { deductionBreakdown }),
    };
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}