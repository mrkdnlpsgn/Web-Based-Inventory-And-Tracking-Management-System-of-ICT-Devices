package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.CategoryRequest;
import com.sanjose.inventory.entity.Category;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    public Category create(CategoryRequest req) {
        Category cat = Category.builder()
                .categoryName(req.getCategoryName())
                .description(req.getDescription())
                .build();
        Category saved = categoryRepository.save(cat);
        auditLogService.log("CATEGORY_CREATED", "Categories", saved.getId(), "category", saved.getCategoryName());
        return saved;
    }

    public Category update(Long id, CategoryRequest req) {
        Category cat = findById(id);
        cat.setCategoryName(req.getCategoryName());
        cat.setDescription(req.getDescription());
        Category saved = categoryRepository.save(cat);
        auditLogService.log("CATEGORY_UPDATED", "Categories", saved.getId(), "category", saved.getCategoryName());
        return saved;
    }

    public void delete(Long id) {
        Category cat = findById(id);
        categoryRepository.delete(cat);
        auditLogService.log("CATEGORY_DELETED", "Categories", id, "category", cat.getCategoryName());
    }
}
