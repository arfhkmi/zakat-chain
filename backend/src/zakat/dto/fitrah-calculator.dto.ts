export class FitrahCalculatorDto {
  numberOfPersons!: number;
  ratePerPerson!: number;
}

export class FitrahResponseDto {
  numberOfPersons!: number;
  ratePerPerson!: number;
  totalAmount!: number;
  breakdown!: string;
}
