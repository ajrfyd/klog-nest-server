import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Repository } from 'typeorm';
import { posts } from './seeder/posts';
import { tags } from './seeder/tags';
import { postNtag } from './seeder/postNtag';
import { arrToKeyObj } from 'src/common/utils/utils';
import { user } from './seeder/user';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class PostNtagsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    const tags = await this.createTags();
    await this.createPosts(tags);
    await this.createUser();
  }

  private async createTags(): Promise<Tag[]> {
    let newTags: Tag[] = [];

    for (const tag of tags) {
      let savedTag = await this.tagRepository.findOne({
        where: { id: tag.id },
      });
      if (!savedTag) {
        savedTag = this.tagRepository.create(tag);
        await this.tagRepository.save(savedTag);
      }

      newTags.push(savedTag);
    }

    return newTags;
  }

  private async createPosts(tags: Tag[]) {
    const keyObj = arrToKeyObj(tags);

    for (const post of posts) {
      const existPost = await this.postRepository.findOne({
        where: { id: post.id },
      });

      if (!existPost) {
        const toBeSavedTags = postNtag
          .filter((a) => a.postId === post.id)
          .map((t) => t.tagId)
          .map((t) => keyObj[t]);

        const newPost = this.postRepository.create(post);
        newPost.tags = this.tagRepository.create(toBeSavedTags);

        await this.postRepository.save(newPost);
      }
    }
  }

  private async createUser() {
    await this.userRepository.save(user);
  }
}
