import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ZakatService } from './zakat_service';
import type { ZakatResult } from './zakat_service';
import { ZakatRequestDto } from './zakat_dto';
 
@Controller('zakat/pendapatan')
export class ZakatController {
  constructor(private readonly zakatService: ZakatService) {}
 
  @Post('kira')
  @HttpCode(HttpStatus.OK)
  calculate(@Body() dto: ZakatRequestDto): ZakatResult {
    return this.zakatService.calculate(dto);
  }
}