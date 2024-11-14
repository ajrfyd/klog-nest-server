import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Response as Res } from 'express';

export const Response = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const res: Res = context.switchToHttp().getResponse();
    return res;
  },
);
