import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `${req.method} [Req] ${req.url} ${new Date().toLocaleString('ko')}`,
    );

    next();
  }
}
