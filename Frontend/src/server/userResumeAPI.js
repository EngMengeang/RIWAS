import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Upload Resume
export const uploadResume = async (file) => {
  const form = new FormData();
  form.append("resume", file); 

  const res = await API.post("/resumes/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// Get All User Resumes
export const getMyResumes = async () => {
  const res = await API.get("/resumes");
  return res.data.data;
};
// only one
export const getMyResume = async () => {
  const res = await API.get("/resumes"); 
  return { data: res.data.data[0] || null };
};

// Get Single Resume
export const getResumeById = async (id) => {
  const res = await API.get(`/resumes/${id}`);
  return res.data.data;
};

// Delete Resume
export const deleteResume = async (id) => {
  const res = await API.delete(`/resumes/${id}`);
  return res.data;
};

// Update Resume AI analysis
export const updateResume = async (id, data) => {
  const res = await API.put(`/resumes/${id}`, { ai_analysis: data });
  return res.data;
};
