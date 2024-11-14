import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { Response } from './decorator/response.decorator';
import { Response as Res } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Post('login')
  login(@Authorization() token: string, @Response() res: Res) {
    return this.userService.login(token, res);
  }

  // @Post('register')
  // postUser(@Body() body: CreateUserDto) {
  //   return this.userService.createUser(body);
  // }

  @Post('register')
  postUser(@Authorization() token: string, @Response() res: Res) {
    return this.userService.createUser(token, res);
  }

  @Delete()
  deleteUser(@Body('nickname') nickname: string) {
    return this.userService.deleteUser(nickname);
  }
}
