import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8083/",
});

// axiosInstance.interceptors.request.use(
//   /*
//     Every API call-> interceptors runs first-> gets token from localstorage
//     -> adds Authorization header-> then actual API request is sent
//      */
//   (config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`; //automatically add token to all requests after login for /api/users/me
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );
export default axiosInstance;
