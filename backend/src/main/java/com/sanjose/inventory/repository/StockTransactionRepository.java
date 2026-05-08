package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.StockTransaction;
import com.sanjose.inventory.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<StockTransaction> findByTypeOrderByCreatedAtDesc(TransactionType type);
}
