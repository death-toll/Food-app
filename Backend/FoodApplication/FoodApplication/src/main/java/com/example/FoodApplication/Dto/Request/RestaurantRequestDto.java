package com.example.FoodApplication.Dto.Request;

import com.example.FoodApplication.enums.Foodtype;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.sql.Date;
import java.util.List;
@Data
public class RestaurantRequestDto {

    @NotBlank
    private String name;

    @NotNull
    private Foodtype foodtype;

    @NotBlank
    private String street;

    @NotBlank
    private String city;

    @NotNull
    private Integer ownerId;

    @NotBlank
    private String state;

    private List<Integer> food_available_id;

    @NotNull
    private Date date;

}
