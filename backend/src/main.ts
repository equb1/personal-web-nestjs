import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Server running at http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
void bootstrap();
