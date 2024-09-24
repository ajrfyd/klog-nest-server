import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsNumber, IsString, MinLength } from 'class-validator';
import { TagsModel } from 'src/tags/entities/tags.entity';

@Entity()
export class PostsModel extends BaseModel {
  @Column({ length: 50, type: 'varchar' })
  @IsString({
    message: '제목은 문자열 입니다.',
  })
  @MinLength(3)
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

  @ManyToMany(() => TagsModel, (tag) => tag.posts)
  @JoinTable()
  tags: TagsModel[];
}
