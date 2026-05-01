package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.RestaurantRequestDto;
import com.example.FoodApplication.Dto.Response.RestaurantResponseDto;
import com.example.FoodApplication.Entity.Restaurant;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.RestaurantRepo;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.enums.Roles;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        User caller = getAuthenticatedUser();

        // Prevent an owner from creating a restaurant on behalf of a different owner
        if (!caller.getUser_id().equals(request.getOwnerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only create restaurants for your own account");
        }

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setRating(0);
        restaurant.setFoodtype(request.getFoodtype());
        restaurant.setOwner(caller);
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

    public List<RestaurantResponseDto> getRestaurantsByOwnerId(Integer ownerId) {
        if (!userRepo.existsById(ownerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + ownerId);
        }
        return restaurantRepo.findByOwnerId(ownerId).stream().map(this::toDto).toList();
    }

    public RestaurantResponseDto updateRestaurant(Integer restaurantId, RestaurantRequestDto request) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        assertIsOwnerOf(restaurant);

        restaurant.setName(request.getName());
        restaurant.setFoodtype(request.getFoodtype());
        restaurant.setStreet(request.getStreet());
        restaurant.setCity(request.getCity());
        restaurant.setState(request.getState());
        restaurant.setFood_available_id(request.getFood_available_id());
        restaurant.setDate(request.getDate());
        // Owner cannot be changed via update — it is set at creation time
        Restaurant saved = restaurantRepo.save(restaurant);
        return toDto(saved);
    }

    public void deleteRestaurant(Integer restaurantId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        assertIsOwnerOf(restaurant);

        restaurantRepo.deleteById(restaurantId);
    }

    public RestaurantResponseDto addFoodToRestaurant(Integer restaurantId, Integer foodId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        assertIsOwnerOf(restaurant);

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

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Retrieves the currently authenticated user from the security context.
     */
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    /**
     * Throws 403 if the authenticated user is not the owner of the given restaurant.
     */
    private void assertIsOwnerOf(Restaurant restaurant) {
        User caller = getAuthenticatedUser();
        Integer restaurantOwnerId = restaurant.getOwner() == null ? null : restaurant.getOwner().getUser_id();
        if (!caller.getUser_id().equals(restaurantOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this restaurant");
        }
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
