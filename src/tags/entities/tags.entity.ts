import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { PostsModel } from 'src/posts/entities/posts.entity';
import {
  Column,
  Entity,
  Generated,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TagsModel {
  @PrimaryColumn({
    type: 'uuid',
  })
  @Generated('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 30 })
  @IsString({
    message: '태그는 문자열 입니다.',
  })
  label: string;

  @ManyToMany(() => PostsModel, (post) => post.tags)
  @JoinTable()
  posts: PostsModel[];
}
