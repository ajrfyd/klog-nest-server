import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Authorization } from './decorator/authorization.decorator';
import { TokenGuard } from './guard/token.guard';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { RefreshTokenGuard } from './guard/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  userLogin(@Authorization() token: string) {
    return this.authService.login(token);
  }

  @Post('user')
  @UseGuards(TokenGuard)
  authUser(@Authorization() token: string) {
    return this.authService.authenticateUser(token);
  }

  @Post('token/refresh')
  @UseGuards(TokenGuard, RefreshTokenGuard)
  refresh(@UserId() userId: string) {
    return this.authService.reIssueToken(userId);
    // this.authService.issueTokenHandler(user)
  }
}
