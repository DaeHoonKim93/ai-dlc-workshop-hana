package com.tableorder.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_attempt", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"store_code", "identifier", "attempt_type"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identifier", nullable = false, length = 100)
    private String identifier;

    @Column(name = "store_code", nullable = false, length = 50)
    private String storeCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "attempt_type", nullable = false, length = 20)
    private AttemptType attemptType;

    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private Integer attemptCount = 0;

    @Column(name = "last_attempt_at", nullable = false)
    private LocalDateTime lastAttemptAt;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    public void incrementFailCount() {
        this.attemptCount++;
        this.lastAttemptAt = LocalDateTime.now();
    }

    public void lock(int lockMinutes) {
        this.lockedUntil = LocalDateTime.now().plusMinutes(lockMinutes);
    }

    public void resetCount() {
        this.attemptCount = 0;
        this.lockedUntil = null;
        this.lastAttemptAt = LocalDateTime.now();
    }

    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    @PrePersist
    protected void onCreate() {
        this.lastAttemptAt = LocalDateTime.now();
    }
}
