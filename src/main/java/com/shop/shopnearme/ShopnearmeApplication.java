package com.shop.shopnearme;

import com.shop.shopnearme.model.Category;
import com.shop.shopnearme.model.Role;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.model.User;
import com.shop.shopnearme.repository.CategoryRepository;
import com.shop.shopnearme.repository.ShopRepository;
import com.shop.shopnearme.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ShopnearmeApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopnearmeApplication.class, args);
	}

	@Bean
	CommandLineRunner run(UserRepository userRepository, ShopRepository shopRepository,
			CategoryRepository categoryRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
				User admin = new User();
				admin.setName("Super Admin");
				admin.setEmail("admin@gmail.com");
				admin.setPassword(passwordEncoder.encode("admin"));
				admin.setRole(Role.ADMIN);
				userRepository.save(admin);
				System.out.println("Seeded Admin User (admin@gmail.com)");
			}

			if (userRepository.findByEmail("shopkeeper@example.com").isEmpty()) {
				User shopkeeper = new User();
				shopkeeper.setName("Shopkeeper User");
				shopkeeper.setEmail("shopkeeper@example.com");
				shopkeeper.setPassword(passwordEncoder.encode("password"));
				shopkeeper.setRole(Role.SHOPKEEPER);
				userRepository.save(shopkeeper);
				System.out.println("Seeded Shopkeeper User");
			}

			String[] categories = {
					"Kirana & General Store", "Fruits & Vegetables", "Medicines & Pharmacy",
					"Restaurants & Food", "Sweet Shop & Bakery", "Electronics & Mobile",
					"Clothing & Fashion", "Salon & Spa", "Hardware & Electricals",
					"Books & Stationery", "Dairy & Milk Booth", "Automobile Service"
			};

			for (String catName : categories) {
				if (categoryRepository.findByName(catName).isEmpty()) {
					Category category = new Category();
					category.setName(catName);
					category.setDescription("Best " + catName + " near you");
					categoryRepository.save(category);
				}
			}
		};
	}
}
