import client from './client';
import type {
  Category,
  MenuItem,
  MenuCreateRequest,
  MenuUpdateRequest,
  CategoryCreateRequest,
  SubCategoryCreateRequest,
  SubCategory,
  MenuOrderUpdateRequest,
  ImageUploadResponse,
} from '@/types/menu';
import type { ApiResponseV2 } from '@/types/api';

// ─── 카테고리 ───

/** 카테고리 목록 조회 - GET /api/stores/{storeId}/categories */
export async function getCategories(storeId: number): Promise<Category[]> {
  const { data } = await client.get<ApiResponseV2<Category[]>>(
    `/stores/${storeId}/categories`,
  );
  return data.data;
}

/** 대분류 생성 - POST /api/stores/{storeId}/categories */
export async function createCategory(
  storeId: number,
  req: CategoryCreateRequest,
): Promise<Category> {
  const { data } = await client.post<ApiResponseV2<Category>>(
    `/stores/${storeId}/categories`,
    req,
  );
  return data.data;
}

/** 소분류 생성 - POST /api/stores/{storeId}/categories/{categoryId}/subcategories */
export async function createSubCategory(
  storeId: number,
  categoryId: number,
  req: SubCategoryCreateRequest,
): Promise<SubCategory> {
  const { data } = await client.post<ApiResponseV2<SubCategory>>(
    `/stores/${storeId}/categories/${categoryId}/subcategories`,
    req,
  );
  return data.data;
}

/** 카테고리 수정 - PUT /api/stores/{storeId}/categories/{categoryId} */
export async function updateCategory(
  storeId: number,
  categoryId: number,
  req: CategoryCreateRequest,
): Promise<Category> {
  const { data } = await client.put<ApiResponseV2<Category>>(
    `/stores/${storeId}/categories/${categoryId}`,
    req,
  );
  return data.data;
}

/** 카테고리 삭제 - DELETE /api/stores/{storeId}/categories/{categoryId} */
export async function deleteCategory(
  storeId: number,
  categoryId: number,
): Promise<void> {
  await client.delete(`/stores/${storeId}/categories/${categoryId}`);
}

// ─── 메뉴 ───

/** 메뉴 목록 조회 - GET /api/stores/{storeId}/menus */
export async function getMenuItems(
  storeId: number,
  subCategoryId?: number,
): Promise<MenuItem[]> {
  const { data } = await client.get<ApiResponseV2<MenuItem[]>>(
    `/stores/${storeId}/menus`,
    { params: subCategoryId ? { subCategoryId } : {} },
  );
  return data.data;
}

/** 메뉴 상세 조회 - GET /api/stores/{storeId}/menus/{menuId} */
export async function getMenuItem(
  storeId: number,
  menuId: number,
): Promise<MenuItem> {
  const { data } = await client.get<ApiResponseV2<MenuItem>>(
    `/stores/${storeId}/menus/${menuId}`,
  );
  return data.data;
}

/** 메뉴 등록 - POST /api/stores/{storeId}/menus */
export async function createMenuItem(
  storeId: number,
  req: MenuCreateRequest,
): Promise<MenuItem> {
  const { data } = await client.post<ApiResponseV2<MenuItem>>(
    `/stores/${storeId}/menus`,
    req,
  );
  return data.data;
}

/** 메뉴 수정 - PUT /api/stores/{storeId}/menus/{menuId} */
export async function updateMenuItem(
  storeId: number,
  menuId: number,
  req: MenuUpdateRequest,
): Promise<MenuItem> {
  const { data } = await client.put<ApiResponseV2<MenuItem>>(
    `/stores/${storeId}/menus/${menuId}`,
    req,
  );
  return data.data;
}

/** 메뉴 삭제 - DELETE /api/stores/{storeId}/menus/{menuId} */
export async function deleteMenuItem(
  storeId: number,
  menuId: number,
): Promise<void> {
  await client.delete(`/stores/${storeId}/menus/${menuId}`);
}

/** 메뉴 노출 순서 변경 - PUT /api/stores/{storeId}/menus/order */
export async function updateMenuOrder(
  storeId: number,
  req: MenuOrderUpdateRequest,
): Promise<void> {
  await client.put(`/stores/${storeId}/menus/order`, req);
}

/** 메뉴 이미지 업로드 - POST /api/stores/{storeId}/menus/{menuId}/image */
export async function uploadMenuImage(
  storeId: number,
  menuId: number,
  file: File,
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await client.post<ApiResponseV2<ImageUploadResponse>>(
    `/stores/${storeId}/menus/${menuId}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}
