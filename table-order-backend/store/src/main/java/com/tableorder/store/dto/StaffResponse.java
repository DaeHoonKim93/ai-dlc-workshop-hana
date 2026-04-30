package com.tableorder.store.dto;

import com.tableorder.auth.entity.Staff;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class StaffResponse {

    private Long id;
    private String username;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static StaffResponse from(Staff staff) {
        return StaffResponse.builder()
                .id(staff.getId())
                .username(staff.getUsername())
                .role(staff.getRole().name())
                .isActive(staff.getIsActive())
                .createdAt(staff.getCreatedAt())
                .build();
    }
}
