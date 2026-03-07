import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getJobs = async (params = {}) => {
  const res = await API.get("/jobpostings", { params });
  return res.data;
};

export const getJobById = async (id) => {
  const res = await API.get(`/jobpostings/${id}`);
  return res.data;
};

export default API;
