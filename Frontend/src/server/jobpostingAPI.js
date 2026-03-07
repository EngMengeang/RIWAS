import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Job Postings ──────────────────────────────────────────────────────────────

// GET /api/jobpostings?page=1&limit=10&status=published&location=...&jobType=...
export const getAllJobs = (params = {}) =>
  API.get("/jobpostings", { params });

// GET /api/jobpostings/:id
export const getJobById = (id) =>
  API.get(`/jobpostings/${id}`);

// POST /api/jobpostings  — multipart/form-data (image optional)
export const createJob = (jobData) => {
  const form = new FormData();
  Object.entries(jobData).forEach(([k, v]) => {
    if (k === "image" && v) { form.append("image", v); return; }
    if (k === "salary" && typeof v === "string") {
      // Parse salary string like "$60k-$90k" to object
      form.append(k, v);
      return;
    }
    if (k === "requirements" && Array.isArray(v)) {
      form.append(k, JSON.stringify(v));
      return;
    }
    if (v !== undefined && v !== null && v !== "") form.append(k, v);
  });
  return API.post("/jobpostings", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// PUT /api/jobpostings/:id  — multipart/form-data (image optional)
export const updateJob = (id, jobData) => {
  // For simple updates (like status change), just send JSON
  if (Object.keys(jobData).length === 1 && (jobData.status || jobData.title)) {
    return API.put(`/jobpostings/${id}`, jobData);
  }
  
  const form = new FormData();
  Object.entries(jobData).forEach(([k, v]) => {
    if (k === "image" && v) { form.append("image", v); return; }
    if (k === "salary" && typeof v === "string") {
      form.append(k, v);
      return;
    }
    if (k === "requirements" && Array.isArray(v)) {
      form.append(k, JSON.stringify(v));
      return;
    }
    if (v !== undefined && v !== null && v !== "") form.append(k, v);
  });
  return API.put(`/jobpostings/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE /api/jobpostings/:id
export const deleteJob = (id) =>
  API.delete(`/jobpostings/${id}`);

export default API;