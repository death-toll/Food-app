package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepo extends JpaRepository<Restaurant,Integer> {
}
