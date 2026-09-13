export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface PaginatedQuery {
  page: number
  pageSize: number
}

export type PagedResult<T> = Page<T>
export type ListParams = PaginatedQuery
