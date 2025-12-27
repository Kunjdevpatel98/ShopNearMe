package com.shop.shopnearme.repository;

import com.shop.shopnearme.model.Bookmark;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUser(User user);

    @Query("SELECT b.shop FROM Bookmark b JOIN FETCH b.shop.category WHERE b.user = :user")
    List<Shop> findBookmarkedShopsByUser(@Param("user") User user);

    Optional<Bookmark> findByUserAndShop(User user, Shop shop);

    boolean existsByUserAndShop(User user, Shop shop);
}
