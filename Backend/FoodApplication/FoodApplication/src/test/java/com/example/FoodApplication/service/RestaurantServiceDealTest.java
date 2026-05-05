package com.example.FoodApplication.service;

import com.example.FoodApplication.Service.RestaurantService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RestaurantServiceDealTest {

    private final RestaurantService restaurantService = new RestaurantService(null, null, null);

    @Test
    void calculateDiscountedPrice_applies10PercentOff() {
        assertEquals(90.0, restaurantService.calculateDiscountedPrice(100.0));
    }

    @Test
    void calculateDiscountedPrice_roundsTo2Decimals() {
        assertEquals(179.10, restaurantService.calculateDiscountedPrice(199.0));
    }
}
