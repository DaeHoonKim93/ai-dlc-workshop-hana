package com.tableorder.menu.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.menu.dto.*;
import com.tableorder.menu.entity.MenuItem;
import com.tableorder.menu.repository.MenuItemRepository;
import com.tableorder.menu.service.ImageService;
import com.tableorder.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores/{storeId}/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;
    private final ImageService imageService;
    private final MenuItemRepository menuItemRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItems(
            @PathVariable Long storeId,
            @RequestParam(required = false) Long subCategoryId) {
        return ResponseEntity.ok(ApiResponse.ok(menuService.getMenuItems(storeId, subCategoryId)));
    }

    @GetMapping("/{menuId}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItem(
            @PathVariable Long storeId, @PathVariable Long menuId) {
        return ResponseEntity.ok(ApiResponse.ok(menuService.getMenuItem(storeId, menuId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @PathVariable Long storeId, @Valid @RequestBody MenuCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(menuService.createMenuItem(storeId, request)));
    }

    @PutMapping("/{menuId}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long storeId, @PathVariable Long menuId,
            @Valid @RequestBody MenuUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(menuService.updateMenuItem(storeId, menuId, request)));
    }

    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long storeId, @PathVariable Long menuId) {
        menuService.deleteMenuItem(storeId, menuId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/order")
    public ResponseEntity<ApiResponse<Void>> updateMenuOrder(
            @PathVariable Long storeId, @Valid @RequestBody MenuOrderRequest request) {
        menuService.updateMenuOrder(storeId, request);
        return ResponseEntity.ok(ApiResponse.ok("메뉴 순서가 변경되었습니다"));
    }

    @PostMapping(value = "/{menuId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMenuImage(
            @PathVariable Long storeId, @PathVariable Long menuId,
            @RequestParam("image") MultipartFile image) {
        MenuItemResponse menu = menuService.getMenuItem(storeId, menuId);

        if (menu.getImageUrl() != null) {
            imageService.deleteImage(menu.getImageUrl());
        }

        String imageUrl = imageService.uploadImage(storeId, image);

        MenuItem menuItem = menuItemRepository.findByIdAndStoreId(menuId, storeId).orElseThrow();
        menuItem.setImageUrl(imageUrl);
        menuItemRepository.save(menuItem);

        return ResponseEntity.ok(ApiResponse.ok(Map.of("imageUrl", imageUrl)));
    }
}
