import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { createPostDto } from './dto/create-post.dto';
import { CookieInterceptor } from 'src/common/interceptor/visit-cookie.interceptor';
import { HasCookieDecorator } from 'src/common/decorator/cookie-parse.decorator';
import { Request, Response } from 'express';
import { DeletePostDto } from './dto/delete-post.dto';

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
  ) {
    return this.postService.getPostById(id, isVisited);
  }

  @Post()
  postPost(@Body() body: createPostDto) {
    return this.postService.createPost(body);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseUUIDPipe) id: string) {
    console.log(id);
    return this.postService.deletePost(id);
  }
}
