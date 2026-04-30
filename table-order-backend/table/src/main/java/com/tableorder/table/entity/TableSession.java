package com.tableorder.table.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "table_session")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TableSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public static TableSession create(Long tableId, Long storeId) {
        return TableSession.builder()
                .tableId(tableId)
                .storeId(storeId)
                .startedAt(LocalDateTime.now())
                .isActive(true)
                .build();
    }

    public void close() {
        this.isActive = false;
        this.endedAt = LocalDateTime.now();
    }
}
