import { Module } from '@nestjs/common';
import { ChatbotModule } from './Chatbot/chatbot_module';
import { AuthModule } from './auth/auth_module';
import { ZakatModule } from './zakat/zakat.module';

@Module({
  imports: [
    ZakatModule,
    ChatbotModule,
    AuthModule,
  ],
})
export class AppModule {}