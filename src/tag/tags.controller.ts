import { Body, Controller, Get, Post } from '@nestjs/common';
import { TagsService } from './tags.service';
import { createTagsDto } from './dto/create-tags.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  getTags() {
    return this.tagsService.getAllTags();
  }

  @Post()
  postTags(@Body() body: createTagsDto) {
    return this.tagsService.createTags(body);
  }
}
