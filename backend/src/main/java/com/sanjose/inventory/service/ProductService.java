package com.sanjose.inventory.service;

import com.sanjose.inventory.entity.Category;
import com.sanjose.inventory.entity.Product;
import com.sanjose.inventory.entity.Supplier;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.CategoryRepository;
import com.sanjose.inventory.repository.ProductRepository;
import com.sanjose.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<Product> findByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> findBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId);
    }

    public List<Product> search(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Product create(Product product) {
        resolveRelationships(product);
        return productRepository.save(product);
    }

    @Transactional
    public Product update(Long id, Product updated) {
        Product existing = findById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setSku(updated.getSku());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setSupplier(updated.getSupplier());
        resolveRelationships(existing);
        return productRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    // Resolve category/supplier by id when provided as nested objects with only id set
    private void resolveRelationships(Product product) {
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + product.getCategory().getId()));
            product.setCategory(category);
        }
        if (product.getSupplier() != null && product.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(product.getSupplier().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Supplier not found with id: " + product.getSupplier().getId()));
            product.setSupplier(supplier);
        }
    }
}
