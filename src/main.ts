import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('klog-API')
    .setDescription('Individual blog api server')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'DELETE'],
    origin: [
      'http://localhost:3000',
      'https://blog.hkound.pe.kr',
      'https://hkound-next.vercel.app',
      'https://next.hkound.xyz',
    ],
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  app.use(cookieParser(process.env.COOKIE_SECRET));
  // app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT);
}
bootstrap();
