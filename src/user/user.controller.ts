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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  // @Post('register')
  // postUser(@Body() body: CreateUserDto) {
  //   return this.userService.createUser(body);
  // }

  @Post('register')
  postUser(@Authorization() token: string) {
    return this.userService.createUser(token);
  }

  @Delete()
  deleteUser(@Body('nickname') nickname: string) {
    return this.userService.deleteUser(nickname);
  }
}
