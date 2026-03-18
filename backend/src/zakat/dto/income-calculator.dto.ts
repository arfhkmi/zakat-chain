export enum CalculationType {
  WITHOUT_DEDUCTIONS = 'WITHOUT_DEDUCTIONS',
  WITH_DEDUCTIONS = 'WITH_DEDUCTIONS',
}

export enum IncomeType {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

// Without Deductions
export class WithoutDeductions {
  incomeType!: IncomeType;
  monthlyIncome?: number;
  annualIncome?: number;
  otherIncome?: number;
  zakatContribution?: number;
}

// With Deductions
export class Deductions {
  numberOfWives!: number;
  numberOfChildrenUnder18!: number;
  numberOfChildrenAbove18Studying!: number;
  parentExpenses!: number;
  epfPercentage!: number;
  selfEducationExpenses!: number;
}

export class WithDeductions {
  incomeType!: IncomeType;
  monthlyIncome?: number;
  annualIncome?: number;
  otherIncome?: number;
  zakatContribution?: number;
  deductions!: Deductions;
}

// Rates from contract incomeInfo()
export class IncomeRates {
  rate!: number;
  threshold!: number;
  selfDeduction!: number;
  wifeDeduction!: number;
  childMinorDeduction!: number;
  childStudyDeduction!: number;
  studyMaxDeduction!: number;
}

// Main request DTO
export class IncomeCalculatorDto {
  calculationType!: CalculationType;
  rates!: IncomeRates;
  withoutDeductions?: WithoutDeductions;
  withDeductions?: WithDeductions;
}
