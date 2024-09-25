import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { TagsModel } from 'src/tags/entities/tags.entity';
import { Repository } from 'typeorm';
import { posts } from './seeder/posts';
import { tags } from './seeder/tags';
import { postNtag } from './seeder/postNtag';
import { arrToKeyObj } from 'src/common/utils/utils';

@Injectable()
export class PostNtagsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postRepository: Repository<PostsModel>,
    @InjectRepository(TagsModel)
    private readonly tagRepository: Repository<TagsModel>,
  ) {}

  async seed() {
    const tags = await this.createTags();
    await this.createPosts(tags);
  }

  private async createTags(): Promise<TagsModel[]> {
    let newTags: TagsModel[] = [];

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

  private async createPosts(tags: TagsModel[]) {
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
}
