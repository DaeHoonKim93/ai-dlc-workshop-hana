package com.tableorder.menu.repository;

import com.tableorder.menu.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {

    boolean existsByCategoryId(Long categoryId);

    boolean existsByIdAndStoreId(Long id, Long storeId);
}
