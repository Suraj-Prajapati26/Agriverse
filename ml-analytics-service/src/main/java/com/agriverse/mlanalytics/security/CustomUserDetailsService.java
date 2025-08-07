package com.agriverse.mlanalytics.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String role = email.equalsIgnoreCase("admin@example.com") ? "ROLE_ADMIN" : "ROLE_FARMER";
        return User.builder()
                .username(email)
                .password("dummy")
                .authorities(List.of(new SimpleGrantedAuthority(role)))
                .build();
    }
}
