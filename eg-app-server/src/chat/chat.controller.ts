import { Controller,Post, Body, Res, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AskCloneDto } from './dto/chat.dto';
import { Response } from 'express';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, Socket } from '@nestjs/websocket';


@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  async askClone(@Body() askCloneDto: AskCloneDto , @Res() res : Response) {
    const { messages } = askCloneDto;
    const response = await this.chatService.askClone(messages , res);
    return response;
  }

  // Handle incoming audio data from the frontend
  @OnGatewayConnection()
  @OnGatewayDisconnect()
  async handleAudioMessage(@MessageBody() audioData: Buffer, client: Socket): Promise<void> {
    console.log('Audio data received');
    // Pass the audio data to the service for processing
    await this.audioCallService.handleAudioData(client, audioData);
  }
}
