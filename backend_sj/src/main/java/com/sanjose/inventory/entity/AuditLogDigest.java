package com.sanjose.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log_digests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDigest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "digest_id")
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String digest;

    @Column(name = "covered_entries", nullable = false)
    private Integer coveredEntries;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "generated_by_system", nullable = false)
    private Boolean generatedBySystem;

    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) generatedAt = LocalDateTime.now();
        if (generatedBySystem == null) generatedBySystem = true;
    }
}
