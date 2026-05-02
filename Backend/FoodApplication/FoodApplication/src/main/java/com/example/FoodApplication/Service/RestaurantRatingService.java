package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.RestaurantRatingRequestDto;
import com.example.FoodApplication.Dto.Response.AverageRatingResponseDto;
import com.example.FoodApplication.Dto.Response.RestaurantRatingResponseDto;
import com.example.FoodApplication.Entity.Restaurant;
import com.example.FoodApplication.Entity.RestaurantRating;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.RestaurantRatingRepo;
import com.example.FoodApplication.Repository.RestaurantRepo;
import com.example.FoodApplication.Repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RestaurantRatingService {

    private final RestaurantRatingRepo restaurantRatingRepo;
    private final RestaurantRepo restaurantRepo;
    private final UserRepo userRepo;

    public RestaurantRatingService(RestaurantRatingRepo restaurantRatingRepo, RestaurantRepo restaurantRepo, UserRepo userRepo) {
        this.restaurantRatingRepo = restaurantRatingRepo;
        this.restaurantRepo = restaurantRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public RestaurantRatingResponseDto rateRestaurant(Integer userId, RestaurantRatingRequestDto request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        Restaurant restaurant = restaurantRepo.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + request.getRestaurantId()));

        // One review per user per restaurant (unique constraint). If it exists, update it.
        RestaurantRating rating = restaurantRatingRepo.findByUserIdAndRestaurantId(userId, request.getRestaurantId())
                .orElseGet(RestaurantRating::new);

        if (rating.getRatingId() == null) {
            rating.setUser(user);
            rating.setRestaurant(restaurant);
        }

        rating.setRating(request.getRating());
        rating.setReview(request.getReview());

        RestaurantRating saved = restaurantRatingRepo.save(rating);

        // Optional: also update Restaurant.rating with rounded average so existing APIs still show rating
        updateRestaurantRoundedRating(restaurant);

        return toDto(saved);
    }

    public List<RestaurantRatingResponseDto> getRatingsForRestaurant(Integer restaurantId) {
        if (!restaurantRepo.existsById(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId);
        }
        return restaurantRatingRepo.findByRestaurantId(restaurantId).stream().map(this::toDto).toList();
    }

    public RestaurantRatingResponseDto getMyRatingForRestaurant(Integer userId, Integer restaurantId) {
        if (!restaurantRepo.existsById(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId);
        }

        RestaurantRating rr = restaurantRatingRepo.findByUserIdAndRestaurantId(userId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No review found"));

        return toDto(rr);
    }

    public AverageRatingResponseDto getAverageRating(Integer restaurantId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        Double avg = restaurantRatingRepo.averageForRestaurant(restaurantId);
        Long count = restaurantRatingRepo.countForRestaurant(restaurantId);

        double avgSafe = avg == null ? 0.0 : avg;
        // round to 2 decimals
        double rounded = Math.round(avgSafe * 100.0) / 100.0;

        return new AverageRatingResponseDto(restaurantId, restaurant.getName(), rounded, count == null ? 0L : count);
    }

    @Transactional
    protected void updateRestaurantRoundedRating(Restaurant restaurant) {
        Double avg = restaurantRatingRepo.averageForRestaurant(restaurant.getRestaurant_id());
        int rounded = avg == null ? 0 : (int) Math.round(avg);
        restaurant.setRating(rounded);
        restaurantRepo.save(restaurant);
    }

    private RestaurantRatingResponseDto toDto(RestaurantRating rr) {
        return new RestaurantRatingResponseDto(
                rr.getRatingId(),
                rr.getUser() == null ? null : rr.getUser().getUser_id(),
                rr.getUser() == null ? null : rr.getUser().getName(),
                rr.getRestaurant() == null ? null : rr.getRestaurant().getRestaurant_id(),
                rr.getRestaurant() == null ? null : rr.getRestaurant().getName(),
                rr.getRating(),
                rr.getReview(),
                rr.getCreatedAt(),
                rr.getUpdatedAt()
        );
    }
}

