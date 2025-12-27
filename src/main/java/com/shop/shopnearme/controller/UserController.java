package com.shop.shopnearme.controller;

import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(getCurrentUser());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedUser) {
        User currentUser = getCurrentUser();

        if (updatedUser.getName() != null)
            currentUser.setName(updatedUser.getName());
        if (updatedUser.getPhone() != null)
            currentUser.setPhone(updatedUser.getPhone());
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
            currentUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getProfilePhotoUrl() != null)
            currentUser.setProfilePhotoUrl(updatedUser.getProfilePhotoUrl());

        userRepository.save(currentUser);
        return ResponseEntity.ok(currentUser);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody java.util.Map<String, String> passwords) {
        User currentUser = getCurrentUser();
        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect current password");
        }

        currentUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(currentUser);
        return ResponseEntity.ok("Password updated successfully");
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<String> uploadPhoto(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("src/main/resources/static/uploads");
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }
            java.nio.file.Files.copy(file.getInputStream(), uploadPath.resolve(fileName),
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok("/uploads/" + fileName);
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload image");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
