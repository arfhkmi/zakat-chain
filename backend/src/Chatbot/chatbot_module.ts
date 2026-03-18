import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot_controller';
import { ChatbotService } from './chatbot_service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}