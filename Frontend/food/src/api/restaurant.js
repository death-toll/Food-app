import axiosInstance from "../services/axiosInstance";

// Backend: RestaurantController -> /restaurants
const BASE = "restaurants";

const unwrap = (res) => res.data;

export const getRestaurants = (params) =>
    axiosInstance.get(BASE, { params }).then(unwrap);

export const getRestaurantById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(unwrap);

export const createRestaurant = (payload) =>
    axiosInstance.post(BASE, payload).then(unwrap);

export const updateRestaurant = (id, payload) =>
    axiosInstance.put(`${BASE}/${id}`, payload).then(unwrap);

export const deleteRestaurant = (id) =>
    axiosInstance.delete(`${BASE}/${id}`).then(unwrap);

export const addFoodToRestaurant = (restaurantId, foodId) =>
    axiosInstance.post(`${BASE}/${restaurantId}/foods/${foodId}`).then(unwrap);

const restaurantApi = {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    addFoodToRestaurant,
};

export default restaurantApi;
