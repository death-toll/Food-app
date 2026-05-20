package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.OrderRequestDto;
import com.example.FoodApplication.Dto.Response.OrderResponseDto;
import com.example.FoodApplication.Entity.Order;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.OrderRepo;
import com.example.FoodApplication.Repository.RestaurantRepo;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.enums.OrderStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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
        // Ensure foreign keys point to valid records before persisting.
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

    /**
     * Cancel an order as the currently authenticated customer.
     * Only the order owner can cancel, and only if it is not already DELIVERED/CANCELLED.
     */
    public OrderResponseDto cancelOrderAsCustomer(Integer orderId) {
        User current = getCurrentUser();

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        // Customers can only cancel their own orders.
        if (order.getUser_id() == null || !order.getUser_id().equals(current.getUser_id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own orders");
        }

        OrderStatus status = order.getStatus();
        if (status == OrderStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivered orders cannot be cancelled");
        }
        if (status == OrderStatus.CANCELLED) {
            return toDto(order); // idempotent
        }

        order.setStatus(OrderStatus.CANCELLED);
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
        // Copy request fields into entity. Service owns mapping so controllers stay thin.
        order.setStatus(request.getStatus());
        order.setUser_id(request.getUser_id());
        order.setRestaurant_id(request.getRestaurant_id());
        // Null-safe: represent "no foods" as an empty list instead of null.
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
            // Fail fast with 400 on missing required request fields.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user_id is required");
        }
        if (!userRepo.existsById(userId)) {
            // Prevent creating/updating orders that reference a non-existent user.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId);
        }
    }

    private void requireRestaurantExists(Integer restaurantId) {
        if (restaurantId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "restaurant_id is required");
        }
        if (!restaurantRepo.existsById(restaurantId)) {
            // Prevent invalid restaurant references.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId);
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}

