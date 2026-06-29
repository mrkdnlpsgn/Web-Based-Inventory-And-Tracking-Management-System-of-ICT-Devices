package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.CategoryRequest;
import com.sanjose.inventory.entity.Category;
import com.sanjose.inventory.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<Category> getAll() { return categoryService.findAll(); }

    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) { return categoryService.findById(id); }

    @PostMapping
    public Category create(@RequestBody CategoryRequest req) { return categoryService.create(req); }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody CategoryRequest req) {
        return categoryService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
