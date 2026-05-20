package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.RestaurantRatingRequestDto;
import com.example.FoodApplication.Dto.Response.AverageRatingResponseDto;
import com.example.FoodApplication.Dto.Response.RestaurantRatingResponseDto;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.Service.RestaurantRatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/restaurant-ratings")
public class RestaurantRatingController {

    private final RestaurantRatingService restaurantRatingService;
    private final UserRepo userRepo;

    public RestaurantRatingController(RestaurantRatingService restaurantRatingService, UserRepo userRepo) {
        this.restaurantRatingService = restaurantRatingService;
        this.userRepo = userRepo;
    }

    /**
     * Add or update rating for a restaurant (current logged-in user)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER')")
    public RestaurantRatingResponseDto rate(@Valid @RequestBody RestaurantRatingRequestDto request) {
        // Ratings are always stored against the currently authenticated user.
        Integer userId = getCurrentUserId();
        return restaurantRatingService.rateRestaurant(userId, request);
    }

    /**
     * Get the current logged-in user's rating/review for a restaurant.
     */
    @GetMapping("/restaurant/{restaurantId}/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER')")
    public RestaurantRatingResponseDto getMyRating(@PathVariable Integer restaurantId) {
        Integer userId = getCurrentUserId();
        return restaurantRatingService.getMyRatingForRestaurant(userId, restaurantId);
    }

    /**
     * Get all ratings for a restaurant
     */
    @GetMapping("/restaurant/{restaurantId}")
    public List<RestaurantRatingResponseDto> getRatingsForRestaurant(@PathVariable Integer restaurantId) {
        return restaurantRatingService.getRatingsForRestaurant(restaurantId);
    }

    /**
     * Get average rating for a restaurant
     */
    @GetMapping("/restaurant/{restaurantId}/average")
    public AverageRatingResponseDto getAverage(@PathVariable Integer restaurantId) {
        return restaurantRatingService.getAverageRating(restaurantId);
    }

    private Integer getCurrentUserId() {
        // UserDetails principal comes from Spring Security after JWT validation.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        // Convert email (username) to our internal user id.
        User user = userRepo.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return user.getUser_id();
    }
}

