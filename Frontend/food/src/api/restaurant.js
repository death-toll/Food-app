import axiosInstance from "../services/axiosInstance";

// Backend: RestaurantController -> /restaurants
const BASE = "restaurants";

const unwrap = (res) => res.data;

export const getRestaurants = (params) =>
    axiosInstance.get(BASE, { params }).then(unwrap);

export const getRestaurantById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(unwrap);

/** GET /restaurants/owner/{ownerId} — returns only the owner's restaurants */
export const getRestaurantsByOwner = (ownerId) =>
    axiosInstance.get(`${BASE}/owner/${ownerId}`).then(unwrap);

export const createRestaurant = (payload) =>
    axiosInstance.post(BASE, payload).then(unwrap);

export const updateRestaurant = (id, payload) =>
    axiosInstance.put(`${BASE}/${id}`, payload).then(unwrap);

export const deleteRestaurant = (id) =>
    axiosInstance.delete(`${BASE}/${id}`).then(unwrap);

export const addFoodToRestaurant = (restaurantId, foodId) =>
    axiosInstance.post(`${BASE}/${restaurantId}/foods/${foodId}`).then(unwrap);

// ── Deal of the Day ────────────────────────────────────────────────────────────

/** GET /restaurants/{restaurantId}/deal-of-the-day — Get today's deal (Public) */
export const getDealOfTheDay = (restaurantId) =>
    axiosInstance.get(`${BASE}/${restaurantId}/deal-of-the-day`).then(unwrap);

/** PUT /restaurants/{restaurantId}/deal-of-the-day/{foodId} — Set deal (Owner only) */
export const setDealOfTheDay = (restaurantId, foodId) =>
    axiosInstance.put(`${BASE}/${restaurantId}/deal-of-the-day/${foodId}`).then(unwrap);

/** DELETE /restaurants/{restaurantId}/deal-of-the-day — Remove deal (Owner only) */
export const removeDealOfTheDay = (restaurantId) =>
    axiosInstance.delete(`${BASE}/${restaurantId}/deal-of-the-day`).then(unwrap);

const restaurantApi = {
    getRestaurants,
    getRestaurantById,
    getRestaurantsByOwner,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    addFoodToRestaurant,
    getDealOfTheDay,
    setDealOfTheDay,
    removeDealOfTheDay,
};

export default restaurantApi;
