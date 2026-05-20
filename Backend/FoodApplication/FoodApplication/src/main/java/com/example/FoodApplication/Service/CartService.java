package com.example.FoodApplication.Service;

import com.example.FoodApplication.Dto.Request.AddToCartRequest;
import com.example.FoodApplication.Dto.Request.UpdateCartItemRequest;
import com.example.FoodApplication.Dto.Response.CartItemResponseDto;
import com.example.FoodApplication.Dto.Response.CartResponseDto;
import com.example.FoodApplication.Entity.*;
import com.example.FoodApplication.Repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final UserRepo userRepo;
    private final FoodRepo foodRepo;
    private final RestaurantRepo restaurantRepo;

    public CartService(CartRepo cartRepo, CartItemRepo cartItemRepo, UserRepo userRepo, 
                       FoodRepo foodRepo, RestaurantRepo restaurantRepo) {
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.userRepo = userRepo;
        this.foodRepo = foodRepo;
        this.restaurantRepo = restaurantRepo;
    }

    /**
     * Get cart for the current user. Creates one if it doesn't exist.
     */
    public CartResponseDto getCart(Integer userId) {
        // Ensure the user exists before creating/returning a cart.
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Cart cart = cartRepo.findByUser(user)
                // Lazily create a cart so callers don't need a separate "create cart" step.
                .orElseGet(() -> createCartForUser(user));

        return toDto(cart);
    }

    /**
     * Add item to cart
     */
    @Transactional
    public CartResponseDto addToCart(Integer userId, AddToCartRequest request) {
        // Validate user and referenced entities first.
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Food food = foodRepo.findById(request.getFoodId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));

        Restaurant restaurant = restaurantRepo.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        // Validate that the food is available at this restaurant
        if (restaurant.getFood_available_id() == null || 
            !restaurant.getFood_available_id().contains(food.getFood_id())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "This food item is not available at the selected restaurant");
        }

        Cart cart = cartRepo.findByUser(user)
                .orElseGet(() -> createCartForUser(user));

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepo.findByCartAndFood(cart, food);

        if (existingItem.isPresent()) {
            // Update quantity (idempotent add operation).
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepo.save(item);
        } else {
            // Add new item row linked to cart + food + restaurant.
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setFood(food);
            newItem.setRestaurant(restaurant);
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
            cartItemRepo.save(newItem);
        }

        cart = cartRepo.save(cart);
        return toDto(cart);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartResponseDto updateCartItem(Integer userId, Integer cartItemId, UpdateCartItemRequest request) {
        // Resolve cart for user to ensure we don't modify someone else's cart.
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Cart cart = cartRepo.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));

        CartItem cartItem = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        // Verify the cart item belongs to this user's cart
        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cart item does not belong to your cart");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepo.save(cartItem);

        cart = cartRepo.save(cart);
        return toDto(cart);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public CartResponseDto removeFromCart(Integer userId, Integer cartItemId) {
        // Resolve user's cart before removing an item.
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Cart cart = cartRepo.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));

        CartItem cartItem = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        // Verify the cart item belongs to this user's cart
        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cart item does not belong to your cart");
        }

        // Remove from in-memory list and delete row.
        cart.getItems().remove(cartItem);
        cartItemRepo.delete(cartItem);

        cart = cartRepo.save(cart);
        return toDto(cart);
    }

    /**
     * Clear all items from cart
     */
    @Transactional
    public CartResponseDto clearCart(Integer userId) {
        // Clearing only touches the cart aggregate; CartItem cleanup depends on mapping/cascade.
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Cart cart = cartRepo.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));

        cart.getItems().clear();
        cart = cartRepo.save(cart);

        return toDto(cart);
    }

    /**
     * Create a new cart for user
     */
    private Cart createCartForUser(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepo.save(cart);
    }

    /**
     * Convert Cart entity to DTO
     */
    private CartResponseDto toDto(Cart cart) {
        CartResponseDto dto = new CartResponseDto();
        // DTO mapping keeps API payload stable and avoids exposing entity internals.
        dto.setCartId(cart.getCartId());
        dto.setUserId(cart.getUser().getUser_id());
        dto.setItems(cart.getItems().stream().map(this::toItemDto).collect(Collectors.toList()));
        dto.setTotalItems(cart.getTotalItems());
        dto.setTotalPrice(cart.getTotalPrice());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());
        return dto;
    }

    /**
     * Convert CartItem entity to DTO
     */
    private CartItemResponseDto toItemDto(CartItem item) {
        CartItemResponseDto dto = new CartItemResponseDto();
        dto.setCartItemId(item.getCartItemId());
        dto.setFoodId(item.getFood().getFood_id());
        dto.setFoodName(item.getFood().getName());
        dto.setFoodPrice(item.getFood().getPrice());
        dto.setRestaurantId(item.getRestaurant().getRestaurant_id());
        dto.setRestaurantName(item.getRestaurant().getName());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}

