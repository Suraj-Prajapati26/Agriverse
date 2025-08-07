package com.agriverse.weathercrop.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Temporary: Admin if email == admin@example.com, else USER
        String role = username.equalsIgnoreCase("admin@example.com") ? "ROLE_ADMIN" : "ROLE_USER";

        return User.builder()
                .username(username)
                .password("dummy")
                .authorities(List.of(new SimpleGrantedAuthority(role)))
                .build();
    }
}
