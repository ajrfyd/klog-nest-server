import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { WebSocketAuthMiddleware } from './middleware/ws-auth.middleware';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { WsAuthGuard } from './guard/ws-auth.guard';
import { WsUser } from './decorator/ws-user.decorator';
import { WsTransactionInterceptor } from './interceptor/ws-transaction.interceptop';
import { WsQueryRunner } from './decorator/ws-query-runner.decorator';
import { QueryRunner } from 'typeorm';
import { type TokenUser } from 'src/common/types/types';
import { CreateMessageDto } from './dto/create-message.dto';
import { WsRoom } from './decorator/ws-room.decorator';
import { Room } from './entity/room.entity';

@WebSocketGateway({
  cors: {
    origin: ['https://blog.hkound.pe.kr'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  },
  secure: true,
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly wsAuthMiddleware: WebSocketAuthMiddleware,
  ) {}

  afterInit(server: Server) {
    console.log('after Iintit!!');
    server.use(this.wsAuthMiddleware.use.bind(this.wsAuthMiddleware));
    // this.server.use(this.wsAuthMiddleware.use.bind(this.wsAuthMiddleware));
  }

  async handleConnection(client: Socket, ...args: any) {
    try {
      if (client && client.data && client.data.user) {
        this.chatService.registerClient(client.data.user.id, client);
        console.log(
          this.chatService.getClientLength(),
          '<<<<< person connected : ',
          this.chatService.getClientsDetail().map((u) => u.nickname),
        );
        await this.chatService.joinRoom(client);
        // console.log(client.rooms, client.id);
      }
    } catch (e) {
      console.log(e.name, e.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.chatService.removeClient(client.data.user.id);
    console.log(
      'Disconnect!!',
      client.id,
      this.chatService.getClientsDetail().length,
      this.chatService.getClientsDetail().map((u) => u.nickname),
    );
  }

  @SubscribeMessage('get-rooms')
  async getRooms(@WsUser() user: TokenUser) {
    return this.chatService.getRooms(user);
  }

  @SubscribeMessage('init-room')
  initRoom(
    @WsRoom() data: { user: TokenUser; rooms: Room[] },
    @ConnectedSocket() client: Socket,
  ) {
    return this.chatService.initRoom(data, client);
  }

  @SubscribeMessage('send-message')
  @UseGuards(WsAuthGuard)
  @UseInterceptors(WsTransactionInterceptor)
  async sendMessage(
    @MessageBody() body: CreateMessageDto,
    @WsUser() user: TokenUser,
    @ConnectedSocket() socket: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    // const { id } = socket;
    const result = await this.chatService.createMessage(body, user, qr);
    const [roomId, message] = result;
    this.server.to(roomId.toString()).emit('new-message', message);
    // return this.chatService.createMessage(body, user, qr);
  }

  @SubscribeMessage('get-messages')
  @UseGuards(WsAuthGuard)
  getMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: string,
  ) {
    if (!roomId) throw new WsException('roomId가 필요 합니다.');
    return this.chatService.getMessages(socket, roomId);
  }
}
