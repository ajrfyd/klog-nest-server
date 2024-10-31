import { IsString, IsUUID } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsUUID()
  id: string;
}
