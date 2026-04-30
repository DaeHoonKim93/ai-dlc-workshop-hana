package com.tableorder.store.dto;

import com.tableorder.auth.entity.StaffRole;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StaffUpdateRequest {

    @Size(min = 1, max = 50, message = "사용자명은 1~50자여야 합니다")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "사용자명은 영문+숫자만 허용됩니다")
    private String username;

    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
    private String password;

    private StaffRole role;
}
