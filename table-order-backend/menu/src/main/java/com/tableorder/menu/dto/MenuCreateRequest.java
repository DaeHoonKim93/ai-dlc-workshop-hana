package com.tableorder.menu.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MenuCreateRequest {

    @NotNull(message = "소분류 카테고리 ID는 필수입니다")
    private Long subCategoryId;

    @NotBlank(message = "메뉴명은 필수입니다")
    @Size(max = 100, message = "메뉴명은 100자 이내여야 합니다")
    private String name;

    @NotNull(message = "가격은 필수입니다")
    @Min(value = 100, message = "가격은 100원 이상이어야 합니다")
    private Integer price;

    @Size(max = 500, message = "설명은 500자 이내여야 합니다")
    private String description;
}
