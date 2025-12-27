package com.shop.shopnearme.repository;

import com.shop.shopnearme.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByShopIdOrderByCreatedAtDesc(Long shopId);
}
