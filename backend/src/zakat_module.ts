import { Module } from '@nestjs/common';
import { ZakatController } from './zakat_controller';
import { ZakatService } from './zakat_service';
 
@Module({
  controllers: [ZakatController],
  providers: [ZakatService],
  exports: [ZakatService],
})
export class ZakatModule {}