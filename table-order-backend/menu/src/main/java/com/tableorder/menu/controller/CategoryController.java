package com.tableorder.menu.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.menu.dto.CategoryCreateRequest;
import com.tableorder.menu.dto.CategoryResponse;
import com.tableorder.menu.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(@PathVariable Long storeId) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategories(storeId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @PathVariable Long storeId, @Valid @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(categoryService.createCategory(storeId, request)));
    }

    @PostMapping("/{categoryId}/subcategories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createSubCategory(
            @PathVariable Long storeId, @PathVariable Long categoryId,
            @Valid @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(categoryService.createSubCategory(storeId, categoryId, request)));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long storeId, @PathVariable Long categoryId,
            @Valid @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.updateCategory(storeId, categoryId, request)));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long storeId, @PathVariable Long categoryId) {
        categoryService.deleteCategory(storeId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
