package com.tableorder.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TableLoginRequest {

    @NotBlank(message = "매장 코드는 필수입니다")
    @Size(max = 50, message = "매장 코드는 50자 이내여야 합니다")
    private String storeCode;

    @NotBlank(message = "테이블 번호는 필수입니다")
    @Size(max = 20, message = "테이블 번호는 20자 이내여야 합니다")
    private String tableNumber;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
    private String password;
}
