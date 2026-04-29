package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.RestaurantRequestDto;
import com.example.FoodApplication.Dto.Response.RestaurantResponseDto;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Entity.Restaurant;
import com.example.FoodApplication.Repository.RestaurantRepo;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.enums.Roles;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepo restaurantRepo;
    private final UserRepo userRepo;

    public RestaurantService(RestaurantRepo restaurantRepo, UserRepo userRepo) {
        this.restaurantRepo = restaurantRepo;
        this.userRepo = userRepo;
    }

    public RestaurantResponseDto createRestaurant(RestaurantRequestDto request) {
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setRating(request.getRating());
        restaurant.setFoodtype(request.getFoodtype());
        restaurant.setOwner(resolveOwner(request.getOwnerId()));
        restaurant.setStreet(request.getStreet());
        restaurant.setCity(request.getCity());
        restaurant.setState(request.getState());
        restaurant.setFood_available_id(request.getFood_available_id());
        restaurant.setDate(request.getDate());

        Restaurant saved = restaurantRepo.save(restaurant);
        return toDto(saved);
    }

    public RestaurantResponseDto getRestaurantById(Integer restaurantId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));
        return toDto(restaurant);
    }

    public List<RestaurantResponseDto> getAllRestaurants() {
        return restaurantRepo.findAll().stream().map(this::toDto).toList();
    }

    public RestaurantResponseDto updateRestaurant(Integer restaurantId, RestaurantRequestDto request) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        restaurant.setName(request.getName());
        restaurant.setRating(request.getRating());
        restaurant.setFoodtype(request.getFoodtype());
        restaurant.setOwner(resolveOwner(request.getOwnerId()));
        restaurant.setStreet(request.getStreet());
        restaurant.setCity(request.getCity());
        restaurant.setState(request.getState());
        restaurant.setFood_available_id(request.getFood_available_id());
        restaurant.setDate(request.getDate());

        Restaurant saved = restaurantRepo.save(restaurant);
        return toDto(saved);
    }

    public void deleteRestaurant(Integer restaurantId) {
        if (!restaurantRepo.existsById(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId);
        }
        restaurantRepo.deleteById(restaurantId);
    }

    public RestaurantResponseDto addFoodToRestaurant(Integer restaurantId, Integer foodId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        List<Integer> ids = restaurant.getFood_available_id();
        if (ids == null) {
            ids = new java.util.ArrayList<>();
        }
        if (!ids.contains(foodId)) {
            ids.add(foodId);
        }

        restaurant.setFood_available_id(ids);
        Restaurant saved = restaurantRepo.save(restaurant);
        return toDto(saved);
    }

    private RestaurantResponseDto toDto(Restaurant restaurant) {
        RestaurantResponseDto dto = new RestaurantResponseDto();
        dto.setRestaurant_id(restaurant.getRestaurant_id());
        dto.setName(restaurant.getName());
        dto.setRating(restaurant.getRating());
        dto.setFoodtype(restaurant.getFoodtype());
        dto.setOwnerId(restaurant.getOwner() == null ? null : restaurant.getOwner().getUser_id());
        dto.setStreet(restaurant.getStreet());
        dto.setCity(restaurant.getCity());
        dto.setState(restaurant.getState());
        dto.setFood_available_id(restaurant.getFood_available_id());
        dto.setDate(restaurant.getDate());
        return dto;
    }

    private User resolveOwner(Integer ownerId) {
        if (ownerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ownerId is required");
        }

        User user = userRepo.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + ownerId));

        if (user.getRole() != Roles.OWNER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not an OWNER: " + ownerId);
        }

        return user;
    }
}

