import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { PostNtagsService } from './postsNtags.seed.service';

const bootstrap = async () => {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const postNTagSeeder = appContext.get(PostNtagsService);

  await postNTagSeeder.seed();
  console.log('Seeding completed');

  await appContext.close();
};

bootstrap();
