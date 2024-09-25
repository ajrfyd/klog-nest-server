import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { createPostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getPosts() {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  getPost(@Param('id', ParseUUIDPipe) id: string) {
    return this.postService.getPostById(id);
  }

  @Post()
  postPost(@Body() body: createPostDto) {
    return this.postService.createPost(body);
  }
}
