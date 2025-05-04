import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AudioGateway } from './webSocketGateway';
import OpenAI from 'openai';
import { ElevenLabsClient, play } from "elevenlabs";

@Module({
  controllers: [ChatController],
  providers: [
    {
      provide: OpenAI,
      useFactory: () => new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }),
    },
    {
      provide: ElevenLabsClient,
      useFactory: () => new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
      }),
    },
    ChatService,
    AudioGateway,
  ],
})
export class ChatModule {}
