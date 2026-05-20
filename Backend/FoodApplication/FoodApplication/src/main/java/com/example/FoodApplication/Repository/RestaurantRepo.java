package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Restaurant;
import com.example.FoodApplication.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRepo extends JpaRepository<Restaurant, Integer> {
    List<Restaurant> findByOwner(User owner);

    @Query("SELECT r FROM Restaurant r WHERE r.owner.user_id = :ownerId")
    List<Restaurant> findByOwnerId(@Param("ownerId") Integer ownerId);
}
