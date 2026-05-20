package com.example.FoodApplication.Dto.Request;

import com.example.FoodApplication.enums.Roles;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRequestDto {

    @PositiveOrZero
    private Integer age;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    private String street;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotNull
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 255)
    private String password;

    @NotNull
    private Roles role;
}

