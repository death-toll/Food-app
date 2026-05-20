package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.FoodRequestDto;
import com.example.FoodApplication.Dto.Response.FoodResponseDto;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.Service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/foods")
public class FoodController {

	private final FoodService foodService;
	private final UserRepo userRepo;

	public FoodController(FoodService foodService, UserRepo userRepo) {
		this.foodService = foodService;
		this.userRepo = userRepo;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public FoodResponseDto create(@Valid @RequestBody FoodRequestDto request) {
		return foodService.createFood(request);
	}

	@GetMapping("/{foodId}")
	public FoodResponseDto getById(@PathVariable Integer foodId) {
		return foodService.getFoodById(foodId);
	}

	@GetMapping
	public List<FoodResponseDto> getAll() {
		return foodService.getAllFood();
	}

	@PutMapping("/{foodId}")
	public FoodResponseDto update(@PathVariable Integer foodId, @Valid @RequestBody FoodRequestDto request) {
		return foodService.updateFood(foodId, request);
	}

	@DeleteMapping("/{foodId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Integer foodId) {
		foodService.deleteFood(foodId);
	}

	@PostMapping("/{foodId}/like")
	@PreAuthorize("hasAnyRole('CUSTOMER','OWNER')")
	public FoodResponseDto like(@PathVariable Integer foodId) {
		// Like action requires authentication; user id is inferred from JWT (not passed from client).
		Integer userId = getCurrentUserId();
		return foodService.likeFood(foodId, userId);
	}

	private Integer getCurrentUserId() {
		// SecurityContext is set by JwtAuthenticationFilter when Authorization header is present.
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
		}

		// Resolve the logged-in user using their email (username).
		User user = userRepo.findByEmail(principal.getUsername())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

		return user.getUser_id();
	}
}
