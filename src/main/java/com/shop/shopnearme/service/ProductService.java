package com.shop.shopnearme.service;

import com.shop.shopnearme.model.Product;
import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.repository.ProductRepository;
import com.shop.shopnearme.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    public List<Product> getProductsByShopId(Long shopId) {
        return productRepository.findByShopId(shopId);
    }

    @Autowired
    private com.shop.shopnearme.repository.CategoryRepository categoryRepository;

    public Product createProduct(Product product, Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        product.setShop(shop);

        if (product.getCategory() != null && product.getCategory().getId() != null) {
            com.shop.shopnearme.model.Category category = categoryRepository.findById(product.getCategory().getId())
                    .orElse(null);
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setImageUrl(productDetails.getImageUrl());
        product.setCategory(productDetails.getCategory());
        product.setAvailable(productDetails.isAvailable());

        return productRepository.save(product);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @org.springframework.transaction.annotation.Transactional
    public void updateProductAvailability(Long id, boolean isAvailable) {
        Product product = getProductById(id);
        product.setAvailable(isAvailable);
        productRepository.save(product);
    }
}
