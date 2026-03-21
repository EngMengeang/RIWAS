import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===============================
   CREATE TEMPLATE
=============================== */
export const createTemplate = async (data) => {
  const res = await API.post("/templates", data);
  return res.data;
};

/* ===============================
   ACTIVATE TEMPLATE
=============================== */
export const activateTemplate = async (templateId) => {
  const res = await API.put(`/templates/activate/${templateId}`);
  return res.data;
};

/* ===============================
   GET ACTIVE TEMPLATE
=============================== */
export const getActiveTemplate = async () => {
  const res = await API.get("/templates/active");
  return res.data.data;
};

/* ===============================
   UPDATE TEMPLATE 
=============================== */
export const updateTemplate = async (templateId, data) => {
  const res = await API.put(`/templates/${templateId}`, data);
  return res.data;
};

/* ===============================
   DELETE TEMPLATE 
=============================== */
export const deleteTemplate = async (templateId) => {
  const res = await API.delete(`/templates/${templateId}`);
  return res.data;
};