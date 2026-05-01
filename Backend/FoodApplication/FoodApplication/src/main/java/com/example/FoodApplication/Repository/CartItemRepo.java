package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Cart;
import com.example.FoodApplication.Entity.CartItem;
import com.example.FoodApplication.Entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepo extends JpaRepository<CartItem, Integer> {
    Optional<CartItem> findByCartAndFood(Cart cart, Food food);
    void deleteByCart(Cart cart);
}

