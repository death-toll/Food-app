package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.RestaurantRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantRatingRepo extends JpaRepository<RestaurantRating, Integer> {

    @Query("SELECT rr FROM RestaurantRating rr WHERE rr.user.user_id = :userId AND rr.restaurant.restaurant_id = :restaurantId")
    Optional<RestaurantRating> findByUserIdAndRestaurantId(@Param("userId") Integer userId,
                                                          @Param("restaurantId") Integer restaurantId);

    @Query("SELECT rr FROM RestaurantRating rr WHERE rr.restaurant.restaurant_id = :restaurantId")
    List<RestaurantRating> findByRestaurantId(@Param("restaurantId") Integer restaurantId);

    @Query("SELECT rr FROM RestaurantRating rr WHERE rr.user.user_id = :userId")
    List<RestaurantRating> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT AVG(rr.rating) FROM RestaurantRating rr WHERE rr.restaurant.restaurant_id = :restaurantId")
    Double averageForRestaurant(@Param("restaurantId") Integer restaurantId);

    @Query("SELECT COUNT(rr) FROM RestaurantRating rr WHERE rr.restaurant.restaurant_id = :restaurantId")
    Long countForRestaurant(@Param("restaurantId") Integer restaurantId);
}

