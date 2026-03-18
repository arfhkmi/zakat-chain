import { Controller, Post, Body, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot_service';
import { ChatMessageDto } from './chatbot_dto';
import type { ChatResponseDto } from './chatbot_dto';

@Controller('zakat/chat')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * Send a message to the zakat chatbot.
   * Include sessionId in subsequent requests to maintain conversation history.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatMessageDto): Promise<ChatResponseDto> {
    return this.chatbotService.chat(dto);
  }

  /**
   * Clear conversation history for a session.
   */
  @Delete('session/:sessionId')
  @HttpCode(HttpStatus.OK)
  clearSession(@Param('sessionId') sessionId: string): { message: string } {
    this.chatbotService.clearSession(sessionId);
    return { message: `Session ${sessionId} cleared.` };
  }
}