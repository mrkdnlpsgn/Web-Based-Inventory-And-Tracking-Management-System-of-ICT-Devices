package com.sanjose.inventory.service;

import com.sanjose.inventory.entity.InventoryItem;
import com.sanjose.inventory.entity.Product;
import com.sanjose.inventory.entity.StockTransaction;
import com.sanjose.inventory.entity.TransactionType;
import com.sanjose.inventory.exception.InsufficientStockException;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.InventoryItemRepository;
import com.sanjose.inventory.repository.ProductRepository;
import com.sanjose.inventory.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockTransactionService {

    private final StockTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public List<StockTransaction> findAll() {
        return transactionRepository.findAll();
    }

    public StockTransaction findById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
    }

    public List<StockTransaction> findByProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<StockTransaction> findByType(TransactionType type) {
        return transactionRepository.findByTypeOrderByCreatedAtDesc(type);
    }

    @Transactional
    public StockTransaction create(StockTransaction transaction) {
        Long productId = transaction.getProduct().getId();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        transaction.setProduct(product);

        InventoryItem inventoryItem = inventoryItemRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory record not found for product id: " + productId));

        applyTransaction(inventoryItem, transaction);
        inventoryItemRepository.save(inventoryItem);
        return transactionRepository.save(transaction);
    }

    private void applyTransaction(InventoryItem item, StockTransaction transaction) {
        switch (transaction.getType()) {
            case IN -> item.setQuantity(item.getQuantity() + transaction.getQuantity());
            case OUT -> {
                if (item.getQuantity() < transaction.getQuantity()) {
                    throw new InsufficientStockException(
                            "Insufficient stock. Available: " + item.getQuantity() +
                            ", Requested: " + transaction.getQuantity());
                }
                item.setQuantity(item.getQuantity() - transaction.getQuantity());
            }
            case ADJUSTMENT -> item.setQuantity(transaction.getQuantity());
        }
    }
}
