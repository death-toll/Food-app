import axiosInstance from '../services/axiosInstance';

const unwrap = (res) => res.data;
const BASE = 'orders';

/** POST /orders — { status, user_id, restaurant_id, food_id: [] } */
export const createOrder = (payload) =>
    // Order creation is the main checkout action.
    axiosInstance.post(BASE, payload).then(unwrap);

/** GET /orders/user/{userId} */
export const getOrdersByUser = (userId) =>
    axiosInstance.get(`${BASE}/user/${userId}`).then(unwrap);

/** GET /orders/restaurant/{restaurantId} */
export const getOrdersByRestaurant = (restaurantId) =>
    axiosInstance.get(`${BASE}/restaurant/${restaurantId}`).then(unwrap);

/** GET /orders/{id} */
export const getOrderById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(unwrap);

/**
 * PUT /orders/{id} — update only the status field.
 * Requires full payload; we pass the existing order fields + new status.
 */
export const updateOrderStatus = (order, newStatus) =>
    // Backend expects a full payload for update; we reuse the existing order fields.
    axiosInstance.put(`${BASE}/${order.order_id}`, {
        status: newStatus,
        user_id: order.user_id,
        restaurant_id: order.restaurant_id,
        food_id: order.food_id,
    }).then(unwrap);

/**
 * PATCH /orders/{id}/cancel — customer cancels their own order.
 */
export const cancelOrder = (orderId) =>
    axiosInstance.patch(`${BASE}/${orderId}/cancel`).then(unwrap);

/** GET /orders — all orders (kept for backward compat) */
export const getOrders = () =>
    axiosInstance.get(BASE).then(unwrap);

const orderApi = { createOrder, getOrders, getOrdersByUser, getOrdersByRestaurant, getOrderById, updateOrderStatus, cancelOrder };
export default orderApi;
