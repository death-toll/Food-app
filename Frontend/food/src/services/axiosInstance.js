import axios from "axios";

const axiosInstance = axios.create({
  // http://localhost:5173/
  // Keep the trailing slash so relative paths like "api/auth/login" join correctly.
  // For Azure deployments, swap this to your WebApp URL or drive it via VITE_API_BASE_URL.
  baseURL: "http://13.220.238.106:8083/" 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Attach JWT to every request; backend reads the Bearer token.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
