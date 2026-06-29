package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.ChangePasswordRequest;
import com.sanjose.inventory.dto.UserRequest;
import com.sanjose.inventory.dto.UserResponse;
import com.sanjose.inventory.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getAll(@RequestParam(required = false) String search) { return userService.findAll(search); }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) { return userService.findById(id); }

    @PostMapping
    public UserResponse create(@RequestBody UserRequest req) { return userService.create(req); }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @RequestBody UserRequest req) {
        return userService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails principal,
                                               @RequestBody ChangePasswordRequest req) {
        userService.changePassword(principal.getUsername(), req.currentPassword(), req.newPassword());
        return ResponseEntity.ok().build();
    }
}
