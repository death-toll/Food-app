package com.example.FoodApplication;

import com.example.FoodApplication.Dto.Request.FoodRequestDto;
import com.example.FoodApplication.Dto.Response.DealOfTheDayResponseDto;
import com.example.FoodApplication.Dto.Response.FoodResponseDto;
import com.example.FoodApplication.Entity.Food;
import com.example.FoodApplication.Entity.FoodLike;
import com.example.FoodApplication.Entity.Restaurant;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Exception.ApiError;
import com.example.FoodApplication.Exception.GlobalExceptionHandler;
import com.example.FoodApplication.Repository.FoodLikeRepo;
import com.example.FoodApplication.Repository.FoodRepo;
import com.example.FoodApplication.Repository.RestaurantRepo;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.Service.FoodService;
import com.example.FoodApplication.Service.RestaurantService;
import com.example.FoodApplication.enums.Cuisines;
import com.example.FoodApplication.enums.Foodtype;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 15 Test Cases across different layers:
 * - Service Layer: FoodService (6 tests)
 * - Service Layer: RestaurantService Deal of Day (4 tests)
 * - Exception Layer: GlobalExceptionHandler (5 tests)
 */
class AllLayersTest {

    // ═══════════════════════════════════════════════════════════════════════════
    // SERVICE LAYER: FoodService Tests (6 tests)
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("FoodService Tests")
    @ExtendWith(MockitoExtension.class)
    class FoodServiceTests {

        @Mock private FoodRepo foodRepo;
        @Mock private FoodLikeRepo foodLikeRepo;
        @Mock private UserRepo userRepo;
        
        private FoodService foodService;
        
