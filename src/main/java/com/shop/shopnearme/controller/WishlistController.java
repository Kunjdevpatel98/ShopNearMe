package com.shop.shopnearme.controller;

import com.shop.shopnearme.model.Product;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.model.Wishlist;
import com.shop.shopnearme.repository.ProductRepository;
import com.shop.shopnearme.repository.UserRepository;
import com.shop.shopnearme.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/{productId}")
    @Transactional
    public ResponseEntity<?> toggleWishlist(@PathVariable Long productId) {
        try {
            User user = getCurrentUser();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Optional<Wishlist> existingWishlist = wishlistRepository.findByUserAndProduct(user, product);

            if (existingWishlist.isPresent()) {
                wishlistRepository.delete(existingWishlist.get());
                return ResponseEntity.ok(Map.of("message", "Removed from wishlist", "liked", false));
            } else {
                Wishlist wishlist = new Wishlist(user, product);
                wishlistRepository.save(wishlist);
                return ResponseEntity.ok(Map.of("message", "Added to wishlist", "liked", true));
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Product>> getWishlist() {
        User user = getCurrentUser();
        List<Product> products = wishlistRepository.findWishlistProductsByUser(user);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getWishlistIds() {
        User user = getCurrentUser();
        List<Long> ids = wishlistRepository.findWishlistProductIdsByUser(user);
        return ResponseEntity.ok(ids);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
