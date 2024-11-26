import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Socket } from 'socket.io';

export const WsQueryRunner = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const client: Socket = context.switchToWs().getClient();

    if (!client || !client.data || !client.data.qr)
      throw new InternalServerErrorException(
        'QueryRunner를 찾을 수 없습니다. WsTransactionInterceptor와 같이 사용해 주세요.',
      );

    return client.data.qr;
  },
);
