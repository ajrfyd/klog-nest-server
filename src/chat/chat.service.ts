import { BadRequestException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  private readonly connectedClient = new Map<string, Socket>();

  constructor() {}

  registerClient(id: string, client: Socket) {
    this.connectedClient.set(id, client);
  }

  removeClient(id) {
    this.connectedClient.delete(id);
  }
}
