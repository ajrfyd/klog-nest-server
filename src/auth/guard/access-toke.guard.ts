import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const { token } = req;

    if (!token) return false;
    const { rawToken, type } = token;
    if (type === 'Basic') throw new BadRequestException('BearerToken Only');
    const decoded = await this.jwtService.decode;

    return true;
  }
}
