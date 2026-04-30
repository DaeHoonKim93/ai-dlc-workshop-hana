import { useState, useCallback, useRef } from 'react';
import { getCategories, getMenus } from '@/api/menu.api';
import { useAuth } from './useAuth';
import type { Category, MenuItem } from '@/types/menu';

export function useMenu() {
  const { auth } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categoriesCachedRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    if (!auth.storeId) return;
    if (categoriesCachedRef.current && categories.length > 0) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCategories(auth.storeId);
      setCategories(data);
      categoriesCachedRef.current = true;
    } catch (err) {
      setError('카테고리를 불러올 수 없습니다');
      console.error('fetchCategories error:', err);
    } finally {
      setLoading(false);
    }
  }, [auth.storeId, categories.length]);

  const fetchMenuItems = useCallback(
    async (subCategoryId: number) => {
      if (!auth.storeId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getMenus(auth.storeId, subCategoryId);
        // isAvailable=true인 메뉴만 필터링
        setMenuItems(data.filter((item) => item.isAvailable));
      } catch (err) {
        setError('메뉴를 불러올 수 없습니다');
        console.error('fetchMenuItems error:', err);
      } finally {
        setLoading(false);
      }
    },
    [auth.storeId],
  );

  return {
    categories,
    menuItems,
    loading,
    error,
    fetchCategories,
    fetchMenuItems,
  };
}
