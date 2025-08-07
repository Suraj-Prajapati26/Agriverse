package com.agriverse.usernotification.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.agriverse.usernotification.dto.UserDTO;
import com.agriverse.usernotification.model.User;
import com.agriverse.usernotification.repository.UserRepository;
import com.agriverse.usernotification.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // -------------------- Public Endpoints --------------------
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserDTO dto) {
        User createdUser = userService.register(dto);
        return ResponseEntity.ok(createdUser);
    }

    // -------------------- Farmer Endpoints --------------------
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody Map<String, String> updates) {
        String email = authentication.getName();
        User updatedUser = userService.updateProfile(email, updates);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(Authentication authentication, @RequestBody Map<String, String> body) {
        String email = authentication.getName();
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        userService.changePassword(email, oldPassword, newPassword);
        return ResponseEntity.ok("Password updated successfully");
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMyAccount(Authentication authentication) {
        String email = authentication.getName();
        userService.deleteMyAccount(email);
        return ResponseEntity.ok("Account deleted successfully");
    }

    // -------------------- Admin Endpoints --------------------
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        User updatedUser = userService.updateUserRole(id, newRole);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
