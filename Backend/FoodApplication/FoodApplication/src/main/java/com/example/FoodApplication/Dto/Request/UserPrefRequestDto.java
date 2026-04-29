package com.example.FoodApplication.Dto.Request;

import com.example.FoodApplication.enums.Foodtype;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
@Data
public class UserPrefRequestDto {

    @NotNull
    private Integer user_id;

    private List<Integer> restaurant_id;

    private List<Integer> food_id;

    @NotNull
    private Foodtype foodtype;


}

