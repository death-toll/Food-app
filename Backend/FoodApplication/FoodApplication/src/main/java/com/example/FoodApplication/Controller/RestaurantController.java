package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.RestaurantRequestDto;
import com.example.FoodApplication.Dto.Response.DealOfTheDayResponseDto;
import com.example.FoodApplication.Dto.Response.RestaurantResponseDto;
import com.example.FoodApplication.Service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
public class RestaurantController {

	private final RestaurantService restaurantService;


	public RestaurantController(RestaurantService restaurantService) {
		this.restaurantService = restaurantService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasRole('OWNER')")
	public RestaurantResponseDto create(@Valid @RequestBody RestaurantRequestDto request) {
		// Owner-only: restaurantService also enforces that request.ownerId matches JWT user.
		return restaurantService.createRestaurant(request);
	}

	@GetMapping("/{restaurantId}")
	public RestaurantResponseDto getById(@PathVariable Integer restaurantId) {
		return restaurantService.getRestaurantById(restaurantId);
	}

	@GetMapping
	public List<RestaurantResponseDto> getAll() {
		return restaurantService.getAllRestaurants();
	}

	/**
	 * Get all restaurants owned by a specific user
	 */
	@GetMapping("/owner/{ownerId}")
	public List<RestaurantResponseDto> getByOwnerId(@PathVariable Integer ownerId) {
		return restaurantService.getRestaurantsByOwnerId(ownerId);
	}

	@PutMapping("/{restaurantId}")
	@PreAuthorize("hasRole('OWNER')")
	public RestaurantResponseDto update(
			@PathVariable Integer restaurantId,
			@Valid @RequestBody RestaurantRequestDto request
	) {
		return restaurantService.updateRestaurant(restaurantId, request);
	}

	@DeleteMapping("/{restaurantId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@PreAuthorize("hasRole('OWNER')")
	public void delete(@PathVariable Integer restaurantId) {
		restaurantService.deleteRestaurant(restaurantId);
	}

	@PostMapping("/{restaurantId}/foods/{foodId}")
	@PreAuthorize("hasRole('OWNER')")
	public RestaurantResponseDto addFoodToRestaurant(
			@PathVariable Integer restaurantId,
			@PathVariable Integer foodId
	) {
		return restaurantService.addFoodToRestaurant(restaurantId, foodId);
	}

	// ── Deal of the Day Endpoints ────────────────────────────────────────────────

	/**
	 * GET /restaurants/{restaurantId}/deal-of-the-day — Get today's deal (Public)
	 */
	@GetMapping("/{restaurantId}/deal-of-the-day")
	public DealOfTheDayResponseDto getDealOfTheDay(@PathVariable Integer restaurantId) {
		// Public endpoint: returns today's deal if set and not expired.
		return restaurantService.getDealOfTheDay(restaurantId);
	}

	/**
	 * PUT /restaurants/{restaurantId}/deal-of-the-day/{foodId} — Set deal of the day (Owner only)
	 */
	@PutMapping("/{restaurantId}/deal-of-the-day/{foodId}")
	@PreAuthorize("hasRole('OWNER')")
	public DealOfTheDayResponseDto setDealOfTheDay(
			@PathVariable Integer restaurantId,
			@PathVariable Integer foodId
	) {
		return restaurantService.setDealOfTheDay(restaurantId, foodId);
	}

	/**
	 * DELETE /restaurants/{restaurantId}/deal-of-the-day — Remove deal of the day (Owner only)
	 */
	@DeleteMapping("/{restaurantId}/deal-of-the-day")
	@PreAuthorize("hasRole('OWNER')")
	public RestaurantResponseDto removeDealOfTheDay(@PathVariable Integer restaurantId) {
		return restaurantService.removeDealOfTheDay(restaurantId);
	}
}
