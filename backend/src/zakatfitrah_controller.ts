import { Body, Controller, Post } from '@nestjs/common';
import { ZakatFitrahService } from './zakatfitrah_service';
import { ZakatFitrahCalculateDto } from './zakatfitrah_dto';

@Controller('zakat/fitrah')
export class ZakatFitrahController {
  constructor(private readonly zakatFitrahService: ZakatFitrahService) {}

  @Post('calculate')
  calculate(@Body() dto: ZakatFitrahCalculateDto) {
    return this.zakatFitrahService.calculate(dto);
  }
}