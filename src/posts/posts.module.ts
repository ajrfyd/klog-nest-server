import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel]), TagsModule],
  controllers: [PostsController],
  providers: [PostService],
})
export class PostsModule {}
