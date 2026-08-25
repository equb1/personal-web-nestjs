import { Injectable } from '@nestjs/common';
import { ContentReaderService } from '../content-reader.service';
import { TimelineItemDto } from './timeline-item.dto';

@Injectable()
export class TimelineService {
  constructor(private readonly reader: ContentReaderService) {}

  findAll(): TimelineItemDto[] {
    const { timeline } = this.reader.readJson<{ timeline: TimelineItemDto[] }>(
      'timeline.json',
    );
    return timeline ?? [];
  }
}
