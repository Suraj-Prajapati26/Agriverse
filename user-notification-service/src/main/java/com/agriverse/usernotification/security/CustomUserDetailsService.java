package com.agriverse.usernotification.security;

import java.util.Collections;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.agriverse.usernotification.model.User;
import com.agriverse.usernotification.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService{
	
	private final UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

	    return org.springframework.security.core.userdetails.User.builder()
	            .username(user.getEmail())
	            .password(user.getPasswordHash())
	            .authorities("ROLE_" + user.getRole().name()) // Add role prefix
	            .build();
	}

}
