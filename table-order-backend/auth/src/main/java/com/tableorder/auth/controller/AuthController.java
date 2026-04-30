package com.tableorder.auth.controller;

import com.tableorder.auth.dto.AdminLoginRequest;
import com.tableorder.auth.dto.RefreshTokenRequest;
import com.tableorder.auth.dto.TableLoginRequest;
import com.tableorder.auth.dto.TokenResponse;
import com.tableorder.auth.service.AuthService;
import com.tableorder.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<TokenResponse>> adminLogin(
            @Valid @RequestBody AdminLoginRequest request) {
        TokenResponse response = authService.authenticateAdmin(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/table/login")
    public ResponseEntity<ApiResponse<TokenResponse>> tableLogin(
            @Valid @RequestBody TableLoginRequest request) {
        TokenResponse response = authService.authenticateTable(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다"));
    }
}
