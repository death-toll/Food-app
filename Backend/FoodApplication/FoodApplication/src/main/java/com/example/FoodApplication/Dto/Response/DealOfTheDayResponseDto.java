package com.example.FoodApplication.Dto.Response;

import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DealOfTheDayResponseDto {

    private Integer foodId;
    private String foodName;
    private String description;
    private Foodtype type;
    private Cuisines cuisine;
    private Double originalPrice;
    private Double discountedPrice;
    private Double discountPercent;
    private LocalDate dealDate;
    private Integer restaurantId;
    private String restaurantName;
}

