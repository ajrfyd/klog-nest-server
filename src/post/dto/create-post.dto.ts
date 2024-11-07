import { IsOptional, IsString } from 'class-validator';

// export class createPostDto extends PickType(PostsModel, ['title', 'body']) {
//   @IsString({
//     each: true,
//   })
//   @IsOptional()
//   tags?: string[] = [];
// }

export class CreatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsString({
    each: true,
  })
  @IsOptional()
  tags?: string[] = [];
}
