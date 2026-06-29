package com.sanjose.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "disposal_ledger")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisposalLedger {

    public enum DisposalMethod { AUCTION, DESTRUCTION, DONATION, TRANSFER }
    public enum DisposalStatus { PENDING, APPROVED, COMPLETED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "disposal_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnoreProperties({"category", "office", "accountablePerson", "remarks", "qrCodePath", "sha256Hash"})
    private Asset asset;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "inspection_findings", nullable = false, columnDefinition = "TEXT")
    private String inspectionFindings;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommended_method", nullable = false)
    private DisposalMethod recommendedMethod;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "disposal_status", nullable = false)
    private DisposalStatus disposalStatus = DisposalStatus.PENDING;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @JsonIgnoreProperties({"password", "office", "failedLoginAttempts", "accountLockedUntil"})
    private User approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    @JsonIgnoreProperties({"password", "office", "failedLoginAttempts", "accountLockedUntil"})
    private User recordedBy;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    @Column(name = "delete_reason", columnDefinition = "TEXT")
    private String deleteReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
