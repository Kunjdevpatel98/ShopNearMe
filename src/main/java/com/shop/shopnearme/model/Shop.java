package com.shop.shopnearme.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "shops")
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(length = 1000)
    private String description;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String phone;

    @JsonProperty("open")
    private boolean isOpen;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    private String openingTime; // e.g., "09:00 AM"
    private String closingTime; // e.g., "09:00 PM"
    private boolean isClosedOnSunday;

    private String offers; // e.g., "10% off"
    private String services; // e.g., "Delivery, Pickup"
    private String tags; // e.g., "Grocery, Fresh"

    private boolean isVisible = true;
    private int views = 0;

    @Enumerated(EnumType.STRING)
    private CommunicationMode communicationMode = CommunicationMode.BOTH;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @JsonProperty("manualOpen")
    public boolean isManualOpen() {
        return isOpen;
    }

    @JsonProperty("open")
    public boolean isOpen() {
        // Master Manual Toggle: If shopkeeper manually closed the shop, return false
        // immediately.
        if (!isOpen) {
            return false;
        }

        // Dynamic calculation based on time
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now();

        if (isClosedOnSunday && today.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            return false;
        }

        if (openingTime == null || closingTime == null || openingTime.isBlank() || closingTime.isBlank()) {
            // Fallback: if no time set, respect the manual field state (which we know is
            // true at this point)
            return true;
        }

        try {
            // Normalized patterns to try
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a",
                    java.util.Locale.ENGLISH);

            // Handle simple "HH:mm" case just in case
            if (!openingTime.toUpperCase().contains("AM") && !openingTime.toUpperCase().contains("PM")) {
                formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            }

            java.time.LocalTime open = java.time.LocalTime.parse(openingTime, formatter);
            java.time.LocalTime close = java.time.LocalTime.parse(closingTime, formatter);

            // Handle overnight hours (e.g. 10 PM to 2 AM)
            if (open.isAfter(close)) {
                return now.isAfter(open) || now.isBefore(close);
            } else {
                return now.isAfter(open) && now.isBefore(close);
            }
        } catch (Exception e) {
            // In case of parse error, fallback to true since manual toggle is ON
            return true;
        }
    }

    public void setOpen(boolean open) {
        isOpen = open;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(String openingTime) {
        this.openingTime = openingTime;
    }

    public String getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(String closingTime) {
        this.closingTime = closingTime;
    }

    public boolean isClosedOnSunday() {
        return isClosedOnSunday;
    }

    public void setClosedOnSunday(boolean closedOnSunday) {
        isClosedOnSunday = closedOnSunday;
    }

    public String getOffers() {
        return offers;
    }

    public void setOffers(String offers) {
        this.offers = offers;
    }

    public String getServices() {
        return services;
    }

    public void setServices(String services) {
        this.services = services;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public boolean isVisible() {
        return isVisible;
    }

    public void setVisible(boolean visible) {
        isVisible = visible;
    }

    public int getViews() {
        return views;
    }

    public void setViews(int views) {
        this.views = views;
    }

    public CommunicationMode getCommunicationMode() {
        return communicationMode;
    }

    public void setCommunicationMode(CommunicationMode communicationMode) {
        this.communicationMode = communicationMode;
    }
}
