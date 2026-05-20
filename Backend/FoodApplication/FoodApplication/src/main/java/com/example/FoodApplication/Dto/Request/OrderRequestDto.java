package com.example.FoodApplication.Dto.Request;

import com.example.FoodApplication.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDto {

    @NotNull
    private OrderStatus status;

    @NotNull
    @Positive
    private Integer user_id;

    @NotNull
    @Positive
    private Integer restaurant_id;

    private List<Integer> food_id;
}

