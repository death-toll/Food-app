import axiosInstance from "../services/axiosInstance";

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
 * @returns {{ restaurantId, restaurantName, averageRating, totalRatings }}
 */
export const getAverageRating = (restaurantId) =>
    axiosInstance.get(`${BASE}/restaurant/${restaurantId}/average`).then(unwrap);

const ratingApi = {
    rateRestaurant,
    getRatingsForRestaurant,
    getAverageRating,
};

export default ratingApi;
