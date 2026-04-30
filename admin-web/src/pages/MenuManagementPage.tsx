import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMenuManagement } from '@/hooks/useMenuManagement';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '@/components';
import { showToast } from '@/components/Toast';
import { formatPrice } from '@/utils/format';
import type { Category, SubCategory } from '@/types/menu';
import { AxiosError } from 'axios';
import styles from './MenuManagementPage.module.css';

export default function MenuManagementPage() {
  const { auth } = useAuth();
  const mgmt = useMenuManagement(auth.storeId);

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | undefined>();
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // 카테고리 추가
  const [newCatName, setNewCatName] = useState('');
  const [newSubCatParent, setNewSubCatParent] = useState<number | null>(null);
  const [newSubCatName, setNewSubCatName] = useState('');

  // 메뉴 폼
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuSubCatId, setMenuSubCatId] = useState<number>(0);
  const [menuFormError, setMenuFormError] = useState('');

  // 이미지 업로드
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);

  // 삭제
  const [deleteMenuTarget, setDeleteMenuTarget] = useState<number | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<number | null>(null);

  useEffect(() => {
    mgmt.fetchCategories();
  }, [mgmt.fetchCategories]);

  useEffect(() => {
    mgmt.fetchMenuItems(selectedSubCategoryId);
  }, [selectedSubCategoryId, mgmt.fetchMenuItems]);

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await mgmt.addCategory({ name: newCatName.trim() });
      setNewCatName('');
    } catch (err) {
      showToast('error', '카테고리 생성 실패');
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCatParent || !newSubCatName.trim()) return;
    try {
      await mgmt.addSubCategory(newSubCatParent, { name: newSubCatName.trim() });
      setNewSubCatName('');
      setNewSubCatParent(null);
    } catch {
      showToast('error', '소분류 생성 실패');
    }
  };

  const openMenuForm = (subCatId: number, menu?: { id: number; name: string; price: number; description: string | null; subCategoryId: number }) => {
    setShowMenuForm(true);
    setMenuSubCatId(subCatId);
    setMenuFormError('');
    if (menu) {
      setEditingMenuId(menu.id);
      setMenuName(menu.name);
      setMenuPrice(String(menu.price));
      setMenuDesc(menu.description ?? '');
    } else {
      setEditingMenuId(null);
      setMenuName('');
      setMenuPrice('');
      setMenuDesc('');
    }
  };

  const handleMenuSubmit = async () => {
    setMenuFormError('');
    if (!menuName.trim()) { setMenuFormError('메뉴명을 입력하세요.'); return; }
    const price = Number(menuPrice);
    if (isNaN(price) || price < 100) { setMenuFormError('가격은 100원 이상이어야 합니다.'); return; }
    if (!menuSubCatId) { setMenuFormError('소분류를 선택하세요.'); return; }

    try {
      if (editingMenuId) {
        await mgmt.editMenu(editingMenuId, { name: menuName.trim(), price, description: menuDesc.trim() || undefined, subCategoryId: menuSubCatId }, selectedSubCategoryId);
      } else {
        await mgmt.addMenu({ subCategoryId: menuSubCatId, name: menuName.trim(), price, description: menuDesc.trim() || undefined });
      }
      setShowMenuForm(false);
    } catch (err) {
      if (err instanceof AxiosError) {
        setMenuFormError(err.response?.data?.message ?? '메뉴 저장 실패');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) { showToast('error', '허용되지 않는 파일 형식입니다.'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('error', '파일 크기가 5MB를 초과합니다.'); return; }
    try {
      await mgmt.uploadImage(uploadTargetId, file, selectedSubCategoryId);
    } catch {
      showToast('error', '이미지 업로드 실패');
    }
    setUploadTargetId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const allSubCategories = mgmt.categories.flatMap((c) =>
    c.subCategories.map((sc) => ({ ...sc, categoryName: c.name })),
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>메뉴 관리</h2>

      <div className={styles.layout}>
        {/* 좌측: 카테고리 트리 */}
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>카테고리</h3>
          <div className={styles.addCatRow}>
            <input className={styles.catInput} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="대분류 이름" maxLength={50} />
            <button className={styles.catAddBtn} onClick={handleAddCategory} type="button">+</button>
          </div>

          {mgmt.categories.map((cat) => (
            <div key={cat.id} className={styles.catGroup}>
              <div className={styles.catHeader}>
                <button className={styles.catToggle} onClick={() => toggleCategory(cat.id)} type="button">
                  {expandedCategories.has(cat.id) ? '▼' : '▶'} {cat.name}
                </button>
                <button className={styles.catDeleteBtn} onClick={() => setDeleteCatTarget(cat.id)} type="button" aria-label="카테고리 삭제">✕</button>
              </div>
              {expandedCategories.has(cat.id) && (
                <div className={styles.subList}>
                  {cat.subCategories.map((sc) => (
                    <button
                      key={sc.id}
                      className={`${styles.subItem} ${selectedSubCategoryId === sc.id ? styles.subActive : ''}`}
                      onClick={() => setSelectedSubCategoryId(sc.id)}
                      type="button"
                    >
                      {sc.name}
                    </button>
                  ))}
                  {newSubCatParent === cat.id ? (
                    <div className={styles.addSubRow}>
                      <input className={styles.catInput} value={newSubCatName} onChange={(e) => setNewSubCatName(e.target.value)} placeholder="소분류 이름" maxLength={50} />
                      <button className={styles.catAddBtn} onClick={handleAddSubCategory} type="button">✓</button>
                      <button className={styles.catAddBtn} onClick={() => setNewSubCatParent(null)} type="button">✕</button>
                    </div>
                  ) : (
                    <button className={styles.addSubBtn} onClick={() => setNewSubCatParent(cat.id)} type="button">+ 소분류 추가</button>
                  )}
                </div>
              )}
            </div>
          ))}
          <button className={styles.allMenuBtn} onClick={() => setSelectedSubCategoryId(undefined)} type="button">전체 메뉴 보기</button>
        </div>

        {/* 우측: 메뉴 목록 */}
        <div className={styles.content}>
          <div className={styles.menuTopBar}>
            <span className={styles.menuCount}>메뉴 {mgmt.menuItems.length}개</span>
            {selectedSubCategoryId && (
              <button className={styles.addMenuBtn} onClick={() => openMenuForm(selectedSubCategoryId)} type="button">+ 메뉴 등록</button>
            )}
          </div>

          {mgmt.loading ? (
            <LoadingSpinner />
          ) : mgmt.menuItems.length === 0 ? (
            <p className={styles.empty}>메뉴가 없습니다.</p>
          ) : (
            <div className={styles.menuGrid}>
              {mgmt.menuItems.map((item) => (
                <div key={item.id} className={styles.menuCard}>
                  {item.imageUrl && <img className={styles.menuImage} src={item.imageUrl} alt={item.name} />}
                  <div className={styles.menuInfo}>
                    <span className={styles.menuName}>{item.name}</span>
                    <span className={styles.menuPriceLabel}>{formatPrice(item.price)}</span>
                    {item.description && <p className={styles.menuDescText}>{item.description}</p>}
                    <span className={`${styles.availBadge} ${item.isAvailable ? styles.avail : styles.unavail}`}>
                      {item.isAvailable ? '판매중' : '판매중지'}
                    </span>
                  </div>
                  <div className={styles.menuActions}>
                    <button className={styles.editBtn} onClick={() => openMenuForm(item.subCategoryId, item)} type="button">수정</button>
                    <button className={styles.imgBtn} onClick={() => { setUploadTargetId(item.id); fileInputRef.current?.click(); }} type="button">이미지</button>
                    <button className={styles.delBtn} onClick={() => setDeleteMenuTarget(item.id)} type="button">삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 메뉴 등록/수정 모달 */}
      {showMenuForm && (
        <div className={styles.modalOverlay} onClick={() => setShowMenuForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editingMenuId ? '메뉴 수정' : '메뉴 등록'}</h3>
            {menuFormError && <p className={styles.formError}>{menuFormError}</p>}
            <label className={styles.formLabel}>메뉴명 <input className={styles.formInput} value={menuName} onChange={(e) => setMenuName(e.target.value)} maxLength={100} /></label>
            <label className={styles.formLabel}>가격 (원) <input className={styles.formInput} type="number" value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} min={100} /></label>
            <label className={styles.formLabel}>설명 <textarea className={styles.formTextarea} value={menuDesc} onChange={(e) => setMenuDesc(e.target.value)} maxLength={500} rows={3} /></label>
            <label className={styles.formLabel}>소분류
              <select className={styles.formSelect} value={menuSubCatId} onChange={(e) => setMenuSubCatId(Number(e.target.value))}>
                <option value={0}>선택하세요</option>
                {allSubCategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>{sc.categoryName} &gt; {sc.name}</option>
                ))}
              </select>
            </label>
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => setShowMenuForm(false)} type="button">취소</button>
              <button className={styles.submitBtn} onClick={handleMenuSubmit} type="button">{editingMenuId ? '수정' : '등록'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 숨겨진 파일 input */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />

      {/* 메뉴 삭제 확인 */}
      <ConfirmDialog isOpen={deleteMenuTarget !== null} title="메뉴 삭제" message="이 메뉴를 삭제하시겠습니까?" confirmLabel="삭제" variant="danger"
        onConfirm={() => { if (deleteMenuTarget) { mgmt.removeMenu(deleteMenuTarget, selectedSubCategoryId); setDeleteMenuTarget(null); } }}
        onCancel={() => setDeleteMenuTarget(null)} />

      {/* 카테고리 삭제 확인 */}
      <ConfirmDialog isOpen={deleteCatTarget !== null} title="카테고리 삭제" message="이 카테고리를 삭제하시겠습니까? 하위 소분류가 있으면 삭제할 수 없습니다." confirmLabel="삭제" variant="danger"
        onConfirm={async () => {
          if (deleteCatTarget) {
            try { await mgmt.removeCategory(deleteCatTarget); } catch { showToast('error', '하위 소분류가 존재하여 삭제할 수 없습니다.'); }
            setDeleteCatTarget(null);
          }
        }}
        onCancel={() => setDeleteCatTarget(null)} />
    </div>
  );
}
