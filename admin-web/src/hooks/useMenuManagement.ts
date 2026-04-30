import { useState, useCallback } from 'react';
import {
  getCategories, createCategory, createSubCategory, updateCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, updateMenuOrder, uploadMenuImage,
} from '@/api/menu.api';
import type { Category, MenuItem, MenuCreateRequest, MenuUpdateRequest, CategoryCreateRequest, SubCategoryCreateRequest, MenuOrderItem } from '@/types/menu';
import { showToast } from '@/components/Toast';

export function useMenuManagement(storeId: number | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await getCategories(storeId);
      setCategories(data);
    } catch {
      setError('카테고리를 불러오지 못했습니다.');
    }
  }, [storeId]);

  const fetchMenuItems = useCallback(async (subCategoryId?: number) => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data = await getMenuItems(storeId, subCategoryId);
      setMenuItems(data);
    } catch {
      setError('메뉴를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const addCategory = useCallback(async (req: CategoryCreateRequest) => {
    if (!storeId) return;
    await createCategory(storeId, req);
    showToast('success', '카테고리가 생성되었습니다.');
    await fetchCategories();
  }, [storeId, fetchCategories]);

  const addSubCategory = useCallback(async (categoryId: number, req: SubCategoryCreateRequest) => {
    if (!storeId) return;
    await createSubCategory(storeId, categoryId, req);
    showToast('success', '소분류가 생성되었습니다.');
    await fetchCategories();
  }, [storeId, fetchCategories]);

  const editCategory = useCallback(async (categoryId: number, req: CategoryCreateRequest) => {
    if (!storeId) return;
    await updateCategory(storeId, categoryId, req);
    showToast('success', '카테고리가 수정되었습니다.');
    await fetchCategories();
  }, [storeId, fetchCategories]);

  const removeCategory = useCallback(async (categoryId: number) => {
    if (!storeId) return;
    await deleteCategory(storeId, categoryId);
    showToast('success', '카테고리가 삭제되었습니다.');
    await fetchCategories();
  }, [storeId, fetchCategories]);

  const addMenu = useCallback(async (req: MenuCreateRequest) => {
    if (!storeId) return;
    await createMenuItem(storeId, req);
    showToast('success', '메뉴가 등록되었습니다.');
    await fetchMenuItems(req.subCategoryId);
  }, [storeId, fetchMenuItems]);

  const editMenu = useCallback(async (menuId: number, req: MenuUpdateRequest, subCategoryId?: number) => {
    if (!storeId) return;
    await updateMenuItem(storeId, menuId, req);
    showToast('success', '메뉴가 수정되었습니다.');
    await fetchMenuItems(subCategoryId);
  }, [storeId, fetchMenuItems]);

  const removeMenu = useCallback(async (menuId: number, subCategoryId?: number) => {
    if (!storeId) return;
    await deleteMenuItem(storeId, menuId);
    showToast('success', '메뉴가 삭제되었습니다.');
    await fetchMenuItems(subCategoryId);
  }, [storeId, fetchMenuItems]);

  const changeMenuOrder = useCallback(async (orders: MenuOrderItem[], subCategoryId?: number) => {
    if (!storeId) return;
    await updateMenuOrder(storeId, { menuOrders: orders });
    showToast('success', '순서가 변경되었습니다.');
    await fetchMenuItems(subCategoryId);
  }, [storeId, fetchMenuItems]);

  const uploadImage = useCallback(async (menuId: number, file: File, subCategoryId?: number) => {
    if (!storeId) return;
    await uploadMenuImage(storeId, menuId, file);
    showToast('success', '이미지가 업로드되었습니다.');
    await fetchMenuItems(subCategoryId);
  }, [storeId, fetchMenuItems]);

  return {
    categories, menuItems, loading, error,
    fetchCategories, fetchMenuItems,
    addCategory, addSubCategory, editCategory, removeCategory,
    addMenu, editMenu, removeMenu, changeMenuOrder, uploadImage,
  };
}
