import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/hooks/useCart';
import { LoadingSpinner, ErrorMessage, showToast } from '@/components';
import type { MenuItem } from '@/types/menu';
import styles from './MenuPage.module.css';
import { formatPrice } from '@/utils/format';
import { PLACEHOLDER_IMAGE } from '@/utils/constants';

export default function MenuPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories, menuItems, loading, error, fetchCategories, fetchMenuItems } = useMenu();
  const { addItem, itemCount, totalAmount } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  // 카테고리 로드
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 첫 번째 카테고리 자동 선택
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      const first = categories[0];
      if (first) {
        setSelectedCategoryId(first.id);
        if (first.subCategories.length > 0 && first.subCategories[0]) {
          setSelectedSubCategoryId(first.subCategories[0].id);
        }
      }
    }
  }, [categories, selectedCategoryId]);

  // 소분류 변경 시 메뉴 로드
  useEffect(() => {
    if (selectedSubCategoryId) {
      fetchMenuItems(selectedSubCategoryId);
    }
  }, [selectedSubCategoryId, fetchMenuItems]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    const cat = categories.find((c) => c.id === categoryId);
    if (cat && cat.subCategories.length > 0 && cat.subCategories[0]) {
      setSelectedSubCategoryId(cat.subCategories[0].id);
    } else {
      setSelectedSubCategoryId(null);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    showToast('success', t('menu.addedToCart'));
  };

  return (
    <div className={styles.container}>
      {/* 대분류 카테고리 */}
      <nav className={styles.categoryNav} aria-label="카테고리">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.categoryTab} ${cat.id === selectedCategoryId ? styles.active : ''}`}
            onClick={() => handleCategorySelect(cat.id)}
            type="button"
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* 소분류 카테고리 */}
      {selectedCategory && selectedCategory.subCategories.length > 0 && (
        <div className={styles.subCategoryTabs}>
          {selectedCategory.subCategories.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.subTab} ${sub.id === selectedSubCategoryId ? styles.active : ''}`}
              onClick={() => setSelectedSubCategoryId(sub.id)}
              type="button"
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* 메뉴 그리드 */}
      <main className={styles.menuGrid}>
        {loading && <LoadingSpinner message={t('common.loading')} />}
        {error && <ErrorMessage message={error} onRetry={() => selectedSubCategoryId && fetchMenuItems(selectedSubCategoryId)} />}
        {!loading && !error && menuItems.length === 0 && (
          <p className={styles.emptyMessage}>{t('menu.empty')}</p>
        )}
        {!loading &&
          menuItems.map((item) => (
            <div key={item.id} className={styles.menuCard} onClick={() => setDetailItem(item)}>
              <img
                src={item.imageUrl || PLACEHOLDER_IMAGE}
                alt={item.name}
                className={styles.menuImage}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
              />
              <div className={styles.menuInfo}>
                <p className={styles.menuName}>{item.name}</p>
                <p className={styles.menuPrice}>{formatPrice(item.price)}</p>
              </div>
              <button
                className={styles.addBtn}
                onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                type="button"
                aria-label={`${item.name} ${t('menu.addToCart')}`}
              >
                {t('menu.addToCart')}
              </button>
            </div>
          ))}
      </main>

      {/* 메뉴 상세 모달 */}
      {detailItem && (
        <div className={styles.modalOverlay} onClick={() => setDetailItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <img
              src={detailItem.imageUrl || PLACEHOLDER_IMAGE}
              alt={detailItem.name}
              className={styles.modalImage}
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
            />
            <h2 className={styles.modalName}>{detailItem.name}</h2>
            <p className={styles.modalPrice}>{formatPrice(detailItem.price)}</p>
            {detailItem.description && (
              <p className={styles.modalDesc}>{detailItem.description}</p>
            )}
            <div className={styles.modalActions}>
              <button className={styles.modalCloseBtn} onClick={() => setDetailItem(null)} type="button">
                {t('common.cancel')}
              </button>
              <button
                className={styles.modalAddBtn}
                onClick={() => { handleAddToCart(detailItem); setDetailItem(null); }}
                type="button"
              >
                {t('menu.addToCart')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 장바구니 플로팅 버튼 */}
      {itemCount > 0 && (
        <button
          className={styles.cartFloat}
          onClick={() => navigate('/cart')}
          type="button"
          aria-label={`장바구니 ${itemCount}개`}
        >
          🛒 {itemCount}개 · {formatPrice(totalAmount)}
        </button>
      )}
    </div>
  );
}
