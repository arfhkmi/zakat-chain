import { Module } from '@nestjs/common';
import { ZakatModule } from './zakat_module';
import { ChatbotModule } from './Chatbot/chatbot_module';
import { ZakatFitrahModule } from './zakatfitrah_module';

@Module({
  imports: [
    ZakatModule,
    ChatbotModule,
    ZakatFitrahModule,
  ],
})
export class AppModule {}