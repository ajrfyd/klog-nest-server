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
export class TokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const authorization = req.headers.authorization;

    const [type, token] = authorization.split(' ');
    const path = req.path.split('/');

    if (path.includes('refresh') && type === 'Basic')
      throw new BadRequestException('바르지 않은 토큰 포멧입니다.');

    const decoded = this.jwtService.decode(token);
    console.log(decoded);

    if (!decoded) throw new BadRequestException('Token이 변조된것 같습니다.');

    const { sub, exp, type: tokenType } = decoded;
    const expTime = exp * 1000;
    const current = Date.now();
    const valid = expTime > current;
    // console.log(valid, ' >>>>>', tokenType, decoded);

    if (tokenType === 'access' && !valid)
      throw new UnauthorizedException('AccessToeken 만료');
    if (tokenType === 'refresh' && !valid)
      throw new BadRequestException(
        'Refresh Token의 만료기간이 지났습니다. 다시 로그인 해 주세요.',
      );

    req.userId = sub;
    req.tokenType = tokenType;

    return !!token;
  }
}

// @Injectable()
// export class TokenGuardFactory {
//   create(type: 'Bearer' | 'Basic'): typeof TokenGuard {
//     return new TokenGuard(type);
//   }
// }
