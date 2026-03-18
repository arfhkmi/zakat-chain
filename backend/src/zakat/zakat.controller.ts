import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { IncomeCalculatorDto } from './dto/income-calculator.dto';
import { FitrahCalculatorDto } from './dto/fitrah-calculator.dto';

@Controller('zakat')
export class ZakatController {
  constructor(private readonly zakatService: ZakatService) {}

  @Post('income/calculate')
  @HttpCode(HttpStatus.OK)
  incomeCalculate(@Body() dto: IncomeCalculatorDto) {
    return this.zakatService.calculateIncome(dto);
  }

  @Post('fitrah/calculate')
  @HttpCode(HttpStatus.OK)
  fitrahCalculate(@Body() dto: FitrahCalculatorDto) {
    return this.zakatService.calculateFitrah(dto);
  }
}
