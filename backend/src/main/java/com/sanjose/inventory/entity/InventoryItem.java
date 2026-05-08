package com.sanjose.inventory.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", unique = true, nullable = false)
    private Product product;

    @Min(0)
    @Column(nullable = false)
    private Integer quantity;

    @Min(0)
    @Column(name = "min_stock_level", nullable = false)
    private Integer minStockLevel;

    @Column(length = 100)
    private String location;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
