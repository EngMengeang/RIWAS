import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Candidate & HR: fetch all active stages (ordered) ───────────────────────
export const getWorkflowDefinitions = async () => {
  const res = await API.get("/workflow-definitions");
  return res.data.data; // WorkflowDefinition[]
};

// ─── HR only ─────────────────────────────────────────────────────────────────
export const createWorkflowDefinitionAPI = async ({ name, description, order, color }) => {
  const res = await API.post("/workflow-definitions", { name, description, order, color });
  return res.data;
};

export const updateWorkflowDefinitionAPI = async (id, { name, description, order, color, is_active }) => {
  const res = await API.put(`/workflow-definitions/${id}`, {
    name,
    description,
    order,
    color,
    is_active,
  });
  return res.data;
};

export const deleteWorkflowDefinitionAPI = async (id) => {
  const res = await API.delete(`/workflow-definitions/${id}`);
  return res.data;
};

