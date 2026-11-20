import { type PageQuery, type PaginatedDto } from "@origo/shared";

export interface PageWindow {
  skip: number;
  take: number;
}

export const pageWindow = (query: PageQuery): PageWindow => ({
  skip: (query.page - 1) * query.pageSize,
  take: query.pageSize,
});

export const toPage = <T>(items: T[], total: number, query: PageQuery): PaginatedDto<T> => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  total,
  pageCount: Math.ceil(total / query.pageSize),
});