        @BeforeEach
        void setUpFoodService() {
            // FoodService uses @Autowired fields, so we inject mocks manually
            foodService = new FoodService(foodRepo);
            // Use reflection to set @Autowired fields
            try {
                var likeField = FoodService.class.getDeclaredField("foodLikeRepo");
                likeField.setAccessible(true);
                likeField.set(foodService, foodLikeRepo);
                
                var userField = FoodService.class.getDeclaredField("userRepo");
                userField.setAccessible(true);
                userField.set(foodService, userRepo);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        private FoodRequestDto createRequest() {
            FoodRequestDto req = new FoodRequestDto();
            req.setName("Paneer Tikka");
            req.setPrice(250.0);
            req.setType(Foodtype.VEG);
            req.setCuisine(Cuisines.INDIAN);
            req.setDescription("Spicy cottage cheese");
            return req;
        }

        @Test
        @DisplayName("1. createFood sets like_count to zero")
        void createFood_setsLikeCountToZero() {
            FoodRequestDto req = createRequest();
            Food saved = new Food();
            saved.setFood_id(1);
            saved.setName(req.getName());
            saved.setPrice(req.getPrice());
            saved.setType(req.getType());
            saved.setCuisine(req.getCuisine());
            saved.setLike_count(0);

            when(foodRepo.save(any(Food.class))).thenReturn(saved);

            FoodResponseDto dto = foodService.createFood(req);

            assertEquals(1, dto.getFood_id());
            assertEquals(0, dto.getLike_count());
            verify(foodRepo).save(any(Food.class));
        }

        @Test
        @DisplayName("2. getFoodById throws 404 when not found")
        void getFoodById_whenMissing_throws404() {
            when(foodRepo.findById(99)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> foodService.getFoodById(99));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
            assertTrue(ex.getReason().contains("99"));
        }

        @Test
        @DisplayName("3. updateFood updates all fields correctly")
        void updateFood_whenFound_updatesFields() {
            FoodRequestDto req = createRequest();
            Food existing = new Food();
            existing.setFood_id(1);
            existing.setLike_count(5);

            when(foodRepo.findById(1)).thenReturn(Optional.of(existing));
            when(foodRepo.save(existing)).thenReturn(existing);

            FoodResponseDto dto = foodService.updateFood(1, req);

            assertEquals("Paneer Tikka", dto.getName());
            assertEquals(250.0, dto.getPrice());
            assertEquals(Foodtype.VEG, dto.getType());
            assertEquals(5, dto.getLike_count()); // unchanged
        }

        @Test
        @DisplayName("4. deleteFood throws 404 when not found")
        void deleteFood_whenMissing_throws404() {
            when(foodRepo.existsById(10)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> foodService.deleteFood(10));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
            verify(foodLikeRepo, never()).deleteByFoodId(any());
        }

        @Test
        @DisplayName("5. likeFood throws 409 when already liked")
        void likeFood_whenAlreadyLiked_throws409() {
            Food f = new Food();
            f.setFood_id(1);
            f.setLike_count(0);

            when(foodRepo.findById(1)).thenReturn(Optional.of(f));
            when(foodLikeRepo.existsLike(7, 1)).thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> foodService.likeFood(1, 7));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            verify(foodRepo, never()).save(any());
        }

        @Test
        @DisplayName("6. likeFood increments like_count on success")
        void likeFood_success_incrementsLikeCount() {
            Food f = new Food();
            f.setFood_id(1);
            f.setLike_count(2);

            User u = new User();
            u.setUser_id(7);

            when(foodRepo.findById(1)).thenReturn(Optional.of(f));
            when(foodLikeRepo.existsLike(7, 1)).thenReturn(false);
            when(userRepo.findById(7)).thenReturn(Optional.of(u));
            when(foodRepo.save(any(Food.class))).thenAnswer(inv -> inv.getArgument(0));

            FoodResponseDto dto = foodService.likeFood(1, 7);

            assertEquals(3, dto.getLike_count());
            verify(foodLikeRepo).save(any(FoodLike.class));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SERVICE LAYER: RestaurantService Deal of Day Tests (4 tests)
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("RestaurantService Deal Tests")
    @ExtendWith(MockitoExtension.class)
    class RestaurantServiceDealTests {

        @Mock private RestaurantRepo restaurantRepo;
        @Mock private UserRepo userRepo;
        @Mock private FoodRepo foodRepo;
        @InjectMocks private RestaurantService restaurantService;

        private void mockAuthEmail(String email) {
            Authentication auth = mock(Authentication.class);
            when(auth.getName()).thenReturn(email);
            SecurityContext ctx = mock(SecurityContext.class);
            when(ctx.getAuthentication()).thenReturn(auth);
            SecurityContextHolder.setContext(ctx);
        }

        @Test
        @DisplayName("7. calculateDiscountedPrice applies 10% discount")
        void calculateDiscountedPrice_applies10PercentOff() {
            Double discounted = restaurantService.calculateDiscountedPrice(100.0);
            assertEquals(90.0, discounted);
        }

        @Test
        @DisplayName("8. calculateDiscountedPrice rounds to 2 decimals")
        void calculateDiscountedPrice_roundsTo2Decimals() {
            Double discounted = restaurantService.calculateDiscountedPrice(199.0);
            assertEquals(179.10, discounted);
        }

        @Test
        @DisplayName("9. getDealOfTheDay returns null when expired")
        void getDealOfTheDay_whenExpired_returnsNull() {
            Restaurant r = new Restaurant();
            r.setRestaurant_id(1);
            r.setDealOfTheDayFoodId(10);
            r.setDealOfTheDayDate(LocalDate.now().minusDays(1)); // yesterday

            when(restaurantRepo.findById(1)).thenReturn(Optional.of(r));

            assertNull(restaurantService.getDealOfTheDay(1));
            verifyNoInteractions(foodRepo);
        }

        @Test
        @DisplayName("10. setDealOfTheDay throws 400 when food not in menu")
        void setDealOfTheDay_whenFoodNotInMenu_throws400() {
            mockAuthEmail("owner@test.com");

            User owner = new User();
            owner.setUser_id(5);
            owner.setEmail("owner@test.com");

            Restaurant r = new Restaurant();
            r.setRestaurant_id(1);
            r.setOwner(owner);
            r.setFood_available_id(List.of(2, 3)); // food 10 not in menu

            Food f = new Food();
            f.setFood_id(10);

            when(restaurantRepo.findById(1)).thenReturn(Optional.of(r));
            when(userRepo.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
            when(foodRepo.findById(10)).thenReturn(Optional.of(f));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> restaurantService.setDealOfTheDay(1, 10));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
            assertTrue(ex.getReason().contains("not in this restaurant"));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXCEPTION LAYER: GlobalExceptionHandler Tests (5 tests)
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("GlobalExceptionHandler Tests")
    class ExceptionHandlerTests {

        private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

        @Test
        @DisplayName("11. ResponseStatusException 404 returns correct body")
        void handleResponseStatusException_returns404() {
            ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found: 99");
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/foods/99");

            ResponseEntity<ApiError> response = handler.handleResponseStatusException(ex, request);

            assertEquals(404, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("Food not found: 99", response.getBody().getMessage());
            assertEquals("/foods/99", response.getBody().getPath());
        }

        @Test
        @DisplayName("12. ResponseStatusException 409 returns Conflict")
        void handleResponseStatusException_returns409() {
            ResponseStatusException ex = new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/register");

            ResponseEntity<ApiError> response = handler.handleResponseStatusException(ex, request);

            assertEquals(409, response.getStatusCode().value());
            assertEquals("Email already registered", response.getBody().getMessage());
        }

        @Test
        @DisplayName("13. ResponseStatusException 401 returns Unauthorized")
        void handleResponseStatusException_returns401() {
            ResponseStatusException ex = new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");

            ResponseEntity<ApiError> response = handler.handleResponseStatusException(ex, request);

            assertEquals(401, response.getStatusCode().value());
            assertEquals("Invalid credentials", response.getBody().getMessage());
        }

        @Test
        @DisplayName("14. Unhandled exception returns 500")
        void handleUnhandled_returns500() {
            Exception ex = new RuntimeException("Unexpected DB error");
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/foods");

            ResponseEntity<ApiError> response = handler.handleUnhandled(ex, request);

            assertEquals(500, response.getStatusCode().value());
            assertEquals("Unexpected error", response.getBody().getMessage());
            assertEquals("/foods", response.getBody().getPath());
        }

        @Test
        @DisplayName("15. ApiError builder sets all fields")
        void apiError_builderSetsAllFields() {
            Instant now = Instant.now();
            ApiError err = ApiError.builder()
                    .timestamp(now)
                    .status(400)
                    .error("Bad Request")
                    .message("Validation failed")
                    .path("/test")
                    .build();

            assertEquals(400, err.getStatus());
            assertEquals("Bad Request", err.getError());
            assertEquals("Validation failed", err.getMessage());
            assertEquals("/test", err.getPath());
            assertEquals(now, err.getTimestamp());
        }
    }
}


