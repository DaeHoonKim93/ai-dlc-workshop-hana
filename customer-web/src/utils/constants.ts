/** localStorage 키 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  STORE_ID: 'storeId',
  TABLE_ID: 'tableId',
  CART_ITEMS: 'cart_items',
  LANGUAGE: 'language',
} as const;

/** 주문 성공 후 리다이렉트 대기 시간 (초) */
export const ORDER_SUCCESS_REDIRECT_SECONDS = 5;

/** 페이지네이션 기본 사이즈 */
export const DEFAULT_PAGE_SIZE = 20;

/** 이미지 플레이스홀더 */
export const PLACEHOLDER_IMAGE = '/images/placeholder-menu.svg';
