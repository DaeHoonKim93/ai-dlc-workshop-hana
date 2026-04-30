package com.tableorder.menu.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.menu.dto.MenuCreateRequest;
import com.tableorder.menu.dto.MenuItemResponse;
import com.tableorder.menu.entity.Category;
import com.tableorder.menu.entity.MenuItem;
import com.tableorder.menu.entity.SubCategory;
import com.tableorder.menu.repository.MenuItemRepository;
import com.tableorder.menu.repository.SubCategoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @InjectMocks
    private MenuService menuService;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private SubCategoryRepository subCategoryRepository;

    @Test
    @DisplayName("메뉴 등록 성공")
    void createMenuItem_success() {
        Long storeId = 1L;
        Category category = Category.builder().id(1L).storeId(storeId).name("음료").build();
        SubCategory subCategory = SubCategory.builder().id(10L).storeId(storeId).name("커피").category(category).build();

        MenuCreateRequest request = new MenuCreateRequest(10L, "아메리카노", 4500, "깊고 진한 커피");

        given(subCategoryRepository.findById(10L)).willReturn(Optional.of(subCategory));
        given(menuItemRepository.findMaxDisplayOrderBySubCategoryId(10L)).willReturn(0);
        given(menuItemRepository.save(any(MenuItem.class))).willAnswer(invocation -> {
            MenuItem m = invocation.getArgument(0);
            m.setId(1L);
            m.setCreatedAt(LocalDateTime.now());
            m.setUpdatedAt(LocalDateTime.now());
            return m;
        });

        MenuItemResponse result = menuService.createMenuItem(storeId, request);

        assertThat(result.getName()).isEqualTo("아메리카노");
        assertThat(result.getPrice()).isEqualTo(4500);
        assertThat(result.getSubCategoryName()).isEqualTo("커피");
    }

    @Test
    @DisplayName("메뉴 등록 실패 - 존재하지 않는 소분류")
    void createMenuItem_subCategoryNotFound() {
        Long storeId = 1L;
        MenuCreateRequest request = new MenuCreateRequest(999L, "아메리카노", 4500, null);

        given(subCategoryRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> menuService.createMenuItem(storeId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("소분류 카테고리를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("메뉴 삭제 성공")
    void deleteMenuItem_success() {
        Long storeId = 1L;
        MenuItem menuItem = MenuItem.builder().id(1L).storeId(storeId).name("아메리카노").build();

        given(menuItemRepository.findByIdAndStoreId(1L, storeId)).willReturn(Optional.of(menuItem));

        menuService.deleteMenuItem(storeId, 1L);

        then(menuItemRepository).should().delete(menuItem);
    }
}
