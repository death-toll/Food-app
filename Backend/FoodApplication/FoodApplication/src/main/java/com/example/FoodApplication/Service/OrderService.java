package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.OrderRequestDto;
import com.example.FoodApplication.Dto.Response.OrderResponseDto;
import com.example.FoodApplication.Entity.Order;
import com.example.FoodApplication.Repository.OrderRepo;
import com.example.FoodApplication.Repository.RestaurantRepo;
import com.example.FoodApplication.Repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final RestaurantRepo restaurantRepo;

    public OrderService(OrderRepo orderRepo, UserRepo userRepo, RestaurantRepo restaurantRepo) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.restaurantRepo = restaurantRepo;
    }

    public OrderResponseDto createOrder(OrderRequestDto request) {
        requireUserExists(request.getUser_id());
        requireRestaurantExists(request.getRestaurant_id());

        Order order = new Order();
        apply(order, request);

        Order saved = orderRepo.save(order);
        return toDto(saved);
    }

    public OrderResponseDto getOrderById(Integer orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
        return toDto(order);
    }

    public List<OrderResponseDto> getAllOrders() {
        return orderRepo.findAll().stream().map(this::toDto).toList();
    }

    public List<OrderResponseDto> getOrdersByRestaurantId(Integer restaurantId) {
        requireRestaurantExists(restaurantId);
        return orderRepo.findByRestaurantId(restaurantId).stream().map(this::toDto).toList();
    }

    public List<OrderResponseDto> getOrdersByUserId(Integer userId) {
        requireUserExists(userId);
        return orderRepo.findByUserId(userId).stream().map(this::toDto).toList();
    }

    public OrderResponseDto updateOrder(Integer orderId, OrderRequestDto request) {
        requireUserExists(request.getUser_id());
        requireRestaurantExists(request.getRestaurant_id());

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        apply(order, request);
        Order saved = orderRepo.save(order);
        return toDto(saved);
    }

    public void deleteOrder(Integer orderId) {
        if (!orderRepo.existsById(orderId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId);
        }
        orderRepo.deleteById(orderId);
    }

    private void apply(Order order, OrderRequestDto request) {
        order.setStatus(request.getStatus());
        order.setUser_id(request.getUser_id());
        order.setRestaurant_id(request.getRestaurant_id());
        order.setFood_Id(request.getFood_id() == null ? new ArrayList<>() : request.getFood_id());
    }

    private OrderResponseDto toDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setOrder_id(order.getOrder_id());
        dto.setStatus(order.getStatus());
        dto.setUser_id(order.getUser_id());
        dto.setRestaurant_id(order.getRestaurant_id());
        dto.setFood_id(order.getFood_Id());
        return dto;
    }

    private void requireUserExists(Integer userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user_id is required");
        }
        if (!userRepo.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId);
        }
    }

    private void requireRestaurantExists(Integer restaurantId) {
        if (restaurantId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "restaurant_id is required");
        }
        if (!restaurantRepo.existsById(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId);
        }
    }
}
