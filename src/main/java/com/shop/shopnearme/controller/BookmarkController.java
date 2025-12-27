package com.shop.shopnearme.controller;

import com.shop.shopnearme.model.Bookmark;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.BookmarkRepository;
import com.shop.shopnearme.repository.ShopRepository;
import com.shop.shopnearme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    // Toggle Bookmark
    @PostMapping("/{shopId}")
    @Transactional
    public ResponseEntity<?> toggleBookmark(@PathVariable Long shopId) {
        User user = getCurrentUser();
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        Optional<Bookmark> existingBookmark = bookmarkRepository.findByUserAndShop(user, shop);

        if (existingBookmark.isPresent()) {
            bookmarkRepository.delete(existingBookmark.get());
            return ResponseEntity.ok(java.util.Map.of("message", "Removed from bookmarks", "bookmarked", false));
        } else {
            Bookmark bookmark = new Bookmark(user, shop);
            bookmarkRepository.save(bookmark);
            return ResponseEntity.ok(java.util.Map.of("message", "Added to bookmarks", "bookmarked", true));
        }
    }

    // Check status
    @GetMapping("/{shopId}/check")
    public ResponseEntity<?> checkBookmarkStatus(@PathVariable Long shopId) {
        User user = getCurrentUser();
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        boolean isBookmarked = bookmarkRepository.existsByUserAndShop(user, shop);
        return ResponseEntity.ok(java.util.Map.of("bookmarked", isBookmarked));
    }

    // List user bookmarks
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Shop>> getUserBookmarks() {
        User user = getCurrentUser();
        List<Shop> bookmarkedShops = bookmarkRepository.findBookmarkedShopsByUser(user);
        return ResponseEntity.ok(bookmarkedShops);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
