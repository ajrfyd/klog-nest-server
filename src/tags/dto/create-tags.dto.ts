import { IsString, IsUUID } from 'class-validator';

export class createTagsDto {
  @IsString()
  @IsUUID()
  postId: string;

  @IsString({ message: '태그는 문자열로 작성해 주세요.' })
  tags: string[];
}
