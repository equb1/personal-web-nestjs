import { paginate } from './pagination.dto';

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5];

  it('返回原数组当未传分页参数', () => {
    const result = paginate(items);
    expect(Array.isArray(result)).toBe(true);
    expect(result as number[]).toHaveLength(5);
  });

  it('按 page/pageSize 分页并返回 { list, total, page, pageSize }', () => {
    const result = paginate(items, 2, 2) as {
      list: number[];
      total: number;
      page: number;
      pageSize: number;
    };
    expect(result.list).toEqual([3, 4]);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(2);
  });

  it('越界页返回空 list', () => {
    const result = paginate(items, 99, 2) as { list: number[] };
    expect(result.list).toEqual([]);
  });
});
