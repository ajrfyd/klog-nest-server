import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const { userId } = req;
    if (!userId)
      throw new BadRequestException('Token Guard와 같이 사용해 주세요.');

    return userId;
  },
);
