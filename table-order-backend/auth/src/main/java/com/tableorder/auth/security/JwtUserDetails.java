package com.tableorder.auth.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class JwtUserDetails {

    private Long id;
    private Long storeId;
    private String role;
}
