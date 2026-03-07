import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// ==============================
//  WORKFLOW APIs
// ==============================


// Add Workflow Step fro Recruiter
export const addWorkflowStep = async (applicationId, step) => {
  const res = await API.post("/workflows", {
    applicationId,
    step,
  });

  return res.data;
};


// Get Workflow Steps by Application by candidate
export const getWorkflowByApplication = async (applicationId) => {
  const res = await API.get(`/workflows/${applicationId}`);
  return res.data.data;
};


// Delete Workflow Step (if you add delete route later)
export const deleteWorkflowStep = async (workflowId) => {
  const res = await API.delete(`/workflows/${workflowId}`);
  return res.data;
};