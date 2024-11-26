import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketAuthMiddleware } from './middleware/ws-auth.middleware';
import { User } from 'src/user/entity/user.entity';
import { Message } from './entity/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User, Message]), JwtModule],
  providers: [ChatGateway, ChatService, WebSocketAuthMiddleware],
})
export class ChatModule {}
