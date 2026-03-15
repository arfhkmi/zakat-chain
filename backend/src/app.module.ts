import { Module } from '@nestjs/common';
import { ZakatModule } from './zakat_module';
import { ChatbotModule } from './Chatbot/chatbot_module';

@Module({
  imports: [ZakatModule, ChatbotModule],
})
export class AppModule {}