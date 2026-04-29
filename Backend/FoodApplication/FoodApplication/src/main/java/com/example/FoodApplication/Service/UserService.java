package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.UserRequestDto;
import com.example.FoodApplication.Dto.Response.UserResponseDto;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepo userRepo;

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public UserResponseDto createUser(UserRequestDto request) {
        User user = new User();
        apply(user, request);
        return toDto(userRepo.save(user));
    }

    public UserResponseDto getUserById(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));
        return toDto(user);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepo.findAll().stream().map(this::toDto).toList();
    }

    public UserResponseDto updateUser(Integer userId, UserRequestDto request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        apply(user, request);
        return toDto(userRepo.save(user));
    }

    public void deleteUser(Integer userId) {
        if (!userRepo.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId);
        }
        userRepo.deleteById(userId);
    }

    private void apply(User user, UserRequestDto request) {
        user.setAge(request.getAge());
        user.setName(request.getName());
        user.setStreet(request.getStreet());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
    }

    private UserResponseDto toDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setUser_id(user.getUser_id());
        dto.setAge(user.getAge());
        dto.setName(user.getName());
        dto.setStreet(user.getStreet());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}

