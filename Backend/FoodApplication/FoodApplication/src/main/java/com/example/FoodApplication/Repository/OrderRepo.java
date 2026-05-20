package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepo extends JpaRepository<Order, Integer> {

    @Query("SELECT o FROM Order o WHERE o.Restaurant_id = :restaurantId")
    List<Order> findByRestaurantId(@Param("restaurantId") Integer restaurantId);

    @Query("SELECT o FROM Order o WHERE o.user_id = :userId")
    List<Order> findByUserId(@Param("userId") Integer userId);
}

