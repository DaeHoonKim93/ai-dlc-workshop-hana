/** 공통 API 성공 응답 래퍼 (Unit1 스타일) */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: ApiError | null;
}

/** 공통 API 성공 응답 래퍼 (Unit2 스타일) */
export interface ApiResponseV2<T> {
  success: boolean;
  data: T;
  message: string | null;
}

/** API 에러 (Unit1) */
export interface ApiError {
  code: string;
  message: string;
}

/** API 에러 (Unit2) */
export interface ApiErrorV2 {
  success: false;
  data: null;
  message: string;
  errorCode: string;
}

/** 페이지네이션 응답 */
export interface PaginatedData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last: boolean;
}
