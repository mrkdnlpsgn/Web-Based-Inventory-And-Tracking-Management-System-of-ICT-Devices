package com.sanjose.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Long id;

    @Column(name = "maintenance_id", nullable = false)
    private Long maintenanceId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;

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
