export class ChatMessageDto {
  message: string;
 
  /** Optional session ID to maintain conversation history.
   *  If not provided, each request is treated as a new conversation. */
  sessionId?: string;
}
 
export interface ChatResponseDto {
  sessionId: string;
  reply: string;
}
 
export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
 