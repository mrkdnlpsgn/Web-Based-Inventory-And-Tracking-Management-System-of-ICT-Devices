package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.UserRequest;
import com.sanjose.inventory.dto.UserResponse;
import com.sanjose.inventory.entity.Office;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.OfficeRepository;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse findById(Long id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    public UserResponse create(UserRequest req) {
        if (userRepository.existsByUsernameIgnoreCase(req.getUsername()))
            throw new IllegalArgumentException("Username already exists: " + req.getUsername());

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "changeme123"))
                .fullName(req.getFullName())
                .role(req.getRole().toUpperCase())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();

        if (req.getOfficeId() != null) {
            Office office = officeRepository.findById(req.getOfficeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Office not found: " + req.getOfficeId()));
            user.setOffice(office);
        }

        User saved = userRepository.save(user);
        auditLogService.log("USER_CREATED", "Users", saved.getId(), "user", "Created: " + saved.getUsername());
        return toResponse(saved);
    }

    public UserResponse update(Long id, UserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getRole() != null) user.setRole(req.getRole().toUpperCase());
        if (req.getIsActive() != null) user.setIsActive(req.getIsActive());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        if (req.getOfficeId() != null) {
            Office office = officeRepository.findById(req.getOfficeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Office not found: " + req.getOfficeId()));
            user.setOffice(office);
        } else if (req.getOfficeId() == null && req.getFullName() != null) {
            user.setOffice(null);
        }

        User saved = userRepository.save(user);
        auditLogService.log("USER_UPDATED", "Users", saved.getId(), "user", "Updated: " + saved.getUsername());
        return toResponse(saved);
    }

    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        userRepository.delete(user);
        auditLogService.log("USER_DELETED", "Users", id, "user", "Deleted: " + user.getUsername());
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new IllegalArgumentException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .role(u.getRole())
                .officeId(u.getOffice() != null ? u.getOffice().getId() : null)
                .officeName(u.getOffice() != null ? u.getOffice().getOfficeName() : null)
                .isActive(u.getIsActive())
                .build();
    }
}
