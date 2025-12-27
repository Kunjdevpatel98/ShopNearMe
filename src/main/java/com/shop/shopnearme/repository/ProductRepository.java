package com.shop.shopnearme.repository;

import com.shop.shopnearme.model.Product;
import com.shop.shopnearme.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByShop(Shop shop);

    List<Product> findByShopId(Long shopId);
}
