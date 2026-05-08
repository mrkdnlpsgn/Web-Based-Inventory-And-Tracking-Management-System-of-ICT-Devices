package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByProductId(Long productId);
    boolean existsByProductId(Long productId);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minStockLevel")
    List<InventoryItem> findLowStockItems();
}
