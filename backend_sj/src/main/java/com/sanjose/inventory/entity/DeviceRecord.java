package com.sanjose.inventory.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "device_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_record_id", nullable = false)
    @JsonIgnore
    private EquipmentRecord equipmentRecord;

    @Column(name = "item_code", length = 100)
    private String itemCode;

    @Column(length = 150)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "amount_value", precision = 12, scale = 2)
    private BigDecimal amountValue;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "acquisition_date")
    private LocalDate acquisitionDate;
}
