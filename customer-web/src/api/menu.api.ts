import client from './client';
import type { Category, MenuItem } from '@/types/menu';
import type { ApiResponseV2 } from '@/types/api';

/** 카테고리 목록 조회 (대분류 + 소분류) - GET /api/stores/{storeId}/categories */
export async function getCategories(storeId: number): Promise<Category[]> {
  const { data } = await client.get<ApiResponseV2<Category[]>>(
    `/stores/${storeId}/categories`,
  );
  return data.data;
}

/** 메뉴 목록 조회 - GET /api/stores/{storeId}/menus */
export async function getMenus(
  storeId: number,
  subCategoryId?: number,
): Promise<MenuItem[]> {
  const params = subCategoryId ? { subCategoryId } : {};
  const { data } = await client.get<ApiResponseV2<MenuItem[]>>(
    `/stores/${storeId}/menus`,
    { params },
  );
  return data.data;
}

/** 메뉴 상세 조회 - GET /api/stores/{storeId}/menus/{menuId} */
export async function getMenuDetail(
  storeId: number,
  menuId: number,
): Promise<MenuItem> {
  const { data } = await client.get<ApiResponseV2<MenuItem>>(
    `/stores/${storeId}/menus/${menuId}`,
  );
  return data.data;
}
