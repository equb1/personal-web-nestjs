import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectDto } from './project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: '项目展示列表',
    description: '返回 ProjectDto[]（只读，来源于 content/projects.json）',
  })
  @ApiOkResponse({
    type: ProjectDto,
    isArray: true,
    description:
      '统一信封 { code:0, message:"ok", data }；data 为 ProjectDto[]',
  })
  findAll(): ProjectDto[] {
    return this.projectsService.findAll();
  }
}
