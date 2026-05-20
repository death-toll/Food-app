package com.example.FoodApplication.Entity;

import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Preference{
    @Id
    @NotNull
    @Column(name = "user_id", nullable = false, unique = true)
    private Integer user_id;

    @ElementCollection
    @CollectionTable(name = "preference_restaurant_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "restaurant_id")
    private List<Integer> restaurant_id;

    @ElementCollection
    @CollectionTable(name = "preference_food_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "food_id")
    private List<Integer> food_id;

    @ElementCollection
    @CollectionTable(name = "preference_cuisines", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "cuisine")
    @Enumerated(EnumType.STRING)
    private List<Cuisines> cuisines;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Foodtype foodtype;
    
    
}
