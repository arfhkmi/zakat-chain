export class ZakatFitrahCalculateDto {
  numberOfPersons!: number;
  ratePerPerson!: number;
}

export class ZakatFitrahResponseDto {
  numberOfPersons!: number;
  ratePerPerson!: number;
  totalAmount!: number;
  breakdown!: string;
}
