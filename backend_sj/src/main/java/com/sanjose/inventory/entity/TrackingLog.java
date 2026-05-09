package com.sanjose.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "tracking_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_record_id", nullable = false)
    @JsonIgnore
    private EquipmentRecord equipmentRecord;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "performed_by", length = 150)
    private String performedBy;

    @Column(length = 150)
    private String location;

    @Column(length = 500)
    private String notes;

    @Column(name = "serial_numbers", length = 500)
    private String serialNumbers;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
