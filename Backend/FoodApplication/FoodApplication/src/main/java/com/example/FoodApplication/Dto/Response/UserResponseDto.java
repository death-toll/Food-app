package com.example.FoodApplication.Dto.Response;

import com.example.FoodApplication.enums.Roles;
import lombok.Data;

@Data
public class UserResponseDto {

    private Integer user_id;
    private Integer age;
    private String name;
    private String street;
    private String city;
    private String state;
    private String email;
    private Roles role;
}

