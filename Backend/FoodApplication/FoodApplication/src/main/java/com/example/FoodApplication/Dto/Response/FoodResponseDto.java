package com.example.FoodApplication.Dto.Response;

import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import lombok.Data;

@Data
public class FoodResponseDto {

    private Integer food_id;
    private Double price;
    private String name;
    private String description;
    private Foodtype type;
    private Cuisines cuisine;
    private Integer like_count;
}
