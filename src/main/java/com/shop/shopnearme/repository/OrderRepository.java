package com.shop.shopnearme.repository;

import com.shop.shopnearme.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByShopIdOrderByCreatedAtDesc(Long shopId);

    Long countByShopId(Long shopId);
}
