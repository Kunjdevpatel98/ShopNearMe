package com.shop.shopnearme.config;

import com.shop.shopnearme.model.Category;
import com.shop.shopnearme.model.Role;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.CategoryRepository;
import com.shop.shopnearme.repository.ShopRepository;
import com.shop.shopnearme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCategoriesAndShops();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@shopnearme.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            User user = new User();
            user.setName("John Doe");
            user.setEmail("user@shopnearme.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(Role.USER);
            userRepository.save(user);

            System.out.println("Seeded Users: admin@shopnearme.com / admin123");
        }
    }

    private void seedCategoriesAndShops() {
        if (categoryRepository.count() == 0) {
            Category grocery = new Category();
            grocery.setName("Grocery");
            grocery.setDescription("Daily essentials and food items");
            categoryRepository.save(grocery);

            Category pharmacy = new Category();
            pharmacy.setName("Pharmacy");
            pharmacy.setDescription("Medicines and health products");
            categoryRepository.save(pharmacy);

            Category restaurant = new Category();
            restaurant.setName("Restaurant");
            restaurant.setDescription("Food and dining");
            categoryRepository.save(restaurant);

            // Seed Shops
            Shop shop1 = new Shop();
            shop1.setName("Fresh Mart");
            shop1.setDescription("Best fresh vegetables and fruits.");
            shop1.setAddress("123 Main St");
            shop1.setCity("New York");
            shop1.setLatitude(40.7128);
            shop1.setLongitude(-74.0060);
            shop1.setPhone("123-456-7890");
            shop1.setOpen(true);
            shop1.setCategory(grocery);
            shopRepository.save(shop1);

            Shop shop2 = new Shop();
            shop2.setName("City Pharmacy");
            shop2.setDescription("24/7 Pharmacy.");
            shop2.setAddress("456 Broadway");
            shop2.setCity("New York");
            shop2.setLatitude(40.7138);
            shop2.setLongitude(-74.0070);
            shop2.setPhone("987-654-3210");
            shop2.setOpen(true);
            shop2.setCategory(pharmacy);
            shopRepository.save(shop2);

            Shop shop3 = new Shop();
            shop3.setName("Tasty Bites");
            shop3.setDescription("Delicious fast food.");
            shop3.setAddress("789 Market St");
            shop3.setCity("San Francisco");
            shop3.setLatitude(37.7749);
            shop3.setLongitude(-122.4194);
            shop3.setPhone("555-123-4567");
            shop3.setOpen(false);
            shop3.setCategory(restaurant);
            shopRepository.save(shop3);

            System.out.println("Seeded Categories and Shops");
        }
    }
}
