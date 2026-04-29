package com.example.FoodApplication.Entity;

import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "foods")
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id", nullable = false, unique = true)
    private Integer food_id;

    @NotNull
    @PositiveOrZero
    private Double price;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotNull
    @Column(nullable = false)
    private Foodtype type;

    @NotNull
    @Column(nullable = false)
    private Cuisines cuisine;

    @NotNull
    @PositiveOrZero
    private Integer like_count;


}
