import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request } from 'express';

type TokenType = 'Bearer' | 'Basic';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  use(req: Request, res: any, next: (error?: Error | any) => void) {
    let { authorization } = req.headers;
    if (!authorization) {
      const { rt } = req.cookies;
      if (!rt)
        throw new BadRequestException('요청에 Token이 존재하지 않습니다.');
      authorization = `Bearer ${rt}`;
    }

    try {
      const [type, rawToken] = authorization.split(' ');

      req.token = {
        rawToken,
        type: type as TokenType,
      };
      next();
    } catch (e) {
      console.warn(e.message, e.title);
      throw new BadRequestException(e);
    }
  }
}
