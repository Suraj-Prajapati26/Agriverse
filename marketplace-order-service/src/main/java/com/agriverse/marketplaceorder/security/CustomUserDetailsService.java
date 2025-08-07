package com.agriverse.marketplaceorder.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.agriverse.marketplaceorder.dto.UserResponse;
import com.agriverse.marketplaceorder.service.UserClientService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserClientService userClientService;

    @Override
    public UserDetails loadUserByUsername(String token) throws UsernameNotFoundException {
        UserResponse userInfo = userClientService.getUserFromToken(token);

        String role = "ROLE_" + userInfo.getRole().toUpperCase();
        return org.springframework.security.core.userdetails.User.builder()
                .username(userInfo.getEmail())
                .password("dummy")
                .authorities(List.of(new SimpleGrantedAuthority(role)))
                .build();
    }

}
