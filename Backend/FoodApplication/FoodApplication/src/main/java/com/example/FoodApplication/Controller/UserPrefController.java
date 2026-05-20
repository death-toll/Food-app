package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.UserPrefRequestDto;
import com.example.FoodApplication.Dto.Response.UserPrefResponseDto;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.Service.UserPrefService;
import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Validated
@RestController
@RequestMapping("/user-preferences")
@PreAuthorize("hasRole('CUSTOMER')")
public class UserPrefController {

	private final UserPrefService userPrefService;
	private final UserRepo userRepo;

	public UserPrefController(UserPrefService userPrefService, UserRepo userRepo) {
		this.userPrefService = userPrefService;
		this.userRepo = userRepo;
	}

	/** Create or replace preference for a user. */
	@PutMapping
	public UserPrefResponseDto upsert(@Valid @RequestBody UserPrefRequestDto request) {
		// Customer can only modify their own preferences; prevent tampering by checking JWT user id.
		requireSameUser(request.getUser_id());
		return userPrefService.upsert(request);
	}

	@GetMapping("/{userId}")
	public UserPrefResponseDto get(@PathVariable Integer userId) {
		requireSameUser(userId);
		return userPrefService.getByUserId(userId);
	}

	@GetMapping
	public List<UserPrefResponseDto> getAll() {
		return userPrefService.getAll();
	}

	@DeleteMapping("/{userId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Integer userId) {
		requireSameUser(userId);
		userPrefService.deleteByUserId(userId);
	}

	@PostMapping("/{userId}/restaurants/{restaurantId}")
	public UserPrefResponseDto addRestaurant(@PathVariable Integer userId, @PathVariable Integer restaurantId) {
		requireSameUser(userId);
		return userPrefService.addRestaurant(userId, restaurantId);
	}

	@PostMapping("/{userId}/foods/{foodId}")
	public UserPrefResponseDto addFood(@PathVariable Integer userId, @PathVariable Integer foodId) {
		requireSameUser(userId);
		return userPrefService.addFood(userId, foodId);
	}

	@PatchMapping("/{userId}/foodtype")
	public UserPrefResponseDto updateFoodType(@PathVariable Integer userId, @RequestParam @NotNull Foodtype value) {
		requireSameUser(userId);
		return userPrefService.updateFoodType(userId, value);
	}

	@PatchMapping("/{userId}/cuisines")
	public UserPrefResponseDto addCuisine(@PathVariable Integer userId, @RequestParam @NotNull Cuisines value) {
		requireSameUser(userId);
		return userPrefService.addCuisine(userId, value);
	}

	private void requireSameUser(Integer userId) {
		// Enforce "self only" access (even if client passes a different userId).
		Integer currentUserId = getCurrentUserId();
		if (userId == null || !userId.equals(currentUserId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own preferences");
		}
	}

	private Integer getCurrentUserId() {
		// SecurityContext is populated when a valid Bearer token is provided.
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
		}

		User user = userRepo.findByEmail(principal.getUsername())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

		return user.getUser_id();
	}
}
