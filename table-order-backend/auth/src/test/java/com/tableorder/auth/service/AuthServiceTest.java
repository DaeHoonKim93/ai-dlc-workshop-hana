package com.tableorder.auth.service;

import com.tableorder.auth.dto.AdminLoginRequest;
import com.tableorder.auth.dto.TokenResponse;
import com.tableorder.auth.entity.*;
import com.tableorder.auth.repository.LoginAttemptRepository;
import com.tableorder.auth.repository.StaffRepository;
import com.tableorder.auth.repository.StoreRepository;
import com.tableorder.auth.security.JwtTokenProvider;
import com.tableorder.common.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TableAuthBridge tableAuthBridge;

    @Test
    @DisplayName("관리자 로그인 성공")
    void authenticateAdmin_success() {
        // given
        AdminLoginRequest request = new AdminLoginRequest("STORE001", "admin", "password123");
        Store store = Store.builder().id(1L).storeCode("STORE001").storeName("테스트").build();
        Staff staff = Staff.builder().id(1L).storeId(1L).username("admin")
                .password("encoded").role(StaffRole.MANAGER).isActive(true).build();

        given(storeRepository.findByStoreCode("STORE001")).willReturn(Optional.of(store));
        given(loginAttemptRepository.findByStoreCodeAndIdentifierAndAttemptType(
                "STORE001", "admin", AttemptType.ADMIN)).willReturn(Optional.empty());
        given(staffRepository.findByStoreIdAndUsernameAndIsActiveTrue(1L, "admin"))
                .willReturn(Optional.of(staff));
        given(passwordEncoder.matches("password123", "encoded")).willReturn(true);
        given(jwtTokenProvider.generateAccessToken(1L, 1L, "MANAGER")).willReturn("access-token");
        given(jwtTokenProvider.generateRefreshToken(1L, 1L, "MANAGER")).willReturn("refresh-token");

        // when
        TokenResponse response = authService.authenticateAdmin(request);

        // then
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getRole()).isEqualTo("MANAGER");
        assertThat(response.getStoreId()).isEqualTo(1L);
        assertThat(response.getStaffId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("관리자 로그인 실패 - 매장 없음")
    void authenticateAdmin_storeNotFound() {
        AdminLoginRequest request = new AdminLoginRequest("INVALID", "admin", "password123");
        given(storeRepository.findByStoreCode("INVALID")).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.authenticateAdmin(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("인증 정보가 올바르지 않습니다");
    }

    @Test
    @DisplayName("관리자 로그인 실패 - 비밀번호 불일치")
    void authenticateAdmin_wrongPassword() {
        AdminLoginRequest request = new AdminLoginRequest("STORE001", "admin", "wrongpass");
        Store store = Store.builder().id(1L).storeCode("STORE001").build();
        Staff staff = Staff.builder().id(1L).storeId(1L).username("admin")
                .password("encoded").role(StaffRole.MANAGER).isActive(true).build();

        given(storeRepository.findByStoreCode("STORE001")).willReturn(Optional.of(store));
        given(loginAttemptRepository.findByStoreCodeAndIdentifierAndAttemptType(
                "STORE001", "admin", AttemptType.ADMIN)).willReturn(Optional.empty());
        given(staffRepository.findByStoreIdAndUsernameAndIsActiveTrue(1L, "admin"))
                .willReturn(Optional.of(staff));
        given(passwordEncoder.matches("wrongpass", "encoded")).willReturn(false);

        assertThatThrownBy(() -> authService.authenticateAdmin(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("인증 정보가 올바르지 않습니다");
    }

    @Test
    @DisplayName("관리자 로그인 실패 - 계정 잠금")
    void authenticateAdmin_accountLocked() {
        AdminLoginRequest request = new AdminLoginRequest("STORE001", "admin", "password123");
        Store store = Store.builder().id(1L).storeCode("STORE001").build();
        LoginAttempt lockedAttempt = LoginAttempt.builder()
                .storeCode("STORE001").identifier("admin").attemptType(AttemptType.ADMIN)
                .attemptCount(5).lockedUntil(java.time.LocalDateTime.now().plusMinutes(10))
                .build();

        given(storeRepository.findByStoreCode("STORE001")).willReturn(Optional.of(store));
        given(loginAttemptRepository.findByStoreCodeAndIdentifierAndAttemptType(
                "STORE001", "admin", AttemptType.ADMIN)).willReturn(Optional.of(lockedAttempt));

        assertThatThrownBy(() -> authService.authenticateAdmin(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("계정이 잠겨있습니다");
    }

    @Test
    @DisplayName("토큰 갱신 성공")
    void refreshToken_success() {
        given(jwtTokenProvider.validateToken("valid-refresh")).willReturn(true);
        given(jwtTokenProvider.getType("valid-refresh")).willReturn("REFRESH");
        given(jwtTokenProvider.getSubjectId("valid-refresh")).willReturn(1L);
        given(jwtTokenProvider.getStoreId("valid-refresh")).willReturn(1L);
        given(jwtTokenProvider.getRole("valid-refresh")).willReturn("MANAGER");
        given(jwtTokenProvider.generateAccessToken(1L, 1L, "MANAGER")).willReturn("new-access");
        given(jwtTokenProvider.generateRefreshToken(1L, 1L, "MANAGER")).willReturn("new-refresh");

        TokenResponse response = authService.refreshToken("valid-refresh");

        assertThat(response.getAccessToken()).isEqualTo("new-access");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
    }

    @Test
    @DisplayName("토큰 갱신 실패 - 만료된 토큰")
    void refreshToken_expired() {
        given(jwtTokenProvider.validateToken("expired")).willReturn(false);

        assertThatThrownBy(() -> authService.refreshToken("expired"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("토큰이 만료되었습니다");
    }
}
