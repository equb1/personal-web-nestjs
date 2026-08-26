import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content.module';
import { BookProgress } from './book-progress.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [ContentModule, TypeOrmModule.forFeature([BookProgress])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
