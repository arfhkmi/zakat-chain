import { Module } from '@nestjs/common';
import { ZakatFitrahController } from './zakatfitrah_controller';
import { ZakatFitrahService } from './zakatfitrah_service';

@Module({
  controllers: [ZakatFitrahController],
  providers: [ZakatFitrahService],
})
export class ZakatFitrahModule {}