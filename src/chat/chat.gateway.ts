import { WebSocketGateway } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket, ...args: any[]) {
    try {
    } catch (e) {
      console.log(e.name, e.message);
      client.disconnect();
    }
  }

  handelDisconnection(client: Socket) {}
}
