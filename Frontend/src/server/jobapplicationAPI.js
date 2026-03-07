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

// -----------------------------
// SUBMIT APPLICATION
// -----------------------------
export const submitApplication = async (
  jobId,
  resumeFile,
  coverLetterFile = null,
) => {
  const formData = new FormData();
  formData.append("jobId", jobId);
  formData.append("resume", resumeFile);
  if (coverLetterFile) formData.append("coverLetter", coverLetterFile);

  const res = await API.post("/jobapplications/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// -----------------------------
// SUBMIT APPLICATION WITH EXISTING RESUME ID
// -----------------------------
export const submitApplicationWithResumeId = async (
  jobId,
  resumeId,
  coverLetterFile = null,
) => {
  const formData = new FormData();
  formData.append("jobId", jobId);
  formData.append("resumeId", resumeId);
  if (coverLetterFile) formData.append("coverLetter", coverLetterFile);

  const res = await API.post("/jobapplications/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// -----------------------------
// GET MY APPLICATIONS (candidate)
// -----------------------------
export const getMyApplications = async ({
  page = 1,
  limit = 10,
  status = "",
} = {}) => {
  const params = { page, limit };
  if (status) params.status = status;

  const res = await API.get("/jobapplications", { params });
  return res.data;
};

// -----------------------------
// GET APPLICATION BY ID
// -----------------------------
export const getApplicationById = async (id) => {
  const res = await API.get(`/jobapplications/${id}`);
  return res.data.data;
};

// -----------------------------
// UPDATE APPLICATION STATUS (recruiter)
// -----------------------------
export const updateApplicationStatus = async (
  id,
  { status, rejection_reason = null, notes = null },
) => {
  const res = await API.put(`/jobapplications/${id}`, {
    status,
    rejection_reason,
    notes,
  });
  return res.data;
};

// -----------------------------
// DELETE APPLICATION
// -----------------------------
export const deleteApplication = async (id) => {
  const res = await API.delete(`/jobapplications/${id}`);
  return res.data;
};

// -----------------------------
// GET RESUME URL
// -----------------------------
export const getResumeUrl = async (id) => {
  const res = await API.get(`/jobapplications/${id}/resume`);
  return res.data.url;
};

// -----------------------------
// GET COVER LETTER URL
// -----------------------------
export const getCoverLetterUrl = async (id) => {
  const res = await API.get(`/jobapplications/${id}/coverLetter`);
  return res.data.url;
};
