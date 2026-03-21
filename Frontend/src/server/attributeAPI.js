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
   CREATE ATTRIBUTE
=============================== */
export const createAttribute = async (data) => {
  const res = await API.post("/attributes", data);
  return res.data;
};

/* ===============================
   GET ATTRIBUTES BY TEMPLATE
=============================== */
export const getAttributesByTemplate = async (templateId) => {
  const res = await API.get(`/attributes/template/${templateId}`);
  return res.data.data;
};

/* ===============================
   UPDATE ACTIVE ATTRIBUTES
=============================== */
export const updateActiveAttributes = async (data) => {
  const res = await API.put("/attributes/activate", data);
  return res.data;
};


/* ===============================
   UPDATE ATTRIBUTE NEW
=============================== */
export const updateAttribute = async (id, data) => {
  const res = await API.put(`/attributes/${id}`, data);
  return res.data;
};

/* ===============================
   DELETE ATTRIBUTE NEW
=============================== */
export const deleteAttribute = async (id) => {
  const res = await API.delete(`/attributes/${id}`);
  return res.data;
};