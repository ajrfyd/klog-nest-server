import { BadRequestException, Injectable } from '@nestjs/common';
import { createTagsDto } from './dto/create-tags.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { TagType } from 'src/common/types/types';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}
  getAllTags() {
    return this.tagRepository.find({
      relations: {
        posts: true,
      },
      select: {
        posts: {
          id: true,
        },
      },
    });
  }

  async findOrCreateTag(labelArr: string[]): Promise<TagType[]> {
    if (!labelArr.length)
      throw new BadRequestException('입력된 태그가 없습니다.');

    // 모든 태그들
    const savedTags = await this.tagRepository.find();

    // 모든 태그 labe Set화 - {0: '라벨1', 1: '라벨2', 2: '라벨3'...}
    const tagSet = new Set(savedTags.map((tag) => tag.label));

    // ['라벨1', '라벨2'] db에 없는 새로운 태그
    const newOne = labelArr.filter((label) => !tagSet.has(label));

    // const existOne = savedTags.filter((tag) => tagSet.has(tag.label));
    // 존재하는 [{ id: "", label: ""}]
    const existOne = savedTags.filter(
      (tag) =>
        labelArr
          .filter((tag) => tagSet.has(tag))
          .find((v) => v === tag.label) === tag.label,
    );

    const newTags = newOne.map((label) => this.tagRepository.create({ label }));

    if (newTags.length) await this.tagRepository.save(newTags);

    return [...existOne, ...newTags];
  }

  async qrFindOrCreateTag(labelArr: string[], qr: QueryRunner) {
    if (!labelArr.length)
      throw new BadRequestException('입력된 태그가 없습니다.');

    const existTags = await qr.manager.find(Tag, {
      where: {
        label: In(labelArr),
      },
    });

    let newTags: Tag[] = [];

    const toBeSavedTags = labelArr.filter(
      (label) => !existTags.find((tag) => tag.label === label),
    );

    if (toBeSavedTags.length) {
      const savedTags = toBeSavedTags.map((label) =>
        qr.manager.create(Tag, { label }),
      );
      // const newTags = await qr.manager.save(Tag, savedTags);
      newTags = await Promise.all(
        savedTags.map((tag) => qr.manager.save(Tag, tag)),
      );
    }

    return [...existTags, ...newTags];
  }

  createTags({ postId, tags }: createTagsDto) {
    if (!tags.length)
      throw new BadRequestException('태그가 입력되지 않았습니다.');
  }
}
