import axiosInstance from "../services/axiosInstance";
import apiCache from "../services/apiCache";

const BASE = "restaurant-ratings";

const unwrap = (res) => res.data;

/**
 * POST /restaurant-ratings
 * Add or update a rating for a restaurant (token identifies the user).
 * @param {number} restaurantId
 * @param {number} rating  — 1 to 5
 * @param {string} [review]
 * @returns {RestaurantRatingResponseDto}
 */
export const rateRestaurant = (restaurantId, rating, review = '') =>
    axiosInstance.post(BASE, { restaurantId, rating, review }).then(unwrap);

/**
 * GET /restaurant-ratings/restaurant/{restaurantId}
 * Get all ratings for a restaurant.
 * @returns {RestaurantRatingResponseDto[]}
 */
export const getRatingsForRestaurant = (restaurantId) =>
    axiosInstance.get(`${BASE}/restaurant/${restaurantId}`).then(unwrap);

/**
 * GET /restaurant-ratings/restaurant/{restaurantId}/average
 * Get average rating and total count for a restaurant.
 * Cached for 2 seconds to prevent repeated calls
 * @returns {{ restaurantId, restaurantName, averageRating, totalRatings }}
 */
export const getAverageRating = (restaurantId) =>
    apiCache.withCache(
        `rating/average/${restaurantId}`,
        () => axiosInstance.get(`${BASE}/restaurant/${restaurantId}/average`).then(unwrap),
        restaurantId,
        // Short TTL because list pages can render many cards at once.
        2000
    );

/**
 * GET /restaurant-ratings/restaurant/{restaurantId}/me
 * Get the current logged-in user's rating/review for a restaurant.
 * @returns {RestaurantRatingResponseDto}
 */
export const getMyRatingForRestaurant = (restaurantId) =>
    axiosInstance.get(`${BASE}/restaurant/${restaurantId}/me`).then(unwrap);

const ratingApi = {
    rateRestaurant,
    getRatingsForRestaurant,
    getAverageRating,
    getMyRatingForRestaurant,
};

export default ratingApi;
