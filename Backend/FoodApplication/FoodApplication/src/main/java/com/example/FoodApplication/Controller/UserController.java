package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.UserRequestDto;
import com.example.FoodApplication.Dto.Response.UserResponseDto;
import com.example.FoodApplication.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto create(@Valid @RequestBody UserRequestDto request) {
        return userService.createUser(request);
    }

    @GetMapping("/{userId}")
    public UserResponseDto getById(@PathVariable Integer userId) {
        return userService.getUserById(userId);
    }

    @GetMapping
    public List<UserResponseDto> getAll() {
        return userService.getAllUsers();
    }

    @PutMapping("/{userId}")
    public UserResponseDto update(@PathVariable Integer userId, @Valid @RequestBody UserRequestDto request) {
        return userService.updateUser(userId, request);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer userId) {
        userService.deleteUser(userId);
    }
}

