import { Request } from 'express';
import { QueryRunner } from 'typeorm';

declare global {
  namespace Express {
    interface Request {
      isVisited: boolean;
      queryRunner: QueryRunner;
      userId: string;
      tokenType: 'access' | 'refresh';
      autorization: string;
      token: {
        type: 'Bearer' | 'Basic';
        rawToken: string;
      };
    }
  }
}
