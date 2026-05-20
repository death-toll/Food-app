package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.RestaurantRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link com.example.FoodApplication.Entity.RestaurantRating}.
 * <p>
 * Provides query helpers for:
 * <ul>
 *   <li>Fetching a user's rating for a specific restaurant</li>
 *   <li>Fetching all ratings for a restaurant</li>
 *   <li>Computing average rating and count for a restaurant</li>
 *   <li>Deleting all ratings for a restaurant (used during restaurant deletion)</li>
 * </ul>
 */
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

    @Modifying
    @Transactional
    @Query("DELETE FROM RestaurantRating rr WHERE rr.restaurant.restaurant_id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Integer restaurantId);
}

