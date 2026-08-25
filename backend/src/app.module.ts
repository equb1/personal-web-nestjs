import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Comment } from './comments/comment.entity';
import { CommentsModule } from './comments/comments.module';
import { BooksModule } from './content/books/books.module';
import { PostsModule } from './content/posts/posts.module';
import { ProjectsModule } from './content/projects/projects.module';
import { TimelineModule } from './content/timeline/timeline.module';
import { VideosModule } from './content/videos/videos.module';
import { PostStats } from './stats/post-stats.entity';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.STATIC_DIR ?? 'static'),
      serveRoot: '/static',
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(process.cwd(), process.env.DB_PATH ?? 'data/app.db'),
      entities: [Comment, PostStats],
      synchronize: true,
    }),
    PostsModule,
    VideosModule,
    BooksModule,
    ProjectsModule,
    TimelineModule,
    CommentsModule,
    StatsModule,
  ],
})
export class AppModule {}
