package com.sanjose.inventory.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final WebhookVerificationFilter webhookVerificationFilter;

    // Comma-separated list of allowed CORS origins — override via env var in production
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOriginsConfig;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          RateLimitingFilter rateLimitingFilter,
                          WebhookVerificationFilter webhookVerificationFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.webhookVerificationFilter = webhookVerificationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF: disabled intentionally — JWT stored in HttpOnly cookie, not in Authorization header.
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                // Clickjacking protection
                .frameOptions(frame -> frame.deny())
                // Prevent MIME-type sniffing
                .contentTypeOptions(contentType -> {})
                // Force no caching for all API responses
                .cacheControl(cache -> {})
                // HSTS: 1 year, include subdomains, eligible for browser preload list
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31_536_000)
                    .preload(true))
                // Content Security Policy — strict; no inline scripts, no external resources
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "script-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data:; " +
                    "font-src 'self'; " +
                    "connect-src 'self'; " +
                    "frame-ancestors 'none'; " +
                    "base-uri 'self'; " +
                    "form-action 'self'; " +
                    "object-src 'none';"
                ))
                // Referrer policy: send origin only on same-site; nothing cross-origin (HTTPS→HTTP)
                .addHeaderWriter(new StaticHeadersWriter(
                    "Referrer-Policy", "strict-origin-when-cross-origin"))
                // Permissions policy: deny access to sensitive browser APIs
                .addHeaderWriter(new StaticHeadersWriter(
                    "Permissions-Policy",
                    "camera=(), microphone=(), geolocation=(), payment=(), " +
                    "usb=(), fullscreen=(self), display-capture=()"))
                // DNS prefetch leaks visited URLs — disable
                .addHeaderWriter(new StaticHeadersWriter("X-DNS-Prefetch-Control", "off"))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                // Users: GET + own password change for any authenticated user; all else ADMIN only
                .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/users/me/password").authenticated()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                // Audit logs: ADMIN only
                .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                // Assets: read for all authenticated, mutations ADMIN only
                .requestMatchers(HttpMethod.GET, "/api/assets", "/api/assets/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/assets", "/api/assets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/assets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/assets/**").hasRole("ADMIN")
                // Offices, Categories: read for authenticated, mutations ADMIN only
                .requestMatchers(HttpMethod.GET, "/api/offices", "/api/offices/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/offices").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/offices/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/offices/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/categories").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                // Maintenance, Disposal: read for authenticated, mutations ADMIN only
                .requestMatchers(HttpMethod.GET, "/api/maintenance/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/maintenance").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/maintenance/*/summary").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/maintenance/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/disposal/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/disposal").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/disposal/*/justification").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/disposal/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/disposal/**").hasRole("ADMIN")
                // Asset history: all authenticated
                .requestMatchers("/api/asset-history/**").authenticated()
                // All other endpoints: any authenticated user
                .anyRequest().authenticated()
            )
            // Filter order: rate-limit → webhook-verify → JWT-auth → Spring auth
            .addFilterBefore(rateLimitingFilter,           UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(webhookVerificationFilter,    UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter,                UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Parse comma-separated origins — reject wildcard which is incompatible with credentials
        List<String> origins = Arrays.stream(allowedOriginsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        if (origins.contains("*")) {
            throw new IllegalStateException(
                "cors.allowed-origins must not contain '*' when credentials are enabled. " +
                "Set explicit origins in application.properties or the CORS_ALLOWED_ORIGINS env var.");
        }
        config.setAllowedOrigins(origins);
        config.setAllowCredentials(true);

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Content-Type", "Authorization", "X-Requested-With", "Accept",
            // Webhook headers — needed when frontend simulates scanner hardware
            "X-Webhook-Signature-256", "X-Webhook-Timestamp", "X-Webhook-Id"
        ));
        // Expose rate-limit headers so clients can handle back-pressure gracefully
        config.setExposedHeaders(List.of("Retry-After", "X-RateLimit-Reset"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
