package com.sanjose.inventory.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

// Carries tokenVersion alongside the standard Spring Security principal so
// JwtAuthFilter can compare it against the JWT's "tv" claim without a second query.
public class AppUserDetails extends User {

    private final Integer tokenVersion;

    public AppUserDetails(String username, String password,
                           Collection<? extends GrantedAuthority> authorities, Integer tokenVersion) {
        super(username, password, authorities);
        this.tokenVersion = tokenVersion;
    }

    public Integer getTokenVersion() {
        return tokenVersion;
    }
}
