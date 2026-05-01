import axiosInstance from "../services/axiosInstance";

const BASE = "foods";
const unwrap = (res) => res.data;

export const getFoods = () =>
    axiosInstance.get(BASE).then(unwrap);

export const getFoodById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(unwrap);

export const createFood = (payload) =>
    axiosInstance.post(BASE, payload).then(unwrap);

export const updateFood = (id, payload) =>
    axiosInstance.put(`${BASE}/${id}`, payload).then(unwrap);

export const deleteFood = (id) =>
    axiosInstance.delete(`${BASE}/${id}`).then(unwrap);

/** POST /foods/{foodId}/like — increment like count */
export const likeFood = (id) =>
    axiosInstance.post(`${BASE}/${id}/like`).then(unwrap);

const foodApi = { getFoods, getFoodById, createFood, updateFood, deleteFood, likeFood };
export default foodApi;
