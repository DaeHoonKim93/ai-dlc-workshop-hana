package com.tableorder.menu.repository;

import com.tableorder.menu.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.subCategories " +
           "WHERE c.storeId = :storeId ORDER BY c.displayOrder")
    List<Category> findByStoreIdWithSubCategories(@Param("storeId") Long storeId);

    boolean existsByIdAndStoreId(Long id, Long storeId);
}
