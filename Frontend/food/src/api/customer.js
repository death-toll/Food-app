import axiosInstance from "../services/axiosInstance";

// Backend: UserController -> /users
const USER_BASE_PATH = "users";

const unwrap = (response) => response.data;

export const getCustomers = (params) =>
  axiosInstance.get(USER_BASE_PATH, { params }).then(unwrap);

export const getCustomerById = (customerId) =>
  axiosInstance.get(`${USER_BASE_PATH}/${customerId}`).then(unwrap);

export const createCustomer = (payload) =>
  axiosInstance.post(USER_BASE_PATH, payload).then(unwrap);

export const updateCustomer = (customerId, payload) =>
  axiosInstance.put(`${USER_BASE_PATH}/${customerId}`, payload).then(unwrap);

export const deleteCustomer = (customerId) =>
  axiosInstance.delete(`${USER_BASE_PATH}/${customerId}`).then(unwrap);

// Preferred aliases
export const getUsers = getCustomers;
export const getUserById = getCustomerById;
export const createUser = createCustomer;
export const updateUser = updateCustomer;
export const deleteUser = deleteCustomer;

const userApi = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userApi;
