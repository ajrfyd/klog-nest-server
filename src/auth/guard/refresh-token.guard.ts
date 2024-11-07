import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const { tokenType } = req;

    if (!tokenType)
      throw new BadRequestException('TokenGuard와 같이 사용 해 주세요.');
    if (tokenType === 'access')
      throw new BadRequestException('Refresh Token이 아닙니다.');
    return tokenType === 'refresh';
  }
}
