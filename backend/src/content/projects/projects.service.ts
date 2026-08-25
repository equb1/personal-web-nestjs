import { Injectable } from '@nestjs/common';
import { ContentReaderService } from '../content-reader.service';
import { ProjectDto } from './project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly reader: ContentReaderService) {}

  findAll(): ProjectDto[] {
    const { projects } = this.reader.readJson<{ projects: ProjectDto[] }>(
      'projects.json',
    );
    return projects ?? [];
  }
}
