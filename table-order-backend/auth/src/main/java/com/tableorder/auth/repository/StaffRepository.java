package com.tableorder.auth.repository;

import com.tableorder.auth.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByStoreIdAndUsername(Long storeId, String username);

    Optional<Staff> findByStoreIdAndUsernameAndIsActiveTrue(Long storeId, String username);

    List<Staff> findByStoreIdAndIsActiveTrue(Long storeId);

    boolean existsByStoreIdAndUsername(Long storeId, String username);
}
