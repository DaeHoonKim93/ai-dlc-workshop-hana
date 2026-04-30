package com.tableorder.menu.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MenuUpdateRequest {

    private Long subCategoryId;

    @Size(max = 100, message = "메뉴명은 100자 이내여야 합니다")
    private String name;

    @Min(value = 100, message = "가격은 100원 이상이어야 합니다")
    private Integer price;

    @Size(max = 500, message = "설명은 500자 이내여야 합니다")
    private String description;

    private Boolean isAvailable;
}
