import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export const WsRoom = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const client = context.switchToWs().getClient();
    if (!client || !client.data || !client.data.rooms || !client.data.user)
      throw new WsException('Socket');

    const { user, rooms } = client.data;
    return { user, rooms };
  },
);
