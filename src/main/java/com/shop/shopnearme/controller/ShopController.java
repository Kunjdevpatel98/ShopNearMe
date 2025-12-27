package com.shop.shopnearme.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @GetMapping
    public List<Shop> getAllShops(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search) {
        return shopService.getAllShops(categoryId, city, search);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable Long id) {
        return ResponseEntity.ok(shopService.getShopById(id));
    }

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my-shops")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public List<Shop> getMyShops() {
        User user = getCurrentUser();
        return shopService.getShopsByOwner(user);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public Shop createShop(@RequestBody Shop shop) {
        User user = getCurrentUser();
        return shopService.createShop(shop, user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public ResponseEntity<?> updateShop(@PathVariable Long id, @RequestBody Shop shop) {
        Shop existingShop = shopService.getShopById(id);
        User currentUser = getCurrentUser();

        if (!existingShop.getOwner().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to update this shop");
        }

        return ResponseEntity.ok(shopService.updateShop(id, shop));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public ResponseEntity<?> deleteShop(@PathVariable Long id) {
        Shop existingShop = shopService.getShopById(id);
        User currentUser = getCurrentUser();

        if (!existingShop.getOwner().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to delete this shop");
        }

        shopService.deleteShop(id);
        return ResponseEntity.ok().build();
    }

    public static class ShopStatusRequest {
        private boolean isOpen;

        @JsonProperty("isOpen")
        public boolean isOpen() {
            return isOpen;
        }

        @JsonProperty("isOpen")
        public void setOpen(boolean open) {
            isOpen = open;
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHOPKEEPER')")
    public ResponseEntity<?> updateShopStatus(@PathVariable Long id, @RequestBody ShopStatusRequest payload) {
        boolean isOpen = payload.isOpen();
        System.out.println("DEBUG: Toggling Shop ID " + id + " to " + isOpen);

        Shop existingShop = shopService.getShopById(id);
        User currentUser = getCurrentUser();

        if (existingShop.getOwner() == null) {
            if (!currentUser.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(403).body("Shop has no owner, and you are not Admin.");
            }
        } else if (!existingShop.getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body("You are not authorized to update this shop");
        }

        shopService.updateShopStatus(id, isOpen);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
