package com.agriverse.usernotification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriverse.usernotification.dto.LoginDTO;
import com.agriverse.usernotification.repository.UserRepository;
import com.agriverse.usernotification.security.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	
	private final JwtService jwtService;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginDTO dto){
		var user = userRepository.findByEmail(dto.getEmail())
				.orElseThrow(()->new RuntimeException("User not Found"));
		
		if(!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
			throw new RuntimeException("Invalid credentials");
		}
		String token=jwtService.generateToken(user.getEmail());
		return ResponseEntity.ok(token);
	}
}
