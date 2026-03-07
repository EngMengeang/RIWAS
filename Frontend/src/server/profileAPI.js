import axios from "axios";

// -----------------------------
// Axios instance
// -----------------------------
const API = axios.create({
  baseURL: "http://localhost:5000/api", 
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Create Profile
export const createProfile = async (profileData) => {
  const formData = new FormData();

  // Add profile fields
  for (const key in profileData) {
    if (key !== "candidateInfo" && key !== "recruiterInfo" && key !== "avatar") {
      formData.append(key, profileData[key]);
    }
  }

  // Candidate info or recruiter info as JSON string
  if (profileData.candidateInfo) {
    formData.append("candidateInfo", JSON.stringify(profileData.candidateInfo));
  }
  if (profileData.recruiterInfo) {
    formData.append("recruiterInfo", JSON.stringify(profileData.recruiterInfo));
  }

  // Add avatar file if exists
  if (profileData.avatar) {
    formData.append("avatar", profileData.avatar);
  }

  const res = await API.post("/profiles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// -----------------------------
// GET PROFILE by user ID
// -----------------------------
export const getProfile = async (userId) => {
  const res = await API.get(`/profiles/${userId}`);
  return res.data.data;
};

// -----------------------------
// UPDATE PROFILE (with avatar)
// -----------------------------
export const updateProfile = async (profileData) => {
  const formData = new FormData();

  for (const key in profileData) {
    if (key !== "candidateInfo" && key !== "recruiterInfo" && key !== "avatar") {
      formData.append(key, profileData[key]);
    }
  }

  if (profileData.candidateInfo) {
    formData.append("candidateInfo", JSON.stringify(profileData.candidateInfo));
  }
  if (profileData.recruiterInfo) {
    formData.append("recruiterInfo", JSON.stringify(profileData.recruiterInfo));
  }

  if (profileData.avatar) {
    formData.append("avatar", profileData.avatar);
  }

  const res = await API.put("/profiles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// -----------------------------
// INCREMENT PROFILE VIEWS
// -----------------------------
export const incrementProfileViews = async (userId) => {
  const res = await API.post(`/profiles/${userId}/view`);
  return res.data;
};


// Updated fro doing dashbaord
// ── Users ─────────────────────────────────────────────────────────────────────

// GET /api/users?page=1&limit=10&role=candidate&search=...
export const getAllUsers = (params = {}) =>
  API.get("/users", { params });

// GET /api/users/:id
export const getUserById = (id) =>
  API.get(`/users/${id}`);

// PUT /api/users/profile  — multipart: image (optional), imageType: "profile"|"cover"
export const updateUserProfile = (profileData) => {
  const form = new FormData();
  Object.entries(profileData).forEach(([k, v]) => {
    if (k === "image" && v) { form.append("image", v); return; }
    if (v !== undefined && v !== null) form.append(k, v);
  });
  return API.put("/users/profile", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE /api/users/:id  — admin only
export const deleteUser = (id) =>
  API.delete(`/users/${id}`);