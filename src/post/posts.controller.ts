import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CookieInterceptor } from 'src/common/interceptor/visit-cookie.interceptor';
import { HasCookieDecorator } from 'src/common/decorator/cookie-parse.decorator';
import { Request, Response } from 'express';
import { DeletePostDto } from './dto/delete-post.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
@UseInterceptors(CookieInterceptor)
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getPosts() {
    return this.postService.getAllPosts();
  }
  // getPosts(@Res({ passthrough: true }) res: Response) {
  //   res.cookie('test', 'd', {
  //     maxAge: 60 * 1000, // MS
  //     httpOnly: true, // prevent XSS attacks cross-site scripting attacks
  //     sameSite: 'lax', // CSRF attacks cross-site request forgery attacks
  //     // sameSite: "none",
  //     secure: process.env.NODE_ENV !== 'development',
  //     signed: true,
  //   });
  //   return this.postService.getAllPosts();
  // }

  @Get(':id')
  getPost(
    @Param('id', ParseUUIDPipe) id: string,
    @HasCookieDecorator() isVisited: boolean,
    @Req() req: Request,
  ) {
    console.log(req.cookies, '<><><');
    console.log(req.signedCookies, '<><><><');
    return this.postService.getPostById(id, isVisited);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postPost(@Body() body: CreatePostDto, @QueryRunner() qr: QR) {
    return this.postService.createPost(body, qr);
  }

  @Patch(':id')
  @UseInterceptors(TransactionInterceptor)
  patchPost(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
    @QueryRunner() qr: QR,
  ) {
    return this.postService.updatePost(id, body, qr);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseUUIDPipe) id: string) {
    return this.postService.deletePost(id);
  }
}
