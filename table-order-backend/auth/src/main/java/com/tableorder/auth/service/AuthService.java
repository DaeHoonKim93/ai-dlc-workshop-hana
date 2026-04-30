package com.tableorder.auth.service;

import com.tableorder.auth.dto.AdminLoginRequest;
import com.tableorder.auth.dto.TableLoginRequest;
import com.tableorder.auth.dto.TokenResponse;
import com.tableorder.auth.entity.*;
import com.tableorder.auth.repository.LoginAttemptRepository;
import com.tableorder.auth.repository.StaffRepository;
import com.tableorder.auth.repository.StoreRepository;
import com.tableorder.auth.security.JwtTokenProvider;
import com.tableorder.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    private final StoreRepository storeRepository;
    private final StaffRepository staffRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final TableAuthBridge tableAuthBridge;

    @Transactional
    public TokenResponse authenticateAdmin(AdminLoginRequest request) {
        Store store = storeRepository.findByStoreCode(request.getStoreCode())
                .orElseThrow(() -> new BusinessException(
                        "인증 정보가 올바르지 않습니다", HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED"));

        checkLoginAttemptLimit(request.getStoreCode(), request.getUsername(), AttemptType.ADMIN);

        Staff staff = staffRepository.findByStoreIdAndUsernameAndIsActiveTrue(store.getId(), request.getUsername())
                .orElseGet(() -> {
                    incrementFailCount(request.getStoreCode(), request.getUsername(), AttemptType.ADMIN);
                    throw new BusinessException(
                            "인증 정보가 올바르지 않습니다", HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED");
                });

        if (!passwordEncoder.matches(request.getPassword(), staff.getPassword())) {
            incrementFailCount(request.getStoreCode(), request.getUsername(), AttemptType.ADMIN);
            throw new BusinessException(
                    "인증 정보가 올바르지 않습니다", HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED");
        }

        resetFailCount(request.getStoreCode(), request.getUsername(), AttemptType.ADMIN);
        log.info("Admin login success: store={}, user={}", request.getStoreCode(), request.getUsername());

        String accessToken = jwtTokenProvider.generateAccessToken(staff.getId(), store.getId(), staff.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(staff.getId(), store.getId(), staff.getRole().name());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(staff.getRole().name())
                .storeId(store.getId())
                .staffId(staff.getId())
                .build();
    }

    @Transactional
    public TokenResponse authenticateTable(TableLoginRequest request) {
        Store store = storeRepository.findByStoreCode(request.getStoreCode())
                .orElseThrow(() -> new BusinessException(
                        "인증 정보가 올바르지 않습니다", HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED"));

        checkLoginAttemptLimit(request.getStoreCode(), request.getTableNumber(), AttemptType.TABLE);

        TableAuthInfo tableInfo = tableAuthBridge.findTable(store.getId(), request.getTableNumber())
                .orElseGet(() -> {
                    incrementFailCount(request.getStoreCode(), request.getTableNumber(), AttemptType.TABLE);
                    throw new BusinessException(
                            "인증 정보가 올바르지 않습니다", HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED");
                });

        if (!passwordEncoder.matches(request.getPassword(), tableInfo.getPassword())) {
            incrementFailCount(request.getStoreCode(), request.getTableNumber(), AttemptType.TABLE);
            throw new BusinessException(
                    "인증 정보가 올바르지 않습니다", HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED");
        }

        resetFailCount(request.getStoreCode(), request.getTableNumber(), AttemptType.TABLE);
        log.info("Table login success: store={}, table={}", request.getStoreCode(), request.getTableNumber());

        String accessToken = jwtTokenProvider.generateAccessToken(tableInfo.getId(), store.getId(), "TABLE");
        String refreshToken = jwtTokenProvider.generateRefreshToken(tableInfo.getId(), store.getId(), "TABLE");

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role("TABLE")
                .storeId(store.getId())
                .tableId(tableInfo.getId())
                .build();
    }

    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("토큰이 만료되었습니다", HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED");
        }

        String type = jwtTokenProvider.getType(refreshToken);
        if (!"REFRESH".equals(type)) {
            throw new BusinessException("유효하지 않은 토큰입니다", HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
        }

        Long subjectId = jwtTokenProvider.getSubjectId(refreshToken);
        Long storeId = jwtTokenProvider.getStoreId(refreshToken);
        String role = jwtTokenProvider.getRole(refreshToken);

        String newAccessToken = jwtTokenProvider.generateAccessToken(subjectId, storeId, role);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(subjectId, storeId, role);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    private void checkLoginAttemptLimit(String storeCode, String identifier, AttemptType type) {
        loginAttemptRepository.findByStoreCodeAndIdentifierAndAttemptType(storeCode, identifier, type)
                .ifPresent(attempt -> {
                    if (attempt.isLocked()) {
                        throw new BusinessException(
                                "계정이 잠겨있습니다. 잠시 후 재시도해주세요",
                                HttpStatus.UNAUTHORIZED, "ACCOUNT_LOCKED");
                    }
                });
    }

    private void incrementFailCount(String storeCode, String identifier, AttemptType type) {
        LoginAttempt attempt = loginAttemptRepository
                .findByStoreCodeAndIdentifierAndAttemptType(storeCode, identifier, type)
                .orElseGet(() -> LoginAttempt.builder()
                        .storeCode(storeCode)
                        .identifier(identifier)
                        .attemptType(type)
                        .attemptCount(0)
                        .build());

        attempt.incrementFailCount();

        if (attempt.getAttemptCount() >= MAX_ATTEMPTS) {
            attempt.lock(LOCK_MINUTES);
            log.warn("Account locked: store={}, identifier={}, type={}", storeCode, identifier, type);
        }

        loginAttemptRepository.save(attempt);
    }

    private void resetFailCount(String storeCode, String identifier, AttemptType type) {
        loginAttemptRepository.findByStoreCodeAndIdentifierAndAttemptType(storeCode, identifier, type)
                .ifPresent(attempt -> {
                    attempt.resetCount();
                    loginAttemptRepository.save(attempt);
                });
    }
}
