import { Module } from '@nestjs/common';
import { ZakatModule } from './zakat_module';
 
@Module({
  imports: [ZakatModule],
})
export class AppModule {}
 