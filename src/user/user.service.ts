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

  async createUser(token) {
    const { nickname, password } =
      this.authService.basicTokenParseHandler(token);

    const possibleToCreate = await this.isExistUser(nickname);
    if (possibleToCreate)
      throw new ConflictException('이미 존재하는 닉네임 입니다.');

    const hashed = await bcrypt.hash(password, +process.env.HASH_ROUNDS);

    const user = this.userRepository.create({ nickname, password: hashed });
    return await this.userRepository.save(user);
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