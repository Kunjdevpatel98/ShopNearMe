package com.shop.shopnearme.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shop.shopnearme.model.Product;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.UserRepository;
import com.shop.shopnearme.service.ProductService;
import com.shop.shopnearme.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/shop/{shopId}")
    public List<Product> getProductsByShop(@PathVariable Long shopId) {
        System.out.println("DEBUG: Request received for getProductsByShop with ID: " + shopId);
        try {
            List<Product> products = productService.getProductsByShopId(shopId);
            System.out.println("DEBUG: Retrieved " + products.size() + " products for shop " + shopId);
            return products;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to fetch products for shop " + shopId);
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/shop/{shopId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public ResponseEntity<?> createProduct(@PathVariable Long shopId, @RequestBody Product product) {
        try {
            Shop shop = shopService.getShopById(shopId);
            User currentUser = getCurrentUser();

            // Enforce ownership check
            System.out.println("DEBUG: Creating Product for Shop ID: " + shopId);
            System.out.println(
                    "DEBUG: Current User: " + currentUser.getEmail() + " (Role: " + currentUser.getRole() + ")");

            if (shop.getOwner() == null) {
                System.out.println("DEBUG: Shop has NO owner.");
                // In case of legacy data or error, allow ADMIN or fail safe
                if (currentUser.getRole() == null || !currentUser.getRole().name().equals("ADMIN")) {
                    return ResponseEntity.status(403).body("Shop has no owner, and you are not Admin.");
                }
            } else {
                System.out.println("DEBUG: Shop Owner ID: " + shop.getOwner().getId() + " vs Current User ID: "
                        + currentUser.getId());
                if (!shop.getOwner().getId().equals(currentUser.getId())
                        && (currentUser.getRole() == null || !currentUser.getRole().name().equals("ADMIN"))) {
                    System.out.println("DEBUG: Authorization Failed!");
                    return ResponseEntity.status(403)
                            .body("You are not authorized to add products to this shop. Owner ID mismatch.");
                }
            }

            return ResponseEntity.ok(productService.createProduct(product, shopId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to save product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product existingProduct = productService.getProductById(id);
        User currentUser = getCurrentUser();

        if (existingProduct.getShop().getOwner() != null
                && !existingProduct.getShop().getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body("You are not authorized to update this product");
        }

        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    public static class AvailabilityRequest {
        private boolean available;

        @JsonProperty("isAvailable")
        public boolean isAvailable() {
            return available;
        }

        @JsonProperty("isAvailable")
        public void setAvailable(boolean available) {
            this.available = available;
        }
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public ResponseEntity<?> toggleProductAvailability(@PathVariable Long id,
            @RequestBody AvailabilityRequest payload) {
        boolean isAvailable = payload.isAvailable();
        System.out.println("DEBUG: Toggling product " + id + " to " + isAvailable);

        Product existingProduct = productService.getProductById(id);
        User currentUser = getCurrentUser();
        System.out.println("DEBUG: Current User: " + currentUser.getEmail() + ", Role: " + currentUser.getRole());

        if (existingProduct.getShop().getOwner() != null
                && !existingProduct.getShop().getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            System.out.println("DEBUG: Unauthorized access attempt by " + currentUser.getEmail());
            return ResponseEntity.status(403).body("You are not authorized to toggle availability for this product");
        }

        productService.updateProductAvailability(id, isAvailable);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product existingProduct = productService.getProductById(id);
        User currentUser = getCurrentUser();

        if (existingProduct.getShop().getOwner() != null
                && !existingProduct.getShop().getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body("You are not authorized to delete this product");
        }

        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
