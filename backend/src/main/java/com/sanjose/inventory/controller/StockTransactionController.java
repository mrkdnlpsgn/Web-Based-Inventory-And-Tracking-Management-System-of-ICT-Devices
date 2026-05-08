package com.sanjose.inventory.controller;

import com.sanjose.inventory.entity.StockTransaction;
import com.sanjose.inventory.entity.TransactionType;
import com.sanjose.inventory.service.StockTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class StockTransactionController {

    private final StockTransactionService transactionService;

    @GetMapping
    public List<StockTransaction> getAll(@RequestParam(required = false) TransactionType type) {
        if (type != null) return transactionService.findByType(type);
        return transactionService.findAll();
    }

    @GetMapping("/{id}")
    public StockTransaction getById(@PathVariable Long id) {
        return transactionService.findById(id);
    }

    @GetMapping("/product/{productId}")
    public List<StockTransaction> getByProduct(@PathVariable Long productId) {
        return transactionService.findByProduct(productId);
    }

    @PostMapping
    public ResponseEntity<StockTransaction> create(@Valid @RequestBody StockTransaction transaction) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(transaction));
    }
}
