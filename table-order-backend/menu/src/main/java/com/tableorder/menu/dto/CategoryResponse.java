package com.tableorder.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private Integer displayOrder;
    private List<SubCategoryResponse> subCategories;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class SubCategoryResponse {
        private Long id;
        private String name;
        private Integer displayOrder;
    }
}
