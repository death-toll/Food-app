package com.example.FoodApplication.Dto.Auth;

import com.example.FoodApplication.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MeResponse {
    private Integer userId;
    private String email;
    private String name;
    private Roles role;
}

