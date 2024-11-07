import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Tag } from 'src/tag/entities/tag.entity';
import { TagsService } from 'src/tag/tags.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
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

  async createPost(post: CreatePostDto, qr: QueryRunner) {
    let newPost;
    if (!post.tags.length) {
      // newPost = await this.postRepository.create({
      //   ...post,
      //   tags: [],
      // });

      newPost = qr.manager.create(Post, {
        ...post,
        tags: [],
      });
    } else {
      const tags = await this.tagService.qrFindOrCreateTag(post.tags, qr);

      newPost = await qr.manager.create(Post, {
        ...post,
        tags: tags,
      });

      // const tags = await this.tagService.findOrCreateTag(post.tags);
      // newPost = await this.postRepository.create({
      //   ...post,
      //   tags: tags,
      // });
    }

    // return this.postRepository.save(newPost);
    return await qr.manager.save(Post, newPost);
  }

  async updatePost(id: string, body: UpdatePostDto, qr: QueryRunner) {
    const post = await qr.manager.findOne(Post, {
      where: { id },
      relations: ['tags'],
    });
    if (!post)
      throw new NotFoundException('해당되는 게시글이 존재하지 않습니다.');

    const { tags, ...rest } = body;

    Object.assign(post, rest);

    let newTags = [];
    if (tags.length) {
      newTags = await this.tagService.qrFindOrCreateTag(tags, qr);
      post.tags = newTags;
    }

    // await qr.manager.update(Post, id, {
    //   ...post,
    //   ...body,
    //   ...(newTags.length ? { tags: newTags } : {}),
    // });
    // return post;
    return await qr.manager.save(Post, post);
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
