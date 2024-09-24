import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class createPostDto extends PickType(PostsModel, ['title', 'body']) {
  @IsString({
    each: true,
  })
  @IsOptional()
  tags?: string[] = [];
}
