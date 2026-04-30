package com.tableorder.auth.repository;

import com.tableorder.auth.entity.AttemptType;
import com.tableorder.auth.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    Optional<LoginAttempt> findByStoreCodeAndIdentifierAndAttemptType(
            String storeCode, String identifier, AttemptType attemptType);
}
