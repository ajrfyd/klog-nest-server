import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { Repository } from 'typeorm';
import { createPostDto } from './dto/create-post.dto';
import { TagsModel } from 'src/tags/entities/tags.entity';
import { TagsService } from 'src/tags/tags.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postRepository: Repository<PostsModel>,
    private readonly tagService: TagsService,
  ) {}

  async getAllPosts() {
    const res = await this.postRepository.find({
      relations: {
        tags: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return res;
  }

  async getPostById(id: string, isVisited: boolean) {
    // Todo view 숫자 올리기
    const post = await this.postRepository.findOne({
      where: {
        id,
      },
      relations: {
        tags: true,
      },
    });
    if (!post) throw new BadRequestException('존재하지 않는 포스트 입니다.');

    if (!isVisited) post.views = post.views + 1;

    return isVisited ? post : this.postRepository.save(post);
  }

  async createPost(post: createPostDto) {
    let newPost;
    if (!post.tags.length) {
      newPost = await this.postRepository.create({
        ...post,
        tags: [],
      });
    } else {
      const tags = await this.tagService.findOrCreateTag(post.tags);
      newPost = await this.postRepository.create({
        ...post,
        tags: tags,
      });
    }
    return this.postRepository.save(newPost);
  }

  async incrementViewCnt(id: string) {
    const post = await this.postRepository.findOne({ where: { id } });
    post.views = post.views++;
    await this.postRepository.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postRepository.findOne({ where: { id } });
    console.log(post);
    if (!post) throw new BadRequestException('존재하지 않는 게시글 입니다.');

    await this.postRepository.delete(id);

    return id;
  }
}
