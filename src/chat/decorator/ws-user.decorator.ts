import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

export const WsUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const client: Socket = context.switchToWs().getClient();
    if (!client || !client.data || !client.data.user)
      throw new WsException('Socket 연결이 생성되지 않았습니다.');

    // throw new WsException('Test!!!');
    return client.data.user;
  },
);
