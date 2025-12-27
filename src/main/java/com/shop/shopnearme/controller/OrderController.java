package com.shop.shopnearme.controller;

import com.shop.shopnearme.model.Order;
import com.shop.shopnearme.model.Product;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.OrderRepository;
import com.shop.shopnearme.repository.ProductRepository;
import com.shop.shopnearme.repository.ShopRepository;
import com.shop.shopnearme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<Order>> getShopOrders(@PathVariable Long shopId) {
        return ResponseEntity.ok(orderRepository.findByShopIdOrderByCreatedAtDesc(shopId));
    }

    @PostMapping("/shop/{shopId}/mock")
    public ResponseEntity<Order> placeMockOrder(@PathVariable Long shopId, @RequestBody Map<String, Object> payload) {
        Shop shop = shopRepository.findById(shopId).orElseThrow();

        Order order = new Order();
        order.setShop(shop);
        order.setTotalAmount(Double.valueOf(payload.get("amount").toString()));
        order.setStatus("PENDING");
        // Mocking user/products
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PostMapping("/{shopId}/simulate")
    public ResponseEntity<?> simulateData(@PathVariable Long shopId) {
        Shop shop = shopRepository.findById(shopId).orElseThrow();
        for (int i = 0; i < 5; i++) {
            Order order = new Order();
            order.setShop(shop);
            order.setTotalAmount(100.0 + (Math.random() * 900.0));
            order.setStatus(Math.random() > 0.3 ? "COMPLETED" : "PENDING");
            orderRepository.save(order);
        }
        return ResponseEntity.ok("Simulated 5 orders");
    }

    @GetMapping("/shop/{shopId}/stats")
    public ResponseEntity<Map<String, Object>> getShopStats(@PathVariable Long shopId) {
        Shop shop = shopRepository.findById(shopId).orElseThrow();
        List<Order> orders = orderRepository.findByShopIdOrderByCreatedAtDesc(shopId);

        double totalSales = orders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long pendingOrders = orders.stream().filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())).count();
        long completedOrders = orders.stream().filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalViews", shop.getViews());
        stats.put("totalOrders", orders.size());
        stats.put("totalSales", totalSales);
        stats.put("pendingOrders", pendingOrders);
        stats.put("rating", 4.2); // Placeholder

        return ResponseEntity.ok(stats);
    }
}
