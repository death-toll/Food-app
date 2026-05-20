package com.example.FoodApplication.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AverageRatingResponseDto {
    private Integer restaurantId;
    private String restaurantName;
    private Double averageRating;
    private Long totalRatings;
}

