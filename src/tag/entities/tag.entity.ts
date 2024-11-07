import { IsString } from 'class-validator';
import { Post } from 'src/post/entities/post.entity';
import {
  Column,
  Entity,
  Generated,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Tag {
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

  @ManyToMany(() => Post, (post) => post.tags)
  @JoinTable()
  posts: Post[];
}
