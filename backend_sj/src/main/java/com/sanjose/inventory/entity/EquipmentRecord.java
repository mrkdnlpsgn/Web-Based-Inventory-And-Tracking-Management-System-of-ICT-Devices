package com.sanjose.inventory.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "equipment_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String type;

    @Column(name = "equipment_type", length = 100)
    private String equipmentType;

    @NotBlank
    @Column(name = "item_code", nullable = false, unique = true, length = 100)
    private String itemCode;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String article;

    @Column(length = 150)
    private String office;

    @Column(length = 150)
    private String location;

    @Column(length = 1000)
    private String description;

    @Column(name = "accountable_person", length = 150)
    private String accountablePerson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "device_count")
    private Integer deviceCount;

    @OneToMany(mappedBy = "equipmentRecord", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<DeviceRecord> devices = new ArrayList<>();

    // Computed total value from linked device records — keeps reports and dashboard working
    public BigDecimal getAmountValue() {
        if (devices == null || devices.isEmpty()) return null;
        return devices.stream()
                .map(DeviceRecord::getAmountValue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
