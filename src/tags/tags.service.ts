import { BadRequestException, Injectable } from '@nestjs/common';
import { createTagsDto } from './dto/create-tags.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsModel } from './entities/tags.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagsModel)
    private readonly tagsRepository: Repository<TagsModel>,
  ) {}
  getAllTags() {
    return this.tagsRepository.find({
      relations: {
        posts: true,
      },
    });
  }

  async findOrCreateTag(
    labelArr: string[],
  ): Promise<{ id: string; label: string }[]> {
    if (!labelArr.length)
      throw new BadRequestException('입력된 태그가 없습니다.');

    // 모든 태그들
    const savedTags = await this.tagsRepository.find();

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

    const newTags = newOne.map((label) =>
      this.tagsRepository.create({ label }),
    );

    if (newTags.length) await this.tagsRepository.save(newTags);

    return [...existOne, ...newTags];
  }

  createTags({ postId, tags }: createTagsDto) {
    if (!tags.length)
      throw new BadRequestException('태그가 입력되지 않았습니다.');
  }
}
