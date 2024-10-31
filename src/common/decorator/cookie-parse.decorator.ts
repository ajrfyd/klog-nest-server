import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HasCookieDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return req.isVisited;
  },
);
