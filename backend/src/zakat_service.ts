import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ZakatRequestDto,
  CalculationType,
  IncomeType,
  WithoutDeductions,
  WithDeductions,
} from './zakat_dto';

const NISAB_2026 = 33_996;
const ZAKAT_RATE = 0.025;

const DEDUCTION_RATES = {
  selfAllowance: 12_000,        
  perWife: 5_000,               // max 4 wives
  perChildUnder18: 2_000,
  perChildAbove18Studying: 5_000,
  selfEducationCap: 2_000,
};

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------
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
  calculate(dto: ZakatRequestDto): ZakatResult {
    switch (dto.calculationType) {
      case CalculationType.WITHOUT_DEDUCTIONS:
        if (!dto.withoutDeductions) {
          throw new BadRequestException(
            'withoutDeductions object is required for WITHOUT_DEDUCTIONS mode.',
          );
        }
        return this.calculateWithoutDeductions(dto.withoutDeductions);

      case CalculationType.WITH_DEDUCTIONS:
        if (!dto.withDeductions) {
          throw new BadRequestException(
            'withDeductions object is required for WITH_DEDUCTIONS mode.',
          );
        }
        return this.calculateWithDeductions(dto.withDeductions);

      default:
        throw new BadRequestException('Invalid calculationType.');
    }
  }

  // -------------------------------------------------------------------------
  // Mode 1: Without Deductions
  // -------------------------------------------------------------------------
  private calculateWithoutDeductions(data: WithoutDeductions): ZakatResult {
    const annualSalary = this.annualize(
      data.incomeType,
      data.monthlyIncome,
      data.annualIncome,
    );

    const otherIncome = data.otherIncome ?? 0;
    const totalAnnualIncome = annualSalary + otherIncome;
    const zakatContribution = data.zakatContribution ?? 0;

    const isEligible = totalAnnualIncome >= NISAB_2026;

    if (!isEligible) {
      return this.buildResult({
        totalAnnualIncome,
        zakatContribution,
        isEligible: false,
      });
    }

    const grossZakat = round2(totalAnnualIncome * ZAKAT_RATE);
    const amountAfterContribution = Math.max(0, grossZakat - zakatContribution);

    return this.buildResult({
      totalAnnualIncome,
      zakatContribution,
      isEligible: true,
      grossZakat,
      amountAfterContribution,
    });
  }

  // -------------------------------------------------------------------------
  // Mode 2: With Deductions
  // -------------------------------------------------------------------------
  private calculateWithDeductions(data: WithDeductions): ZakatResult {
    const annualSalary = this.annualize(
      data.incomeType,
      data.monthlyIncome,
      data.annualIncome,
    );

    const otherIncome = data.otherIncome ?? 0;
    const totalAnnualIncome = annualSalary + otherIncome;
    const zakatContribution = data.zakatContribution ?? 0;

    const d = data.deductions;

    // Clamp inputs
    const numberOfWives = Math.min(Math.max(0, d.numberOfWives ?? 0), 4);
    const numberOfChildrenUnder18 = Math.max(0, d.numberOfChildrenUnder18 ?? 0);
    const numberOfChildrenAbove18Studying = Math.max(0, d.numberOfChildrenAbove18Studying ?? 0);
    const epfPercentage = Math.min(Math.max(0, d.epfPercentage ?? 0), 100);

    // Calculate each deduction
    const selfAllowance = DEDUCTION_RATES.selfAllowance;
    const wives = numberOfWives * DEDUCTION_RATES.perWife;
    const childrenUnder18 = numberOfChildrenUnder18 * DEDUCTION_RATES.perChildUnder18;
    const childrenAbove18Studying = numberOfChildrenAbove18Studying * DEDUCTION_RATES.perChildAbove18Studying;
    const parentExpenses = Math.max(0, d.parentExpenses ?? 0);

    // EPF applies only on salary portion (not otherIncome)
    const epf = round2((epfPercentage / 100) * annualSalary);

    // Self education capped at RM 2,000
    const selfEducation = Math.min(
      Math.max(0, d.selfEducationExpenses ?? 0),
      DEDUCTION_RATES.selfEducationCap,
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
    const isEligible = eligibleIncome >= NISAB_2026;

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
      });
    }

    const grossZakat = round2(eligibleIncome * ZAKAT_RATE);
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
    });
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
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
  }): ZakatResult {
    const {
      totalAnnualIncome,
      totalDeductions,
      eligibleIncome,
      zakatContribution,
      isEligible,
      amountAfterContribution,
      deductionBreakdown,
    } = params;

    const effectiveEligibleIncome = eligibleIncome ?? totalAnnualIncome;
    const zakatPerYear = amountAfterContribution ?? 0;
    const zakatPerMonth = round2(zakatPerYear / 12);

    return {
      nisab: NISAB_2026,
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

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}