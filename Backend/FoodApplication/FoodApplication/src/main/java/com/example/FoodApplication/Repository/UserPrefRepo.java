package com.example.FoodApplication.Repository;

import com.example.FoodApplication.Entity.Preference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPrefRepo extends JpaRepository<Preference, Integer> {
}
