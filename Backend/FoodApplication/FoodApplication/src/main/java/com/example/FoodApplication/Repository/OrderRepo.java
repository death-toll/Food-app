package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepo extends JpaRepository<Order,Integer> {
}
