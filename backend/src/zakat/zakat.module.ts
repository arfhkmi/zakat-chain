import { Module } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { ZakatController } from './zakat.controller';

@Module({
  controllers: [ZakatController],
  providers: [ZakatService],
})
export class ZakatModule {}
