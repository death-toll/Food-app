package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Cart;
import com.example.FoodApplication.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepo extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUser(User user);
    
    @Query("SELECT c FROM Cart c WHERE c.user.user_id = :userId")
    Optional<Cart> findByUserId(@Param("userId") Integer userId);
    
    boolean existsByUser(User user);
}
