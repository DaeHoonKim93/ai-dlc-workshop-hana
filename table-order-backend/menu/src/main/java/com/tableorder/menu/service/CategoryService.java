package com.tableorder.menu.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.menu.dto.CategoryCreateRequest;
import com.tableorder.menu.dto.CategoryResponse;
import com.tableorder.menu.entity.Category;
import com.tableorder.menu.entity.SubCategory;
import com.tableorder.menu.repository.CategoryRepository;
import com.tableorder.menu.repository.SubCategoryRepository;
import com.tableorder.menu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final MenuItemRepository menuItemRepository;

    public List<CategoryResponse> getCategories(Long storeId) {
        return categoryRepository.findByStoreIdWithSubCategories(storeId).stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(Long storeId, CategoryCreateRequest request) {
        Category category = Category.builder()
                .storeId(storeId)
                .name(request.getName())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created: storeId={}, name={}", storeId, request.getName());
        return toCategoryResponse(saved);
    }

    @Transactional
    public CategoryResponse createSubCategory(Long storeId, Long categoryId, CategoryCreateRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다"));

        if (!category.getStoreId().equals(storeId)) {
            throw BusinessException.forbidden("접근 권한이 없습니다");
        }

        SubCategory subCategory = SubCategory.builder()
                .category(category)
                .storeId(storeId)
                .name(request.getName())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        subCategoryRepository.save(subCategory);
        log.info("SubCategory created: storeId={}, categoryId={}, name={}", storeId, categoryId, request.getName());
        return toCategoryResponse(categoryRepository.findById(categoryId).orElseThrow());
    }

    @Transactional
    public CategoryResponse updateCategory(Long storeId, Long categoryId, CategoryCreateRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다"));

        if (!category.getStoreId().equals(storeId)) {
            throw BusinessException.forbidden("접근 권한이 없습니다");
        }

        category.setName(request.getName());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        return toCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(Long storeId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다"));

        if (!category.getStoreId().equals(storeId)) {
            throw BusinessException.forbidden("접근 권한이 없습니다");
        }

        if (subCategoryRepository.existsByCategoryId(categoryId)) {
            throw BusinessException.conflict("하위 소분류가 존재하여 삭제할 수 없습니다");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: storeId={}, categoryId={}", storeId, categoryId);
    }

    private CategoryResponse toCategoryResponse(Category category) {
        List<CategoryResponse.SubCategoryResponse> subCategories = category.getSubCategories().stream()
                .map(sc -> CategoryResponse.SubCategoryResponse.builder()
                        .id(sc.getId())
                        .name(sc.getName())
                        .displayOrder(sc.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .displayOrder(category.getDisplayOrder())
                .subCategories(subCategories)
                .createdAt(category.getCreatedAt())
                .build();
    }
}
