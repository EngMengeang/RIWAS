import axios from "axios";

// -----------------------------
// Axios instance
// -----------------------------
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -----------------------------
// GET DASHBOARD DATA
// Params: { month?: number, year?: number }
// Returns the full dashboard payload from the backend
// -----------------------------
export const getDashboardData = async ({ month, year } = {}) => {
  const params = {};
  if (month !== undefined) params.month = month;
  if (year !== undefined) params.year = year;

  const res = await API.get("/dashboard", { params });
  return res.data;
};

export default API;