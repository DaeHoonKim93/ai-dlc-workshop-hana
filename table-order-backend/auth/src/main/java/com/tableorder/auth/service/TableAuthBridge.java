package com.tableorder.auth.service;

import java.util.Optional;

/**
 * auth 모듈에서 table 모듈의 테이블 정보를 조회하기 위한 브릿지 인터페이스.
 * table 모듈 또는 app 모듈에서 구현체를 제공합니다.
 */
public interface TableAuthBridge {

    Optional<TableAuthInfo> findTable(Long storeId, String tableNumber);
}
