package com.example.FoodApplication.Dto.Response;

import com.example.FoodApplication.enums.OrderStatus;
import lombok.Data;

import java.util.List;

@Data
public class OrderResponseDto {

    private Integer order_id;
    private OrderStatus status;
    private Integer user_id;
    private Integer restaurant_id;
    private List<Integer> food_id;
}

