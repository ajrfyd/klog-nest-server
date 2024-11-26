import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const { token } = req;
    const { type: authType, rawToken } = token;

    if (authType.toLowerCase() !== 'bearer')
      throw new BadRequestException('Bearer 토큰이 필요합니다.');
    const { type, exp } = this.jwtService.decode(rawToken);

    if (type !== 'refresh')
      throw new BadRequestException('Refresh token이 필요 합니다.');

    const now = Date.now();
    const expired = now > exp * 1000;
    if (expired) throw new UnauthorizedException('Refresh Token 만료.');

    return true;
  }
}
