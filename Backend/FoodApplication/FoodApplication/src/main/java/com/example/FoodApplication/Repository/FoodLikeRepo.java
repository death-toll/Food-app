package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.FoodLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface FoodLikeRepo extends JpaRepository<FoodLike, Integer> {

    @Query("SELECT (COUNT(fl) > 0) FROM FoodLike fl WHERE fl.user.user_id = :userId AND fl.food.food_id = :foodId")
    boolean existsLike(@Param("userId") Integer userId, @Param("foodId") Integer foodId);

    @Modifying
    @Transactional
    @Query("DELETE FROM FoodLike fl WHERE fl.food.food_id = :foodId")
    void deleteByFoodId(@Param("foodId") Integer foodId);
}
