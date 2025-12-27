package com.shop.shopnearme.repository;

import com.shop.shopnearme.model.Product;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Optional<Wishlist> findByUserAndProduct(User user, Product product);

    @Query("SELECT w.product FROM Wishlist w JOIN FETCH w.product.shop JOIN FETCH w.product.category WHERE w.user = :user")
    List<Product> findWishlistProductsByUser(@Param("user") User user);

    @Query("SELECT w.product.id FROM Wishlist w WHERE w.user = :user")
    List<Long> findWishlistProductIdsByUser(@Param("user") User user);
}
