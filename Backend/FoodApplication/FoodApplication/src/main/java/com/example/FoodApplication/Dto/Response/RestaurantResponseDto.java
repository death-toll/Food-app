package com.example.FoodApplication.Dto.Response;

import com.example.FoodApplication.enums.Foodtype;
import lombok.Data;

import java.sql.Date;
import java.util.List;
@Data
public class RestaurantResponseDto {

    private Integer restaurant_id;
    private String name;
    private Integer rating;
    private Foodtype foodtype;
    private Integer ownerId;
    private String street;
    private String city;
    private String state;
    private List<Integer> food_available_id;
    private Date date;

}

