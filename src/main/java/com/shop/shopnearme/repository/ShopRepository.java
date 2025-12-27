package com.shop.shopnearme.repository;

import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ShopRepository extends JpaRepository<Shop, Long> {
        List<Shop> findByCategoryId(Long categoryId);

        List<Shop> findByCity(String city);

        @Query("SELECT s FROM Shop s WHERE " +
                        "(:categoryId IS NULL OR s.category.id = :categoryId) AND " +
                        "(:city IS NULL OR s.city = :city) AND " +
                        "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.address) LIKE LOWER(CONCAT('%', :search, '%')))")
        List<Shop> searchShops(@Param("categoryId") Long categoryId,
                        @Param("city") String city,
                        @Param("search") String search);

        List<Shop> findByOwner(User owner);
}
