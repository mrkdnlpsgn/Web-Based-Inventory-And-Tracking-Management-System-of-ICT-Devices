package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.ForgotPasswordRequest;
import com.sanjose.inventory.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Value("${jwt.expiration:28800000}")
    private int jwtExpiration;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body,
                                                      HttpServletResponse response) {
        String identifier = body.get("identifier");
        String password   = body.get("password");
        Map<String, Object> result = authService.login(identifier, password);

        String token = (String) result.get("token");
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(jwtExpiration / 1000);
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("user", result.get("user")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.username(), req.newPassword());
        return ResponseEntity.ok(Map.of("message",
            "If an account with that username exists, its password has been reset."));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of("username", principal.getUsername(),
                                        "authorities", principal.getAuthorities()));
    }
}
