import { BadRequestException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { getCookieValue } from 'src/common/utils/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../entity/room.entity';
import { In, Repository } from 'typeorm';
import { Role } from 'src/user/entity/user.entity';

@Injectable()
export class WebSocketAuthMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}
  async use(client: Socket, next: (err?: Error) => void) {
    try {
      const userId = client.handshake.auth.id;
      if (!userId) return next(new Error('유저 아이디가 전달되지 않았습니다.'));
      console.log(client.handshake.auth.id);
      console.log(client.handshake.headers);
      const cookieStr = client.handshake.headers.cookie;
      const token = getCookieValue(cookieStr, 'rt');

      if (!token)
        return next(new Error('토큰 형식이 잘못되었거나 전달되지 않았습니다.'));

      const user = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      if (user.sub !== userId) return next(new Error('비정상적인 접근입니다.'));

      client.data.user = {
        id: user.sub,
        role: user.role,
        nickname: user.nickname,
      };

      // client.data.rooms = rooms;
      next();
    } catch (e) {
      next(new Error('Authentication failed'));
    }
  }
}
