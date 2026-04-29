package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodRepo extends JpaRepository<Food,Integer> {
}
