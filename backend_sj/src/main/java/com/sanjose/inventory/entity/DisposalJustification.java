package com.sanjose.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "disposal_justifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisposalJustification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "justification_id")
    private Long id;

    @Column(name = "disposal_id", nullable = false)
    private Long disposalId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String justification;

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
