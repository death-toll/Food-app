package com.example.FoodApplication.Entity;

import com.example.FoodApplication.enums.Roles;
import jakarta.persistence.*;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false, unique = true)
    private Integer user_id;

    @PositiveOrZero
    private Integer age;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Column(nullable = false)
    private String Street;

    @NotBlank
    @Column(nullable = false)
    private String City;

    @NotBlank
    @Column(nullable = false)
    private String State;
    @NotNull
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(min = 6, max = 255)
    @Column(name = "password", nullable = false)
    private String Password;
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Roles Role;






}
