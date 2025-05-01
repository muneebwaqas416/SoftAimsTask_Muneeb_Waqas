import { Controller,Post, Body, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AskCloneDto } from './dto/chat.dto';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  async askClone(@Body() askCloneDto: AskCloneDto , @Res() res : Response) {
    const { messages } = askCloneDto;
    const response = await this.chatService.askClone(messages , res);
    return response;
  }
}
