import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===============================
   ADD MATRIX SCORE
=============================== */
export const addMatrixScore = async (data) => {
  const res = await API.post("/matrix-scores", data);
  return res.data;
};

/* ===============================
   GET MATRIX SCORES
=============================== */
export const getMatrixScoresByApplication = async (applicationId) => {
  const res = await API.get(`/matrix-scores/${applicationId}`);
  return res.data.data;
};

/* ===============================
   UPDATE MATRIX SCORE 
=============================== */
export const updateMatrixScore = async (id, data) => {
  const res = await API.put(`/matrix-scores/${id}`, data);
  return res.data;
};

/* ===============================
   DELETE MATRIX SCORE 
=============================== */
export const deleteMatrixScore = async (id) => {
  const res = await API.delete(`/matrix-scores/${id}`);
  return res.data;
};