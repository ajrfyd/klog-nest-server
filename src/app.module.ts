import {
  Module,
  ClassSerializerInterceptor,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './post/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsModule } from './tag/tags.module';
import { Post } from './post/entities/post.entity';
import { Tag } from './tag/entities/tag.entity';
import { LogMiddleware } from './common/middleware/log.middleware';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { User } from './user/entity/user.entity';
import { Room } from './chat/entity/room.entity';
import { Message } from './chat/entity/message.entity';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ForbiddenExceptionFilter } from './common/filter/forbidden.filter';
import { QueryFailedExceptionFilter } from './common/filter/query-failed.filter';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { JwtFailedFilter } from './common/filter/jwt-failed.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT),
    //   username: process.env.DB_USER,
    //   password: process.env.DB_PWD,
    //   database: process.env.DB_NAME,
    //   entities: [Post, Tag, User, Room, Message],
    //   synchronize: process.env.ENV === 'dev' ? true : false,
    //   useUTC: true,
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PWD'),
        database: configService.get('DB_NAME'),
        entities: [Post, Tag, User, Room, Message],
        synchronize: configService.get('ENV') === 'dev' ? true : false,
        timezone: 'KCT',
      }),
      inject: [ConfigService],
    }),
    PostsModule,
    TagsModule,
    ChatModule,
    UserModule,
    AuthModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ForbiddenExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: JwtFailedFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
