package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.UserRequest;
import com.sanjose.inventory.dto.UserResponse;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse findById(Long id) {
        return toResponse(getUser(id));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();
        UserResponse saved = toResponse(userRepository.save(user));
        auditLogService.log("CREATE", "USER", "Created account for " + request.name() + " (" + request.email() + ") with role " + request.role());
        return saved;
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = getUser(id);
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        UserResponse updated = toResponse(userRepository.save(user));
        auditLogService.log("UPDATE", "USER", "Updated account for " + request.name() + " (" + request.email() + ")");
        return updated;
    }

    @Transactional
    public void delete(Long id, String currentUserEmail) {
        User user = getUser(id);
        if (user.getEmail().equals(currentUserEmail)) {
            throw new IllegalStateException("You cannot delete your own account");
        }
        userRepository.deleteById(id);
        auditLogService.log("DELETE", "USER", "Deleted account: " + user.getName() + " (" + user.getEmail() + ")");
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
