import { IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  roomId?: string | null;
}
