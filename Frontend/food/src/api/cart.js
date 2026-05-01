import axiosInstance from '../services/axiosInstance';

const unwrap = (res) => res.data;
const BASE = 'api/cart';

/** GET /api/cart — returns CartResponseDto */
export const getCart = () =>
    axiosInstance.get(BASE).then(unwrap);

/** POST /api/cart/items — { foodId, restaurantId, quantity } */
export const addToCart = (foodId, restaurantId, quantity = 1) =>
    axiosInstance.post(`${BASE}/items`, { foodId, restaurantId, quantity }).then(unwrap);

/** PUT /api/cart/items/{cartItemId} — { quantity } */
export const updateCartItem = (cartItemId, quantity) =>
    axiosInstance.put(`${BASE}/items/${cartItemId}`, { quantity }).then(unwrap);

/** DELETE /api/cart/items/{cartItemId} */
export const removeFromCart = (cartItemId) =>
    axiosInstance.delete(`${BASE}/items/${cartItemId}`).then(unwrap);

/** DELETE /api/cart — clear entire cart */
export const clearCart = () =>
    axiosInstance.delete(BASE).then(unwrap);

const cartApi = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
export default cartApi;
