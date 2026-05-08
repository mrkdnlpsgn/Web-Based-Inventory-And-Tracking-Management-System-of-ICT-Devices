package com.sanjose.inventory.service;

import com.sanjose.inventory.entity.InventoryItem;
import com.sanjose.inventory.entity.Product;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.InventoryItemRepository;
import com.sanjose.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ProductRepository productRepository;

    public List<InventoryItem> findAll() {
        return inventoryItemRepository.findAll();
    }

    public InventoryItem findByProductId(Long productId) {
        return inventoryItemRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory record not found for product id: " + productId));
    }

    public List<InventoryItem> findLowStockItems() {
        return inventoryItemRepository.findLowStockItems();
    }

    @Transactional
    public InventoryItem create(Long productId, InventoryItem item) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        item.setProduct(product);
        return inventoryItemRepository.save(item);
    }

    @Transactional
    public InventoryItem update(Long productId, InventoryItem updated) {
        InventoryItem existing = findByProductId(productId);
        existing.setQuantity(updated.getQuantity());
        existing.setMinStockLevel(updated.getMinStockLevel());
        existing.setLocation(updated.getLocation());
        return inventoryItemRepository.save(existing);
    }

    @Transactional
    public void adjustQuantity(Long productId, int delta) {
        InventoryItem item = findByProductId(productId);
        item.setQuantity(item.getQuantity() + delta);
        inventoryItemRepository.save(item);
    }
}
