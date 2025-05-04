// src/audio/audio.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'audio',
  cors: {
    origin: '*',
  }
})
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Audio client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Audio client disconnected: ${client.id}`);
  }

  @SubscribeMessage('audio-message')
  async handleAudioMessage(client: Socket, audioData: Buffer) {
    await this.chatService.handleAudioData(client, audioData);
  }
}