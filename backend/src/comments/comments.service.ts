import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, PaginatedResult } from '../common/dto/pagination.dto';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>,
  ) {}

  async findAll(
    page?: number,
    pageSize?: number,
  ): Promise<Comment[] | PaginatedResult<Comment>> {
    const comments = await this.repo.find({ order: { id: 'DESC' } });
    return paginate(comments, page, pageSize);
  }

  async create(dto: CreateCommentDto): Promise<Comment> {
    const comment = this.repo.create({
      author: dto.author,
      avatar: dto.avatar ?? null,
      content: dto.content,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
    });
    return this.repo.save(comment);
  }
}
