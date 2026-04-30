package com.tableorder.order.entity;

public enum OrderStatus {
    PENDING,    // 대기중
    ACCEPTED,   // 접수
    PREPARING,  // 준비중
    COMPLETED;  // 완료

    public boolean canTransitionTo(OrderStatus next) {
        return switch (this) {
            case PENDING -> next == ACCEPTED;
            case ACCEPTED -> next == PREPARING;
            case PREPARING -> next == COMPLETED;
            case COMPLETED -> false;
        };
    }
}
