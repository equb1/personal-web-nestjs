import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: '页码，从 1 开始',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginate<T>(
  items: T[],
  page?: number,
  pageSize?: number,
): T[] | PaginatedResult<T> {
  if (page == null && pageSize == null) return items;
  const currentPage = page ?? 1;
  const size = pageSize ?? 20;
  const start = (currentPage - 1) * size;
  return {
    list: items.slice(start, start + size),
    total: items.length,
    page: currentPage,
    pageSize: size,
  };
}
