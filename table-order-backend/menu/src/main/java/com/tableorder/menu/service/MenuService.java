package com.tableorder.menu.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.menu.dto.*;
import com.tableorder.menu.entity.MenuItem;
import com.tableorder.menu.entity.SubCategory;
import com.tableorder.menu.repository.MenuItemRepository;
import com.tableorder.menu.repository.SubCategoryRepository;
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
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final SubCategoryRepository subCategoryRepository;

    public List<MenuItemResponse> getMenuItems(Long storeId, Long subCategoryId) {
        List<MenuItem> items;
        if (subCategoryId != null) {
            items = menuItemRepository.findByStoreIdAndSubCategoryId(storeId, subCategoryId);
        } else {
            items = menuItemRepository.findByStoreIdWithCategory(storeId);
        }
        return items.stream().map(this::toMenuItemResponse).collect(Collectors.toList());
    }

    public MenuItemResponse getMenuItem(Long storeId, Long menuId) {
        MenuItem item = menuItemRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> BusinessException.notFound("메뉴를 찾을 수 없습니다"));
        return toMenuItemResponse(item);
    }

    @Transactional
    public MenuItemResponse createMenuItem(Long storeId, MenuCreateRequest request) {
        SubCategory subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                .orElseThrow(() -> BusinessException.notFound("소분류 카테고리를 찾을 수 없습니다"));

        if (!subCategory.getStoreId().equals(storeId)) {
            throw BusinessException.forbidden("접근 권한이 없습니다");
        }

        int nextOrder = menuItemRepository.findMaxDisplayOrderBySubCategoryId(request.getSubCategoryId()) + 1;

        MenuItem menuItem = MenuItem.builder()
                .storeId(storeId)
                .subCategory(subCategory)
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .displayOrder(nextOrder)
                .isAvailable(true)
                .build();

        MenuItem saved = menuItemRepository.save(menuItem);
        log.info("MenuItem created: storeId={}, name={}, price={}", storeId, request.getName(), request.getPrice());
        return toMenuItemResponse(saved);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long storeId, Long menuId, MenuUpdateRequest request) {
        MenuItem menuItem = menuItemRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> BusinessException.notFound("메뉴를 찾을 수 없습니다"));

        if (request.getName() != null) menuItem.setName(request.getName());
        if (request.getPrice() != null) menuItem.setPrice(request.getPrice());
        if (request.getDescription() != null) menuItem.setDescription(request.getDescription());
        if (request.getIsAvailable() != null) menuItem.setIsAvailable(request.getIsAvailable());
        if (request.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> BusinessException.notFound("소분류 카테고리를 찾을 수 없습니다"));
            menuItem.setSubCategory(subCategory);
        }

        log.info("MenuItem updated: storeId={}, menuId={}", storeId, menuId);
        return toMenuItemResponse(menuItem);
    }

    @Transactional
    public void deleteMenuItem(Long storeId, Long menuId) {
        MenuItem menuItem = menuItemRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> BusinessException.notFound("메뉴를 찾을 수 없습니다"));
        menuItemRepository.delete(menuItem);
        log.info("MenuItem deleted: storeId={}, menuId={}", storeId, menuId);
    }

    @Transactional
    public void updateMenuOrder(Long storeId, MenuOrderRequest request) {
        for (MenuOrderRequest.MenuOrderItem item : request.getMenuOrders()) {
            MenuItem menuItem = menuItemRepository.findByIdAndStoreId(item.getMenuId(), storeId)
                    .orElseThrow(() -> BusinessException.notFound("메뉴를 찾을 수 없습니다: " + item.getMenuId()));
            menuItem.setDisplayOrder(item.getDisplayOrder());
        }
        log.info("Menu order updated: storeId={}, count={}", storeId, request.getMenuOrders().size());
    }

    private MenuItemResponse toMenuItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .price(item.getPrice())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .subCategoryId(item.getSubCategory().getId())
                .subCategoryName(item.getSubCategory().getName())
                .categoryId(item.getSubCategory().getCategory().getId())
                .categoryName(item.getSubCategory().getCategory().getName())
                .displayOrder(item.getDisplayOrder())
                .isAvailable(item.getIsAvailable())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
