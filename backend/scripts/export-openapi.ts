import 'reflect-metadata';
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('个人博客 API')
    .setDescription(
      '覆盖学习文章(posts) / 兴趣视频(videos) / 书籍(books) / 项目 / 时间线 / 评论 / 统计，统一响应 { code, message, data }',
    )
    .setVersion('1.0')
    .addServer(process.env.PUBLIC_BASE_URL || 'http://localhost:3000')
    .addTag('posts', '学习文章（article/quiz/coding）')
    .addTag('videos', '兴趣视频')
    .addTag('books', '书籍（3D 阅读器）')
    .addTag('projects', '项目展示')
    .addTag('timeline', '时间线')
    .addTag('comments', '留言')
    .addTag('stats', '浏览量 / 点赞统计')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  await app.close();
  console.log('openapi.json 已导出，可直接导入 Apifox');
}
void bootstrap();
