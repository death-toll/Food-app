package com.example.FoodApplication.Dto.Response;

import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import lombok.Data;

import java.util.List;

@Data
public class UserPrefResponseDto {

    private Integer user_id;
    private List<Integer> restaurant_id;
    private List<Integer> food_id;
    private List<Cuisines> cuisines;
    private Foodtype foodtype;

}

