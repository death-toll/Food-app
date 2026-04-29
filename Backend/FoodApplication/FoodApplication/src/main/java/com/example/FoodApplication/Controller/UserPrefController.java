package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.UserPrefRequestDto;
import com.example.FoodApplication.Dto.Response.UserPrefResponseDto;
import com.example.FoodApplication.Service.UserPrefService;
import com.example.FoodApplication.enums.Foodtype;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/user-preferences")
public class UserPrefController {

	private final UserPrefService userPrefService;

	public UserPrefController(UserPrefService userPrefService) {
		this.userPrefService = userPrefService;
	}

	/** Create or replace preference for a user. */
	@PutMapping
	public UserPrefResponseDto upsert(@Valid @RequestBody UserPrefRequestDto request) {
		return userPrefService.upsert(request);
	}

	@GetMapping("/{userId}")
	public UserPrefResponseDto get(@PathVariable Integer userId) {
		return userPrefService.getByUserId(userId);
	}

	@GetMapping
	public List<UserPrefResponseDto> getAll() {
		return userPrefService.getAll();
	}

	@DeleteMapping("/{userId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Integer userId) {
		userPrefService.deleteByUserId(userId);
	}

	@PostMapping("/{userId}/restaurants/{restaurantId}")
	public UserPrefResponseDto addRestaurant(@PathVariable Integer userId, @PathVariable Integer restaurantId) {
		return userPrefService.addRestaurant(userId, restaurantId);
	}

	@PostMapping("/{userId}/foods/{foodId}")
	public UserPrefResponseDto addFood(@PathVariable Integer userId, @PathVariable Integer foodId) {
		return userPrefService.addFood(userId, foodId);
	}

	@PatchMapping("/{userId}/foodtype")
	public UserPrefResponseDto updateFoodType(@PathVariable Integer userId, @RequestParam @NotNull Foodtype value) {
		return userPrefService.updateFoodType(userId, value);
	}
}
