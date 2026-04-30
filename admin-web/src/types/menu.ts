export interface SubCategory {
  id: number;
  name: string;
  displayOrder: number;
  categoryId?: number;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  subCategories: SubCategory[];
  createdAt?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  subCategoryId: number;
  subCategoryName?: string;
  categoryId?: number;
  categoryName?: string;
  displayOrder: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCreateRequest {
  subCategoryId: number;
  name: string;
  price: number;
  description?: string;
}

export interface MenuUpdateRequest {
  subCategoryId?: number;
  name?: string;
  price?: number;
  description?: string;
  isAvailable?: boolean;
}

export interface CategoryCreateRequest {
  name: string;
  displayOrder?: number;
}

export interface SubCategoryCreateRequest {
  name: string;
  displayOrder?: number;
}

export interface MenuOrderItem {
  menuId: number;
  displayOrder: number;
}

export interface MenuOrderUpdateRequest {
  menuOrders: MenuOrderItem[];
}

export interface ImageUploadResponse {
  imageUrl: string;
}
