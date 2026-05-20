package com.example.FoodApplication.Entity;

import com.example.FoodApplication.enums.Foodtype;
import jakarta.persistence.*;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;



@Data
@AllArgsConstructor
@Entity
@NoArgsConstructor
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_id", nullable = false, unique = true)
    private Integer restaurant_id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @PositiveOrZero
    private Integer rating;
    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Foodtype foodtype;

    @NotBlank
    @Column(nullable = false)
    private String Street;

    @NotBlank
    @Column(nullable = false)
    private String City;

    @NotBlank
    @Column(nullable = false)
    private String State;

    @ElementCollection
    @CollectionTable(name = "restaurant_food_available_ids", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "food_id")
    private List<Integer> food_available_id;

    // Keep existing type; if this is a created/added date, consider using LocalDate.
    @NotNull
    private Date date;

    // Deal of the Day feature
    @Column(name = "deal_of_the_day_food_id")
    private Integer dealOfTheDayFoodId;

    @Column(name = "deal_of_the_day_date")
    private LocalDate dealOfTheDayDate;

}
