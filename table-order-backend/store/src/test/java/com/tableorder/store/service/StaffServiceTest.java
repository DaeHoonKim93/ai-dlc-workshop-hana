package com.tableorder.store.service;

import com.tableorder.auth.entity.Staff;
import com.tableorder.auth.entity.StaffRole;
import com.tableorder.auth.repository.StaffRepository;
import com.tableorder.auth.security.JwtUserDetails;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.store.dto.StaffCreateRequest;
import com.tableorder.store.dto.StaffResponse;
import com.tableorder.store.dto.StaffUpdateRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class StaffServiceTest {

    @InjectMocks
    private StaffService staffService;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("직원 목록 조회")
    void getStaffList() {
        Staff staff = Staff.builder().id(1L).storeId(1L).username("admin")
                .role(StaffRole.MANAGER).isActive(true)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        given(staffRepository.findByStoreIdAndIsActiveTrue(1L)).willReturn(List.of(staff));

        List<StaffResponse> result = staffService.getStaffList(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("admin");
    }

    @Test
    @DisplayName("직원 생성 성공")
    void createStaff_success() {
        StaffCreateRequest request = new StaffCreateRequest("newuser", "password123", StaffRole.STAFF);
        given(staffRepository.existsByStoreIdAndUsername(1L, "newuser")).willReturn(false);
        given(passwordEncoder.encode("password123")).willReturn("encoded");
        given(staffRepository.save(any(Staff.class))).willAnswer(invocation -> {
            Staff s = invocation.getArgument(0);
            return Staff.builder().id(2L).storeId(1L).username(s.getUsername())
                    .password(s.getPassword()).role(s.getRole()).isActive(true)
                    .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        });

        StaffResponse response = staffService.createStaff(1L, request);

        assertThat(response.getUsername()).isEqualTo("newuser");
        assertThat(response.getRole()).isEqualTo("STAFF");
    }

    @Test
    @DisplayName("직원 생성 실패 - username 중복")
    void createStaff_duplicate() {
        StaffCreateRequest request = new StaffCreateRequest("admin", "password123", StaffRole.STAFF);
        given(staffRepository.existsByStoreIdAndUsername(1L, "admin")).willReturn(true);

        assertThatThrownBy(() -> staffService.createStaff(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 존재하는 사용자명입니다");
    }

    @Test
    @DisplayName("직원 삭제 실패 - 자기 자신 삭제")
    void deleteStaff_selfDelete() {
        Staff staff = Staff.builder().id(1L).storeId(1L).username("admin")
                .role(StaffRole.MANAGER).isActive(true).build();
        given(staffRepository.findById(1L)).willReturn(Optional.of(staff));

        JwtUserDetails userDetails = JwtUserDetails.builder().id(1L).storeId(1L).role("MANAGER").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, List.of()));

        assertThatThrownBy(() -> staffService.deleteStaff(1L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("자신의 계정은 삭제할 수 없습니다");

        SecurityContextHolder.clearContext();
    }
}
