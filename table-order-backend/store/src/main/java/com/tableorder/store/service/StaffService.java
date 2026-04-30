package com.tableorder.store.service;

import com.tableorder.auth.entity.Staff;
import com.tableorder.auth.repository.StaffRepository;
import com.tableorder.auth.security.JwtUserDetails;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.store.dto.StaffCreateRequest;
import com.tableorder.store.dto.StaffResponse;
import com.tableorder.store.dto.StaffUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<StaffResponse> getStaffList(Long storeId) {
        return staffRepository.findByStoreIdAndIsActiveTrue(storeId).stream()
                .map(StaffResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffResponse createStaff(Long storeId, StaffCreateRequest request) {
        if (staffRepository.existsByStoreIdAndUsername(storeId, request.getUsername())) {
            throw new BusinessException(
                    "이미 존재하는 사용자명입니다", HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
        }

        Staff staff = Staff.builder()
                .storeId(storeId)
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        Staff saved = staffRepository.save(staff);
        log.info("Staff created: storeId={}, username={}, role={}", storeId, request.getUsername(), request.getRole());
        return StaffResponse.from(saved);
    }

    @Transactional
    public StaffResponse updateStaff(Long storeId, Long staffId, StaffUpdateRequest request) {
        Staff staff = staffRepository.findById(staffId)
                .filter(s -> s.getStoreId().equals(storeId) && s.getIsActive())
                .orElseThrow(() -> BusinessException.notFound("직원을 찾을 수 없습니다"));

        if (request.getUsername() != null) {
            if (!staff.getUsername().equals(request.getUsername())
                    && staffRepository.existsByStoreIdAndUsername(storeId, request.getUsername())) {
                throw new BusinessException(
                        "이미 존재하는 사용자명입니다", HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
            }
            staff.updateUsername(request.getUsername());
        }

        if (request.getPassword() != null) {
            staff.updatePassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            staff.updateRole(request.getRole());
        }

        log.info("Staff updated: storeId={}, staffId={}", storeId, staffId);
        return StaffResponse.from(staff);
    }

    @Transactional
    public void deleteStaff(Long storeId, Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .filter(s -> s.getStoreId().equals(storeId) && s.getIsActive())
                .orElseThrow(() -> BusinessException.notFound("직원을 찾을 수 없습니다"));

        JwtUserDetails currentUser = (JwtUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        if (currentUser.getId().equals(staffId)) {
            throw BusinessException.badRequest("자신의 계정은 삭제할 수 없습니다");
        }

        staff.deactivate();
        log.info("Staff deactivated: storeId={}, staffId={}", storeId, staffId);
    }
}
