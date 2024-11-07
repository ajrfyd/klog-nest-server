import { IsString, IsUUID } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {
  // @IsString()
  // @IsUUID()
  // id: string;
}
