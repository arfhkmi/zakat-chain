import { Injectable } from '@nestjs/common';
import { ZakatFitrahCalculateDto, ZakatFitrahResponseDto } from './zakatfitrah_dto';

const SCOPE = 'Kuala Lumpur dan Wilayah Persekutuan';

@Injectable()
export class ZakatFitrahService {
  calculate(dto: ZakatFitrahCalculateDto): ZakatFitrahResponseDto {
    const { numberOfPersons, ratePerPerson } = dto;
    const totalAmount = numberOfPersons * ratePerPerson;
    const personLabel = numberOfPersons === 1 ? 'person' : 'persons';

    return {
      numberOfPersons,
      ratePerPerson,
      totalAmount,
      breakdown: `${numberOfPersons} ${personLabel} × RM ${ratePerPerson} = RM ${totalAmount} (${SCOPE})`,
    };
  }
}