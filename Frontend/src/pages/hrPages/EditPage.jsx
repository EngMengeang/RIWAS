import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

const API_BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    headline: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [userId, setUserId] = useState("");

  const showFlash = (msg, type = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3500);
  };

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/profiles/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Not found");
        const result = await res.json();
        const pd = result.data;
        const ud = pd?.user;

        setForm({
          firstName: ud?.firstName || "",
          lastName: ud?.lastName || "",
          email: ud?.email || "",
          phone: ud?.phoneNumber || "",
          headline: pd?.headline || "",
          bio: pd?.bio || "",
        });
        setAvatarPreview(pd?.avatarUrl || ud?.profilePicture || "");
      } catch (e) {
        // Load from localStorage fallback
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          const user = JSON.parse(currentUser);
          setForm({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
            headline: "",
            bio: "",
          });
          setAvatarPreview(user.profilePicture || "");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.firstName.trim()) {
      showFlash("First name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("phoneNumber", form.phone);
      formData.append("headline", form.headline);
      formData.append("bio", form.bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch(`${API_BASE}/profiles`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Save failed");

      // Update localStorage with new name
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const user = JSON.parse(currentUser);
        user.firstName = form.firstName;
        user.lastName = form.lastName;
        user.phoneNumber = form.phone;
        if (avatarPreview && !avatarFile) user.profilePicture = avatarPreview;
        localStorage.setItem("currentUser", JSON.stringify(user));
      }

      showFlash("Profile saved successfully!");
      setTimeout(() => navigate("/profile-page"), 1200);
    } catch (e) {
      showFlash("Failed to save profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";

  const inputClass =
    "w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all placeholder-gray-300";
  const textareaClass =
    "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all resize-none placeholder-gray-300";
  const labelClass =
    "block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Roboto', sans-serif" }}>
        <SideBar />
        <main className="flex-1 ml-[227px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <SideBar />
      <main className="flex-1 ml-[227px] h-screen overflow-y-auto">
        {/* Flash */}
        {flash && (
          <div
            className={`fixed top-4 right-4 z-[200] px-5 py-3 rounded-xl text-sm font-semibold shadow-lg ${
              flash.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-green-50 text-green-700 border border-green-100"
            }`}
          >
            {flash.msg}
          </div>
        )}

        {/* Header */}
        <div className="px-8 pt-8 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <div className="h-0.5 w-full bg-green-500 rounded mt-2" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-6 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-3xl">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-green-100 border border-gray-100 flex-shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-700 font-bold text-2xl">
                    {getInitials(form.firstName, form.lastName)}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md hover:bg-gray-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {form.firstName} {form.lastName}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{form.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-semibold text-green-600 hover:text-green-700"
              >
                Change Photo
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  name="email"
                  value={form.email}
                  disabled
                  className={`${inputClass} opacity-50 cursor-not-allowed`}
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Email cannot be changed here</p>
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+855 xxx xxx xxx"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 text-sm mb-4">Professional Information</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Headline / Title</label>
                <input
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  placeholder="e.g. Senior HR Manager"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="A brief description about yourself..."
                  rows={4}
                  className={textareaClass}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}