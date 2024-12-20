import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  basicTokenParseHandler(rawToken: string) {
    try {
      const [prefix, token] = rawToken.split(' ');
      if (prefix !== 'Basic')
        throw new BadRequestException('바른 토큰 형식이 아닙니다.');

      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [nickname, password] = decoded.split(':');

      if (!nickname || !password)
        throw new BadRequestException('바른 토큰 형식이 아닙니다.');

      return { nickname, password };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async bearerTokenParseHandler(rawToken: string) {
    try {
      const [prefix, token] = rawToken.split(' ');
      if (prefix.toLowerCase() !== 'bearer')
        throw new BadRequestException('올바른 토큰의 형식이 아닙니다.');
      if (!token) throw new BadRequestException('토큰이 전달되지 않았습니다.');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      return payload;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async bearerTokenParser(rawToken: string) {
    if (!rawToken) throw new BadRequestException('토큰이 전달되지 않았습니다.');

    const payload = await this.jwtService.verifyAsync(rawToken, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    return payload;
  }

  async authenticate(nickname: string, password: string) {
    const user = await this.userRepository.findOne({ where: { nickname } });
    if (!user) throw new NotFoundException('존재하지 않는 닉네임 입니다.');

    const right = await bcrypt.compare(password, user.password);
    if (!right) throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    return user;
  }

  async authenticateUser(token: string) {
    const payload = await this.bearerTokenParseHandler(token);

    return {
      id: payload.sub,
      nickname: payload.nickname,
      role: payload.role,
    };
  }

  async issueTokenHandler(user: User, isRefresh: boolean = false) {
    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        nickname: user.nickname,
        type: isRefresh ? 'refresh' : 'access',
      },
      {
        secret: isRefresh
          ? process.env.REFRESH_TOKEN_SECRET
          : process.env.ACCESS_TOKEN_SECRET,
        expiresIn: isRefresh ? '7d' : '1d',
      },
    );
  }

  async login(rawToken: string) {
    const { nickname, password } = this.basicTokenParseHandler(rawToken);
    const user = await this.authenticate(nickname, password);

    return {
      id: user.id,
      nickname: user.nickname,
      accessToken: await this.issueTokenHandler(user),
      refreshToken: await this.issueTokenHandler(user, true),
    };
  }

  async reIssueToken(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('존재하지 않는 유저 입니다.');

    return {
      accessToken: await this.issueTokenHandler(user),
      refreshToken: await this.issueTokenHandler(user, true),
    };
  }

  async reIssueAccessToken(rawToken: string) {
    const payload = await this.bearerTokenParser(rawToken);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) throw new NotFoundException('존재하지 않는 유저 입니다.');

    return {
      accessToken: await this.issueTokenHandler(user),
    };
  }
}
