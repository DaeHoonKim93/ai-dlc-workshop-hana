package com.tableorder.auth.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TableAuthInfo {

    private Long id;
    private Long storeId;
    private String tableNumber;
    private String password;
}
