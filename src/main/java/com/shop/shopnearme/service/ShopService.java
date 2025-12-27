package com.shop.shopnearme.service;

import com.shop.shopnearme.model.Shop;
import com.shop.shopnearme.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    public List<Shop> getAllShops(Long categoryId, String city, String search) {
        if (categoryId == null && city == null && search == null) {
            return shopRepository.findAll();
        }
        return shopRepository.searchShops(categoryId, city, search);
    }

    public Shop getShopById(Long id) {
        return shopRepository.findById(id).orElseThrow(() -> new RuntimeException("Shop not found"));
    }

    public List<Shop> getShopsByOwner(com.shop.shopnearme.model.User owner) {
        return shopRepository.findByOwner(owner);
    }

    public Shop createShop(Shop shop, com.shop.shopnearme.model.User owner) {
        shop.setOwner(owner);
        return shopRepository.save(shop);
    }

    // Overload for backward compatibility or admin usage without explicit owner
    // passed in service
    public Shop createShop(Shop shop) {
        return shopRepository.save(shop);
    }

    public Shop updateShop(Long id, Shop shopDetails) {
        Shop shop = getShopById(id);
        shop.setName(shopDetails.getName());
        shop.setDescription(shopDetails.getDescription());
        shop.setAddress(shopDetails.getAddress());
        shop.setCity(shopDetails.getCity());
        shop.setLatitude(shopDetails.getLatitude());
        shop.setLongitude(shopDetails.getLongitude());
        shop.setPhone(shopDetails.getPhone());
        shop.setOpen(shopDetails.isOpen());
        shop.setCategory(shopDetails.getCategory());

        // New fields
        shop.setImageUrl(shopDetails.getImageUrl());
        shop.setOpeningTime(shopDetails.getOpeningTime());
        shop.setClosingTime(shopDetails.getClosingTime());
        shop.setClosedOnSunday(shopDetails.isClosedOnSunday());
        shop.setOffers(shopDetails.getOffers());
        shop.setServices(shopDetails.getServices());
        shop.setTags(shopDetails.getTags());
        shop.setVisible(shopDetails.isVisible());
        shop.setCommunicationMode(shopDetails.getCommunicationMode());

        return shopRepository.save(shop);
    }

    public void deleteShop(Long id) {
        shopRepository.deleteById(id);
    }

    public void updateShopStatus(Long id, boolean isOpen) {
        Shop shop = getShopById(id);
        shop.setOpen(isOpen);
        shopRepository.save(shop);
    }
}
