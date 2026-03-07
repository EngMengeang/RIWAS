import React, { useRef, useState, useEffect } from "react";
import { FaCamera, FaPlus, FaFilePdf, FaTrash } from "react-icons/fa";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const API = axios.create({ baseURL: `${BASE_URL}/api` });

API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Token / User helpers ─────────────────────────────────────────────────────
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const decodeToken = () => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const getUserId = () => {
  const currentUser = getCurrentUser();
  if (currentUser?.id) return currentUser.id;
  const payload = decodeToken();
  return payload?.id || payload?.userId || payload?.sub || null;
};

// ─── FormData builder ─────────────────────────────────────────────────────────
const buildFormData = (data) => {
  const fd = new FormData();
  for (const key in data) {
    if (data[key] === undefined || data[key] === null) continue;
    if (key === "avatar") {
      if (data.avatar instanceof File) fd.append("avatar", data.avatar);
    } else {
      fd.append(key, data[key]);
    }
  }
  return fd;
};

// ─── API helpers ──────────────────────────────────────────────────────────────
const profileAPI = {
  get: (userId) => API.get(`/profiles/${userId}`).then((r) => r.data.data),

  create: () =>
    API.post("/profiles", buildFormData({ bio: "", headline: "", about: "" }), {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data),

  update: (data) =>
    API.put("/profiles", buildFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data),
};

const resumeAPI = {
  upload: async (file) => {
    const form = new FormData();
    form.append("resume", file);
    const res = await API.post("/resumes/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getAll: async () => {
    const res = await API.get("/resumes");
    return res.data.data || [];
  },

  delete: async (id) => {
    const res = await API.delete(`/resumes/${id}`);
    return res.data;
  },
};

const getFileUrl = (r) => r.resume || null;

const getFileName = (r) => {
  if (r.originalName) return r.originalName;
  if (r.original_name) return r.original_name;
  if (r.filename) return r.filename;
  const url = getFileUrl(r);
  if (url) return decodeURIComponent(url.split("/").pop().split("?")[0]);
  return `Resume_${r.id}`;
};

const DEFAULT_AVATAR = "./userprofile.png";

// ─── Component ────────────────────────────────────────────────────────────────
const ProfileCandidate = () => {
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [resumes, setResumes] = useState([]);
  const [resumeUploading, setResumeUploading] = useState(false);

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Candidate",
    createdAt: "",
  });

  const [profile, setProfile] = useState({
    bio: "",
    headline: "",
    about: "",
    experience: 0,
    websiteUrl: "",
    github: "",
    linkedin: "",
    twitter: "",
    phonenumber: "",
  });

  // ── Apply server response ───────────────────────────────────────────────────
  const applyData = (data) => {
    if (!data) return;
    const u = data.user || getCurrentUser() || {};
    setUserInfo({
      fullName:
        u.name ||
        u.fullName ||
        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
        "",
      email: u.email || "",
      // ✅ FIX 1: read phonenumber from profile first, fallback to user object
      phone: data.phonenumber || u.phone || u.phoneNumber || "",
      role: u.role || data.role || "Candidate",
      createdAt: u.createdAt || data.createdAt || "",
    });
    setProfile({
      bio: data.bio || "",
      headline: data.headline || "",
      about: data.about || "",
      experience: data.experience || 0,
      websiteUrl: data.websiteUrl || "",
      github: data.github || "",
      linkedin: data.linkedin || "",
      twitter: data.twitter || "",
      phonenumber: data.phonenumber || "",
    });
    if (data.avatarUrl) setProfileImage(data.avatarUrl);
  };

  const loadResumes = async () => {
    try {
      const data = await resumeAPI.getAll();
      setResumes(data);
    } catch (err) {
      console.error("Failed to load resumes", err);
    }
  };

  // ── Load on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = getUserId();
        if (!userId) throw new Error("Not logged in. Please log in first.");

        let data;
        try {
          data = await profileAPI.get(userId);
        } catch (err) {
          if (err?.response?.status === 404) {
            try {
              data = await profileAPI.create();
              try {
                data = await profileAPI.get(userId);
              } catch {
                /* use create response */
              }
            } catch (createErr) {
              throw new Error(
                createErr?.response?.data?.error ||
                  createErr?.response?.data?.message ||
                  createErr.message,
              );
            }
          } else {
            throw err;
          }
        }

        applyData(data);
        await loadResumes();
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err.message ||
            "Failed to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Image ───────────────────────────────────────────────────────────────────
  const handleImageClick = () => {
    if (isEditing) fileInputRef.current.click();
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  // ── Resume upload ───────────────────────────────────────────────────────────
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeUploading(true);
    setError(null);
    try {
      await resumeAPI.upload(file);
      await loadResumes();
      setSuccessMsg("Resume uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to upload resume.",
      );
    } finally {
      setResumeUploading(false);
      e.target.value = "";
    }
  };

  // ── Resume delete ───────────────────────────────────────────────────────────
  const handleDeleteResume = async (id) => {
    if (!window.confirm("Delete this resume?")) return;
    try {
      await resumeAPI.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setSuccessMsg("Resume deleted.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to delete resume.",
      );
    }
  };

  // ── Edit / Save ─────────────────────────────────────────────────────────────
  const handleEditToggle = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccessMsg("");
    try {
      const payload = { ...profile };
      if (avatarFile) payload.avatar = avatarFile;
      const updated = await profileAPI.update(payload);
      applyData(updated);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setAvatarFile(null);
      setIsEditing(false);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to save.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  // ✅ FIX 2: sync userInfo.phone with profile.phonenumber on every change
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") {
      setProfile((prev) => ({ ...prev, phonenumber: value }));
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    ["token", "accessToken", "refreshToken", "currentUser", "userId"].forEach(
      (k) => localStorage.removeItem(k),
    );
    window.location.href = "/login";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <div className="font-['Roboto']">
        <div className="flex min-h-screen bg-gray-100">
          <div className="flex-1 p-8 bg-gray-50">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 text-lg">Loading profile…</div>
              </div>
            )}

            {!loading && (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    {successMsg}
                  </div>
                )}

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                  <div
                    className={`relative w-32 h-32 ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                    onClick={handleImageClick}
                    title={isEditing ? "Click to change photo" : ""}
                  >
                    <img
                      src={profileImage}
                      alt="profile"
                      className="w-full h-full object-cover rounded-full border-4 border-white"
                      onError={(e) => {
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    {isEditing && (
                      <div className="absolute bottom-2 right-2 w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaCamera />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    hidden
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold">
                        {userInfo.fullName}
                      </h2>
                      <span className="bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-sm capitalize">
                        {userInfo.role}
                      </span>
                    </div>
                    <p className="text-gray-600">{userInfo.email}</p>
                    {userInfo.createdAt && (
                      <p className="text-gray-400 text-sm">
                        Created at {formatDate(userInfo.createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                <hr className="my-6 border-gray-300" />

                {/* PERSONAL INFORMATION */}
                <h3 className="text-lg font-semibold mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-600 text-sm">Full Name</label>
                    <input
                      name="fullName"
                      value={userInfo.fullName}
                      disabled={!isEditing}
                      onChange={handleUserInfoChange}
                      placeholder="Your full name"
                      className="w-full mt-1 p-2 border rounded-md border-gray-300 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Email</label>
                    <input
                      value={userInfo.email}
                      disabled
                      className="w-full mt-1 p-2 border rounded-md border-gray-300 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Phone</label>
                    <input
                      name="phone"
                      value={userInfo.phone}
                      disabled={!isEditing}
                      onChange={handleUserInfoChange}
                      placeholder="+855 96 7817 889"
                      className="w-full mt-1 p-2 border rounded-md border-gray-300 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Role</label>
                    <input
                      value={userInfo.role}
                      disabled
                      className="w-full mt-1 p-2 border rounded-md border-gray-300 bg-gray-100"
                    />
                  </div>
                </div>

                {/* PROFILE DETAILS */}
                <h3 className="text-lg font-semibold mt-8 mb-4">
                  Profile Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Headline",
                      name: "headline",
                      placeholder: "e.g. Senior Frontend Developer",
                    },
                    {
                      label: "Website",
                      name: "websiteUrl",
                      placeholder: "https://yourwebsite.com",
                    },
                    {
                      label: "GitHub",
                      name: "github",
                      placeholder: "https://github.com/username",
                    },
                    {
                      label: "LinkedIn",
                      name: "linkedin",
                      placeholder: "https://linkedin.com/in/username",
                    },
                    {
                      label: "Twitter",
                      name: "twitter",
                      placeholder: "https://twitter.com/username",
                    },
                  ].map(({ label, name, placeholder }) => (
                    <div key={name}>
                      <label className="text-gray-600 text-sm">{label}</label>
                      <input
                        name={name}
                        value={profile[name]}
                        disabled={!isEditing}
                        onChange={handleProfileChange}
                        placeholder={placeholder}
                        className="w-full mt-1 p-2 border rounded-md border-gray-300 disabled:bg-gray-50"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="text-gray-600 text-sm">Bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    disabled={!isEditing}
                    value={profile.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself…"
                    className="w-full mt-1 p-2 border rounded-md border-gray-300 disabled:bg-gray-50"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-gray-600 text-sm">About</label>
                  <textarea
                    name="about"
                    rows="3"
                    disabled={!isEditing}
                    value={profile.about}
                    onChange={handleProfileChange}
                    placeholder="More details about you…"
                    className="w-full mt-1 p-2 border rounded-md border-gray-300 disabled:bg-gray-50"
                  />
                </div>

                {/* BUTTONS */}
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                  <button
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2 rounded-md disabled:opacity-60"
                  >
                    {saving ? "Saving…" : isEditing ? "Save" : "Edit"}
                  </button>
                  {isEditing ? (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-6 py-2 rounded-md"
                    >
                      Logout
                    </button>
                  )}
                </div>

                {/* ── RESUME SECTION ── */}
                <div className="mt-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Resume</h3>
                    <button
                      onClick={() => (window.location.href = "/uploadcv")}
                      disabled={resumeUploading}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition
                        ${
                          resumeUploading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                        }`}
                    >
                      <FaPlus /> Upload Resume
                    </button>
                  </div>

                  {resumes.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-400">
                      <FaFilePdf className="mx-auto text-4xl mb-2 text-gray-300" />
                      <p className="text-sm">No resume uploaded yet.</p>
                      <p className="text-xs mt-1">Supported: PDF, DOC, DOCX</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {resumes.map((resume) => {
                        const fileUrl = getFileUrl(resume);
                        const fileName = getFileName(resume);
                        return (
                          <div
                            key={resume.id}
                            className="bg-white p-4 rounded-md border border-gray-200 flex justify-between items-center shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                                <FaFilePdf className="text-red-500 text-xl" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-800">
                                  {fileName}
                                </p>
                                {resume.createdAt && (
                                  <p className="text-xs text-gray-400">
                                    Uploaded {formatDate(resume.createdAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              {fileUrl && (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-100 border border-blue-500 text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-200"
                                >
                                  Preview
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteResume(resume.id)}
                                className="bg-red-100 border border-red-500 text-red-500 px-3 py-1 rounded-md text-sm hover:bg-red-200 flex items-center gap-1"
                              >
                                <FaTrash className="text-xs" /> Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCandidate;