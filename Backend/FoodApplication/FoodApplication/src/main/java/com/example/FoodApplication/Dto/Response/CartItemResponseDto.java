package com.example.FoodApplication.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponseDto {
    private Integer cartItemId;
    private Integer foodId;
    private String foodName;
    private Double foodPrice;
    private Integer restaurantId;
    private String restaurantName;
    private Integer quantity;
    private Double subtotal;
}

