package com.example.FoodApplication.Entity;

import com.example.FoodApplication.enums.OrderStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id", nullable = false, unique = true)
    private Integer order_id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus Status;

    @NotNull
    @Positive
    @Column(name = "user_id", nullable = false)
    private Integer user_id;

    @ElementCollection
    @CollectionTable(name = "order_food_ids", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "food_id")
    private List<Integer> Food_Id;

    @NotNull
    @Positive
    @Column(name = "restaurant_id", nullable = false)
    private Integer Restaurant_id;



}
