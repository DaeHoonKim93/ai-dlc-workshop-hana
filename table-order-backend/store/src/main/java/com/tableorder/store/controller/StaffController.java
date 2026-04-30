package com.tableorder.store.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.store.dto.StaffCreateRequest;
import com.tableorder.store.dto.StaffResponse;
import com.tableorder.store.dto.StaffUpdateRequest;
import com.tableorder.store.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getStaffList(
            @PathVariable Long storeId) {
        List<StaffResponse> staffList = staffService.getStaffList(storeId);
        return ResponseEntity.ok(ApiResponse.ok(staffList));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(
            @PathVariable Long storeId,
            @Valid @RequestBody StaffCreateRequest request) {
        StaffResponse response = staffService.createStaff(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{staffId}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable Long storeId,
            @PathVariable Long staffId,
            @Valid @RequestBody StaffUpdateRequest request) {
        StaffResponse response = staffService.updateStaff(storeId, staffId, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{staffId}")
    public ResponseEntity<Void> deleteStaff(
            @PathVariable Long storeId,
            @PathVariable Long staffId) {
        staffService.deleteStaff(storeId, staffId);
        return ResponseEntity.noContent().build();
    }
}
