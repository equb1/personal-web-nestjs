import { Module } from '@nestjs/common';
import { ContentReaderService } from './content-reader.service';

@Module({
  providers: [ContentReaderService],
  exports: [ContentReaderService],
})
export class ContentModule {}
