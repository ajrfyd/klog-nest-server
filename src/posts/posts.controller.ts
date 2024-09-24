import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { createPostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPost(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.getPostById(id);
  }

  @Post()
  postPost(@Body() body: createPostDto) {
    return this.postsService.createPost(body);
  }
}
