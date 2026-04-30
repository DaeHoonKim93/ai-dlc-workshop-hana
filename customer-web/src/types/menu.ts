export interface SubCategory {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  subCategories: SubCategory[];
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  displayOrder: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}
