import { Module } from '@nestjs/common';
import { PostsModel } from '../posts/entities/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TagsModel } from 'src/tags/entities/tags.entity';
import { TagsSeederService } from './tags.seeder.service';
import { PostNtagsService } from './postsNtags.seed.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PWD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PostsModel, TagsModel]),
  ],
  // providers: [PostsSeederService, TagsSeederService],
  providers: [PostNtagsService],
})
export class SeederModule {}
