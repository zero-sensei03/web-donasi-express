export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

export interface PaginationResponse<T = unknown> {
    items: T;
    total: number | null;
    page: number | null;
    limit: number | null;
    totalPages: number | null;
}