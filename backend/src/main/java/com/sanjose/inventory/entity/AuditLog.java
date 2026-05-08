package com.sanjose.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String action;       // CREATE | UPDATE | DELETE

    @Column(length = 50)
    private String module;       // EQUIPMENT | DEVICE | TRACKING | USER

    @Column(length = 500)
    private String description;

    @Column(name = "performed_by", length = 150)
    private String performedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
