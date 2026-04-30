package com.tableorder.menu.repository;

import com.tableorder.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.subCategory sc JOIN FETCH sc.category " +
           "WHERE m.storeId = :storeId AND m.subCategory.id = :subCategoryId " +
           "ORDER BY m.displayOrder")
    List<MenuItem> findByStoreIdAndSubCategoryId(@Param("storeId") Long storeId,
                                                  @Param("subCategoryId") Long subCategoryId);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.subCategory sc JOIN FETCH sc.category " +
           "WHERE m.storeId = :storeId ORDER BY sc.category.displayOrder, sc.displayOrder, m.displayOrder")
    List<MenuItem> findByStoreIdWithCategory(@Param("storeId") Long storeId);

    Optional<MenuItem> findByIdAndStoreId(Long id, Long storeId);

    boolean existsBySubCategoryId(Long subCategoryId);

    @Query("SELECT COALESCE(MAX(m.displayOrder), 0) FROM MenuItem m WHERE m.subCategory.id = :subCategoryId")
    int findMaxDisplayOrderBySubCategoryId(@Param("subCategoryId") Long subCategoryId);
}
