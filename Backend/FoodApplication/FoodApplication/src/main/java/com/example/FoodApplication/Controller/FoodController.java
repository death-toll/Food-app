package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.FoodRequestDto;
import com.example.FoodApplication.Dto.Response.FoodResponseDto;
import com.example.FoodApplication.Service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/foods")
public class FoodController {

	private final FoodService foodService;

	public FoodController(FoodService foodService) {
		this.foodService = foodService;
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
	public FoodResponseDto like(@PathVariable Integer foodId) {
		return foodService.likeFood(foodId);
	}
}
