package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.OrderRequestDto;
import com.example.FoodApplication.Dto.Response.OrderResponseDto;
import com.example.FoodApplication.Service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponseDto create(@Valid @RequestBody OrderRequestDto request) {
        return orderService.createOrder(request);
    }

    /**
     * GET /orders/user/{userId} — list orders for a given user id
     */
    @GetMapping("/user/{userId}")
    public List<OrderResponseDto> getByUserId(@PathVariable Integer userId) {
        return orderService.getOrdersByUserId(userId);
    }

    /**
     * GET /orders/restaurant/{restaurantId} — list orders for a given restaurant id
     */
    @GetMapping("/restaurant/{restaurantId}")
    public List<OrderResponseDto> getByRestaurantId(@PathVariable Integer restaurantId) {
        return orderService.getOrdersByRestaurantId(restaurantId);
    }

    @GetMapping("/{orderId}")
    public OrderResponseDto getById(@PathVariable Integer orderId) {
        return orderService.getOrderById(orderId);
    }

    @GetMapping
    public List<OrderResponseDto> getAll() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{orderId}")
    public OrderResponseDto update(@PathVariable Integer orderId, @Valid @RequestBody OrderRequestDto request) {
        return orderService.updateOrder(orderId, request);
    }

    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer orderId) {
        orderService.deleteOrder(orderId);
    }
}
