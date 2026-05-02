package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.RestaurantRequestDto;
import com.example.FoodApplication.Dto.Response.DealOfTheDayResponseDto;
import com.example.FoodApplication.Dto.Response.RestaurantResponseDto;
import com.example.FoodApplication.Entity.Food;
import com.example.FoodApplication.Entity.Restaurant;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.FoodRepo;
import com.example.FoodApplication.Repository.RestaurantRepo;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.enums.Roles;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepo restaurantRepo;
    private final UserRepo userRepo;
    private final FoodRepo foodRepo;

    private static final double DEAL_DISCOUNT_PERCENT = 10.0;

    public RestaurantService(RestaurantRepo restaurantRepo, UserRepo userRepo, FoodRepo foodRepo) {
        this.restaurantRepo = restaurantRepo;
        this.userRepo = userRepo;
        this.foodRepo = foodRepo;
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
        dto.setDealOfTheDayFoodId(restaurant.getDealOfTheDayFoodId());
        dto.setDealOfTheDayDate(restaurant.getDealOfTheDayDate());
        return dto;
    }

    // ── Deal of the Day Methods ──────────────────────────────────────────────────

    /**
     * Set a food item as Deal of the Day for a restaurant (Owner only).
     * The food must be in the restaurant's menu.
     */
    public DealOfTheDayResponseDto setDealOfTheDay(Integer restaurantId, Integer foodId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        assertIsOwnerOf(restaurant);

        // Validate food exists
        Food food = foodRepo.findById(foodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found: " + foodId));

        // Validate food is in this restaurant's menu
        List<Integer> menuIds = restaurant.getFood_available_id();
        if (menuIds == null || !menuIds.contains(foodId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Food item is not in this restaurant's menu");
        }

        // Set deal of the day
        restaurant.setDealOfTheDayFoodId(foodId);
        restaurant.setDealOfTheDayDate(LocalDate.now());
        restaurantRepo.save(restaurant);

        return buildDealResponse(restaurant, food);
    }

    /**
     * Remove Deal of the Day from a restaurant (Owner only).
     */
    public RestaurantResponseDto removeDealOfTheDay(Integer restaurantId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        assertIsOwnerOf(restaurant);

        restaurant.setDealOfTheDayFoodId(null);
        restaurant.setDealOfTheDayDate(null);
        Restaurant saved = restaurantRepo.save(restaurant);

        return toDto(saved);
    }

    /**
     * Get Deal of the Day for a restaurant (Public).
     * Returns null-like response if no deal is set or deal is expired (not today).
     */
    public DealOfTheDayResponseDto getDealOfTheDay(Integer restaurantId) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId));

        Integer foodId = restaurant.getDealOfTheDayFoodId();
        LocalDate dealDate = restaurant.getDealOfTheDayDate();

        // No deal set or deal is from a previous day
        if (foodId == null || dealDate == null || !dealDate.equals(LocalDate.now())) {
            return null;
        }

        Food food = foodRepo.findById(foodId).orElse(null);
        if (food == null) {
            return null;
        }

        return buildDealResponse(restaurant, food);
    }

    /**
     * Calculate discounted price (10% off).
     */
    public Double calculateDiscountedPrice(Double originalPrice) {
        if (originalPrice == null) return null;
        return Math.round(originalPrice * (1 - DEAL_DISCOUNT_PERCENT / 100) * 100.0) / 100.0;
    }

    private DealOfTheDayResponseDto buildDealResponse(Restaurant restaurant, Food food) {
        DealOfTheDayResponseDto dto = new DealOfTheDayResponseDto();
        dto.setFoodId(food.getFood_id());
        dto.setFoodName(food.getName());
        dto.setDescription(food.getDescription());
        dto.setType(food.getType());
        dto.setCuisine(food.getCuisine());
        dto.setOriginalPrice(food.getPrice());
        dto.setDiscountedPrice(calculateDiscountedPrice(food.getPrice()));
        dto.setDiscountPercent(DEAL_DISCOUNT_PERCENT);
        dto.setDealDate(restaurant.getDealOfTheDayDate());
        dto.setRestaurantId(restaurant.getRestaurant_id());
        dto.setRestaurantName(restaurant.getName());
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
