import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsNumber, IsString, MinLength } from 'class-validator';
import { Tag } from 'src/tag/entities/tag.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Post extends BaseModel {
  @Column({ length: 100, type: 'varchar' })
  @IsString({
    message: '제목은 문자열 입니다.',
  })
  @MinLength(3)
  @ApiProperty({
    description: '블로그 제목',
  })
  title: string;

  @Column({
    type: 'text',
  })
  @IsString({
    message: '본문은 문자열 입니다.',
  })
  @MinLength(5)
  body: string;

  @Column({
    type: 'int',
    default: 0,
  })
  @IsNumber()
  views: number;

  @ManyToMany(() => Tag, (tag) => tag.posts, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: Tag[];
}
