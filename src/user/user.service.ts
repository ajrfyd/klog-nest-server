import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { getRemainingTime } from 'src/common/utils/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject()
    private readonly authService: AuthService,
  ) {}

  async getUsers() {
    return await this.userRepository.find();
  }

  async login(rawToken: string, res: Response) {
    const { nickname, password } =
      this.authService.basicTokenParseHandler(rawToken);
    const user = await this.authService.authenticate(nickname, password);

    const refreshToken = await this.authService.issueTokenHandler(user, true);

    res.cookie('rt', refreshToken, {
      maxAge: getRemainingTime(new Date(Date.now())), // MS
      httpOnly: true, // prevent XSS attacks cross-site scripting attacks
      // sameSite: 'lax', // CSRF attacks cross-site request forgery attacks
      sameSite: 'none', // CSRF attacks cross-site request forgery attacks
      secure: process.env.NODE_ENV !== 'development',
      signed: true,
      // path: '/',
      //& path 시도 해 보자
    });

    return {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      accessToken: await this.authService.issueTokenHandler(user),
      refreshToken,
    };
  }
  // async createUser(body: CreateUserDto) {
  //   const possibleToCreate = await this.isExistUser(body.nickname);
  //   if (possibleToCreate)
  //     throw new ConflictException('이미 존재하는 닉네임 입니다.');
  //   // let user = await this.userRepository.findOne({
  //   //   where: { nickname: body.nickname },
  //   // });

  //   // if (user) throw new ConflictException('이미 존재하는 닉네임 입니다.');
  //   const user = this.userRepository.create(body);
  //   // user = await this.userRepository.create(body);
  //   return await this.userRepository.save(user);
  // }

  async createUser(token: string, res: Response) {
    const { nickname, password } =
      this.authService.basicTokenParseHandler(token);

    const possibleToCreate = await this.isExistUser(nickname);
    if (possibleToCreate)
      throw new ConflictException('이미 존재하는 닉네임 입니다.');

    const hashed = await bcrypt.hash(password, +process.env.HASH_ROUNDS);

    const newUser = this.userRepository.create({ nickname, password: hashed });
    const user = await this.userRepository.save(newUser);

    const refreshToken = await this.authService.issueTokenHandler(user, true);

    res.cookie('rt', refreshToken, {
      maxAge: getRemainingTime(new Date(Date.now())), // MS
      httpOnly: true, // prevent XSS attacks cross-site scripting attacks
      sameSite: 'lax', // CSRF attacks cross-site request forgery attacks
      secure: process.env.NODE_ENV !== 'development',
      signed: true,
      // path: '/',
      //& path 시도 해 보자
    });

    return {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      accessToken: await this.authService.issueTokenHandler(user),
      refreshToken,
    };
  }

  async deleteUser(nickname: string) {
    const isExist = await this.isExistUser(nickname);

    if (!isExist) throw new BadRequestException('존재하지 않는 닉네임입니다.');
    await this.userRepository.delete({ nickname });
    return 1;
  }

  async isExistUser(nickname: string) {
    return !!(await this.userRepository.findOne({ where: { nickname } }));
  }
}
