import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AudioGateway } from './webSocketGateway';
import { ElevenLabsClient } from "elevenlabs";
import { ConfigModule } from '@nestjs/config';
console.log('apiKEY:', process.env.ELEVENLABS_API_KEY)

@Module({
  imports : [ConfigModule],
  controllers: [ChatController],
  providers: [
    ElevenLabsClient,
    ChatService,
    AudioGateway,
  ],
})
export class ChatModule {}
