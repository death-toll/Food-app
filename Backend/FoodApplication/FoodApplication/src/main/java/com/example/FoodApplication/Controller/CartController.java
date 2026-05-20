package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Request.AddToCartRequest;
import com.example.FoodApplication.Dto.Request.UpdateCartItemRequest;
import com.example.FoodApplication.Dto.Response.CartResponseDto;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.Service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepo userRepo;

    public CartController(CartService cartService, UserRepo userRepo) {
        this.cartService = cartService;
        this.userRepo = userRepo;
    }

    /**
     * Get current user's cart
     */
    @GetMapping
    public CartResponseDto getCart() {
        Integer userId = getCurrentUserId();
        return cartService.getCart(userId);
    }

    /**
     * Add item to cart
     */
    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponseDto addToCart(@Valid @RequestBody AddToCartRequest request) {
        Integer userId = getCurrentUserId();
        return cartService.addToCart(userId, request);
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/items/{cartItemId}")
    public CartResponseDto updateCartItem(
            @PathVariable Integer cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        Integer userId = getCurrentUserId();
        return cartService.updateCartItem(userId, cartItemId, request);
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/items/{cartItemId}")
    public CartResponseDto removeFromCart(@PathVariable Integer cartItemId) {
        Integer userId = getCurrentUserId();
        return cartService.removeFromCart(userId, cartItemId);
    }

    /**
     * Clear all items from cart
     */
    @DeleteMapping
    public CartResponseDto clearCart() {
        Integer userId = getCurrentUserId();
        return cartService.clearCart(userId);
    }

    /**
     * Get current authenticated user's ID
     */
    private Integer getCurrentUserId() {
        // SecurityContext is populated by JwtAuthenticationFilter when a valid Bearer token is present.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        // Resolve the current user from the email stored in UserDetails.
        User user = userRepo.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return user.getUser_id();
    }
}

