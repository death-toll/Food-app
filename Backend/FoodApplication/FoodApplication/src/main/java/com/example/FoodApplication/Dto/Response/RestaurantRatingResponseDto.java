package com.example.FoodApplication.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantRatingResponseDto {
    private Integer ratingId;
    private Integer userId;
    private String userName;
    private Integer restaurantId;
    private String restaurantName;
    private Integer rating;
    private String review;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

