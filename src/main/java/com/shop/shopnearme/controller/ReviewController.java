package com.shop.shopnearme.controller;

import com.shop.shopnearme.model.Review;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.ReviewRepository;
import com.shop.shopnearme.repository.ShopRepository;
import com.shop.shopnearme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<Review>> getShopReviews(@PathVariable Long shopId) {
        return ResponseEntity.ok(reviewRepository.findByShopIdOrderByCreatedAtDesc(shopId));
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        String username = userDetails.getUsername(); // Assuming username is email
        Optional<User> userOpt = userRepository.findByEmail(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Long shopId = Long.valueOf(payload.get("shopId").toString());
            Double rating = Double.valueOf(payload.get("rating").toString());
            String text = (String) payload.get("text");

            Optional<Shop> shopOpt = shopRepository.findById(shopId);
            if (shopOpt.isPresent()) {
                Review review = new Review();
                review.setUser(user);
                review.setShop(shopOpt.get());
                review.setRating(rating);
                review.setText(text);

                Review savedReview = reviewRepository.save(review);
                return ResponseEntity.ok(savedReview);
            } else {
                return ResponseEntity.badRequest().body("Shop not found");
            }
        }
        return ResponseEntity.status(401).body("User not found");
    }
}
