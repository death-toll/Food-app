package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.FoodRequestDto;
import com.example.FoodApplication.Dto.Response.FoodResponseDto;
import com.example.FoodApplication.Entity.Food;
import com.example.FoodApplication.Entity.FoodLike;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.FoodLikeRepo;
import com.example.FoodApplication.Repository.FoodRepo;
import com.example.FoodApplication.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FoodService {
    @Autowired
    private FoodRepo foodrepository;

    @Autowired
    private FoodLikeRepo foodLikeRepo;

    @Autowired
    private UserRepo userRepo;

    public FoodService(FoodRepo foodrepository) {
        this.foodrepository = foodrepository;
    }

    public FoodResponseDto createFood(FoodRequestDto request) {
        // Map request DTO -> entity.
        Food food = new Food();
        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setType(request.getType());
        food.setCuisine(request.getCuisine());
        food.setPrice(request.getPrice());
        // Likes are derived data; initialize to 0 for new foods.
        food.setLike_count(0);

        Food saved = foodrepository.save(food);
        return toDto(saved);
    }

    public FoodResponseDto getFoodById(Integer foodId) {
        Food food = foodrepository.findById(foodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found: " + foodId));
        return toDto(food);
    }

    public List<FoodResponseDto> getAllFood() {
        return foodrepository.findAll().stream().map(this::toDto).toList();
    }

    public FoodResponseDto updateFood(Integer foodId, FoodRequestDto request) {
        Food food = foodrepository.findById(foodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found: " + foodId));

        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setType(request.getType());
        food.setCuisine(request.getCuisine());
        food.setPrice(request.getPrice());

        Food saved = foodrepository.save(food);
        return toDto(saved);
    }

    public void deleteFood(Integer foodId) {
        if (!foodrepository.existsById(foodId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found: " + foodId);
        }

        // Remove likes first to avoid FK violations
        foodLikeRepo.deleteByFoodId(foodId);
        // After dependents are removed, delete the food row.
        foodrepository.deleteById(foodId);
    }

    @Transactional
    public FoodResponseDto likeFood(Integer foodId, Integer userId) {
        Food food = foodrepository.findById(foodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found: " + foodId));

        // Enforce "like once per user per food" at application level.
        if (foodLikeRepo.existsLike(userId, foodId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You can like a food only once");
        }

        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        FoodLike like = new FoodLike();
        like.setUser(user);
        like.setFood(food);
        foodLikeRepo.save(like);

        // Increment derived like counter.
        food.setLike_count((food.getLike_count() == null ? 0 : food.getLike_count()) + 1);
        return toDto(foodrepository.save(food));
    }

    private FoodResponseDto toDto(Food food) {
        FoodResponseDto dto = new FoodResponseDto();
        // Entity -> response DTO mapping.
        dto.setFood_id(food.getFood_id());
        dto.setName(food.getName());
        dto.setDescription(food.getDescription());
        dto.setType(food.getType());
        dto.setCuisine(food.getCuisine());
        dto.setPrice(food.getPrice());
        dto.setLike_count(food.getLike_count());
        return dto;
    }

}
