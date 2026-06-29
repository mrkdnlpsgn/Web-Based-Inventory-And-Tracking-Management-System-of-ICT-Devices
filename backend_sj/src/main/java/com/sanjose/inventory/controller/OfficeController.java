package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.OfficeRequest;
import com.sanjose.inventory.entity.Office;
import com.sanjose.inventory.service.OfficeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offices")
@RequiredArgsConstructor
public class OfficeController {

    private final OfficeService officeService;

    @GetMapping
    public List<Office> getAll() { return officeService.findAll(); }

    @GetMapping("/{id}")
    public Office getById(@PathVariable Long id) { return officeService.findById(id); }

    @PostMapping
    public Office create(@RequestBody OfficeRequest req) { return officeService.create(req); }

    @PutMapping("/{id}")
    public Office update(@PathVariable Long id, @RequestBody OfficeRequest req) {
        return officeService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        officeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
