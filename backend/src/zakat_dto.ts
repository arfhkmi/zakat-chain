export enum CalculationType {
  WITHOUT_DEDUCTIONS = 'WITHOUT_DEDUCTIONS',
  WITH_DEDUCTIONS = 'WITH_DEDUCTIONS',
}

export enum IncomeType {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

// ---------------------------------------------------------------------------
// Without Deductions
// ---------------------------------------------------------------------------
export class WithoutDeductions {
  /** User picks MONTHLY or ANNUAL, then fills one of the two fields below */
  incomeType: IncomeType;

  /** Required when incomeType = MONTHLY */
  monthlyIncome?: number;

  /** Required when incomeType = ANNUAL */
  annualIncome?: number;

  /** Other income: bonus, rental, pension, gifts, etc. (annual lump-sum) */
  otherIncome?: number;

  /** Zakat already deducted by employer / agency (annual) */
  zakatContribution?: number;
}

// ---------------------------------------------------------------------------
// With Deductions
// ---------------------------------------------------------------------------
export class Deductions {
  /** Number of wives, RM 5,000 each, max 4 */
  numberOfWives: number;

  /** Number of children under 18, RM 2,000 each */
  numberOfChildrenUnder18: number;

  /** Number of children 18+ studying, RM 5,000 each */
  numberOfChildrenAbove18Studying: number;

  /** Parents expenses - free-form, user enters own amount */
  parentExpenses: number;

  /** EPF deduction percentage (e.g. 11 for 11%), applied on gross annual salary */
  epfPercentage: number;

  /** Self-education expenses, capped at RM 2,000/year */
  selfEducationExpenses: number;
}

export class WithDeductions {
  incomeType: IncomeType;
  monthlyIncome?: number;
  annualIncome?: number;
  otherIncome?: number;
  zakatContribution?: number;
  deductions: Deductions;
}

// ---------------------------------------------------------------------------
// Main request DTO
// ---------------------------------------------------------------------------
export class ZakatRequestDto {
  calculationType: CalculationType;

  /** Populate when calculationType = WITHOUT_DEDUCTIONS */
  withoutDeductions?: WithoutDeductions;

  /** Populate when calculationType = WITH_DEDUCTIONS */
  withDeductions?: WithDeductions;
}