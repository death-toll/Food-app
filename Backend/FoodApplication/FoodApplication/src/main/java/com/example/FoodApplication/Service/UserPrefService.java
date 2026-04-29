package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.UserPrefRequestDto;
import com.example.FoodApplication.Dto.Response.UserPrefResponseDto;
import com.example.FoodApplication.Entity.Preference;
import com.example.FoodApplication.Repository.UserPrefRepo;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.enums.Foodtype;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserPrefService {

	private final UserPrefRepo userPrefRepo;
	private final UserRepo userRepo;

	public UserPrefService(UserPrefRepo userPrefRepo, UserRepo userRepo) {
		this.userPrefRepo = userPrefRepo;
		this.userRepo = userRepo;
	}

	/**
	 * Creates or replaces preference for a user_id.
	 */
	public UserPrefResponseDto upsert(UserPrefRequestDto request) {
		requireUserExists(request.getUser_id());

		Preference pref = userPrefRepo.findById(request.getUser_id()).orElseGet(Preference::new);
		pref.setUser_id(request.getUser_id());
		pref.setRestaurant_id(request.getRestaurant_id());
		pref.setFood_id(request.getFood_id());
		pref.setFoodtype(request.getFoodtype());

		Preference saved = userPrefRepo.save(pref);
		return toDto(saved);
	}

	public UserPrefResponseDto getByUserId(Integer userId) {
		requireUserExists(userId);
		Preference pref = userPrefRepo.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Preference not found for user: " + userId));
		return toDto(pref);
	}

	public List<UserPrefResponseDto> getAll() {
		return userPrefRepo.findAll().stream().map(this::toDto).toList();
	}

	public void deleteByUserId(Integer userId) {
		requireUserExists(userId);
		if (!userPrefRepo.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Preference not found for user: " + userId);
		}
		userPrefRepo.deleteById(userId);
	}

	public UserPrefResponseDto addRestaurant(Integer userId, Integer restaurantId) {
		requireUserExists(userId);
		Preference pref = userPrefRepo.findById(userId).orElseGet(() -> defaultPreference(userId));

		List<Integer> restaurants = pref.getRestaurant_id();
		if (restaurants == null) restaurants = new ArrayList<>();
		if (!restaurants.contains(restaurantId)) restaurants.add(restaurantId);

		pref.setRestaurant_id(restaurants);
		return toDto(userPrefRepo.save(pref));
	}

	public UserPrefResponseDto addFood(Integer userId, Integer foodId) {
		requireUserExists(userId);
		Preference pref = userPrefRepo.findById(userId).orElseGet(() -> defaultPreference(userId));

		List<Integer> foods = pref.getFood_id();
		if (foods == null) foods = new ArrayList<>();
		if (!foods.contains(foodId)) foods.add(foodId);

		pref.setFood_id(foods);
		return toDto(userPrefRepo.save(pref));
	}

	public UserPrefResponseDto updateFoodType(Integer userId, Foodtype foodtype) {
		requireUserExists(userId);
		Preference pref = userPrefRepo.findById(userId).orElseGet(() -> defaultPreference(userId));
		pref.setFoodtype(foodtype);
		return toDto(userPrefRepo.save(pref));
	}

	private void requireUserExists(Integer userId) {
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
		}
		if (!userRepo.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId);
		}
	}

	private Preference defaultPreference(Integer userId) {
		Preference pref = new Preference();
		pref.setUser_id(userId);
		pref.setRestaurant_id(new ArrayList<>());
		pref.setFood_id(new ArrayList<>());
		// Preference.foodtype is @NotNull, so we need a default when auto-creating.
		pref.setFoodtype(Foodtype.VEG);
		return pref;
	}

	private UserPrefResponseDto toDto(Preference pref) {
		UserPrefResponseDto dto = new UserPrefResponseDto();
		dto.setUser_id(pref.getUser_id());
		dto.setRestaurant_id(pref.getRestaurant_id());
		dto.setFood_id(pref.getFood_id());
		dto.setFoodtype(pref.getFoodtype());
		return dto;
	}
}
