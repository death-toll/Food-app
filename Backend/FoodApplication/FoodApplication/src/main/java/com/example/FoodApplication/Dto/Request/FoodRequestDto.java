package com.example.FoodApplication.Dto.Request;

import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class FoodRequestDto {

    @NotNull
    @PositiveOrZero
    private Double price;

    @NotBlank
    private String name;

    @NotNull
    private Foodtype type;

    @NotNull
    private Cuisines cuisine;


}

