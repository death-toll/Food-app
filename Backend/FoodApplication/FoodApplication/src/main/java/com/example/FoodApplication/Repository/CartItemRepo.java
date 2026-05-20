package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Cart;
import com.example.FoodApplication.Entity.CartItem;
import com.example.FoodApplication.Entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface CartItemRepo extends JpaRepository<CartItem, Integer> {
    Optional<CartItem> findByCartAndFood(Cart cart, Food food);
    void deleteByCart(Cart cart);

    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.restaurant.restaurant_id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Integer restaurantId);
}

