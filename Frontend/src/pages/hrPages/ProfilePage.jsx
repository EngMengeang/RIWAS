import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

const API_BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState("");

  // Team members (HR users from the real API)
  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [accessLevel, setAccessLevel] = useState("Member");
  const [addingMember, setAddingMember] = useState(false);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  // Flash messages
  const [flash, setFlash] = useState(null);

  const showFlash = (msg, type = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000);
  };

  // Load profile
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        const res = await apiFetch(`/profiles/${userId}`);
        const result = await res.json();
        const pd = result.data;
        const ud = pd?.user;
        setProfile({
          fullName: `${ud?.firstName || ""} ${ud?.lastName || ""}`.trim(),
          email: ud?.email || "",
          phone: ud?.phoneNumber || "",
          role: pd?.headline || ud?.role || "",
          bio: pd?.bio || "",
          avatarUrl: pd?.avatarUrl || ud?.profilePicture || "",
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  // Load team members (all HR/recruiter users)
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const res = await apiFetch(`/users?role=recruiter&limit=50`);
        const result = await res.json();
        const users = Array.isArray(result) ? result : result?.data || result?.users || [];
        setTeamMembers(
          users.map((u) => ({
            id: u.id,
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.email,
            email: u.email,
            role: u.role || "Recruiter",
            avatarUrl: u.profilePicture || u.avatarUrl || "",
            access: u.accessLevel || "Member",
          }))
        );
      } catch (e) {
        console.error("Team load error:", e);
      }
    };
    loadTeam();
  }, []);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiFetch(`/users?search=${encodeURIComponent(searchQuery)}&limit=8`);
        const result = await res.json();
        const users = Array.isArray(result) ? result : result?.data || result?.users || [];
        setSearchResults(
          users.map((u) => ({
            id: u.id,
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.email,
            email: u.email,
            role: u.role || "Recruiter",
            avatarUrl: u.profilePicture || u.avatarUrl || "",
          }))
        );
      } catch (e) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name || user.email);
    setSearchResults([]);
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    if (teamMembers.find((m) => m.id === selectedUser.id)) {
      showFlash("This user is already in the team.", "error");
      return;
    }
    setAddingMember(true);
    try {
      // Optionally call an API to record team membership — for now, add locally
      setTeamMembers((prev) => [
        ...prev,
        {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          avatarUrl: selectedUser.avatarUrl,
          access: accessLevel,
        },
      ]);
      showFlash(`${selectedUser.name} added to the team.`);
      setIsModalOpen(false);
      setSelectedUser(null);
      setSearchQuery("");
      setAccessLevel("Member");
    } catch (e) {
      showFlash("Failed to add member.", "error");
    } finally {
      setAddingMember(false);
    }
  };

  const removeMember = (id) => {
    if (!window.confirm("Remove this member from the team?")) return;
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    showFlash("Member removed.");
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const btnDark =
    "h-10 px-5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-all flex items-center gap-2";
  const btnOutline =
    "h-10 px-5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2";

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
        <div className="px-8 pt-8 pb-0 bg-gray-50 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <div className="h-0.5 w-full bg-green-500 rounded mt-2 mb-6" />
        </div>

        <div className="px-8 pb-12 space-y-6">
          {/* Account Details */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-base">Account Details</h2>
              <button onClick={() => navigate("/edit-profile")} className={btnOutline}>
                Edit Profile
              </button>
            </div>
            <div className="px-8 py-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                    {getInitials(profile?.fullName)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{profile?.fullName || "—"}</p>
                <p className="text-sm text-gray-400 mt-0.5">{profile?.email}</p>
                {profile?.role && (
                  <span className="mt-1.5 inline-block px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                    {profile.role}
                  </span>
                )}
              </div>
            </div>
            <div className="px-8 pb-6 grid grid-cols-4 gap-4">
              {[
                { label: "Full Name", value: profile?.fullName },
                { label: "Email Address", value: profile?.email },
                { label: "Phone Number", value: profile?.phone || "—" },
                { label: "Role / Title", value: profile?.role || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    {label}
                  </p>
                  <div className="h-10 flex items-center px-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 font-medium">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            {profile?.bio && (
              <div className="px-8 pb-6">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Bio</p>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 leading-relaxed">
                  {profile.bio}
                </div>
              </div>
            )}
          </section>

          {/* System Configuration */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800 text-base">System Configuration</h2>
            </div>
            <div className="px-8 py-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Recruitment Process
                </p>
                <div className="flex gap-3">
                  <div className="h-10 flex-1 flex items-center px-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 font-medium">
                    7 Steps Process
                  </div>
                  <Link to="/recruitment-workflow" className={btnDark}>
                    Edit Process
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Scoring Matrix
                </p>
                <div className="flex gap-3">
                  <div className="h-10 flex-1 flex items-center px-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 font-medium">
                    5 Steps Matrix
                  </div>
                  <Link to="/matrix-page" className={btnDark}>
                    Edit Matrix
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Team Management */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800 text-base">Team Management</h2>
                <p className="text-xs text-gray-400 mt-0.5">{teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className={btnDark}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Member
              </button>
            </div>
            {teamMembers.length === 0 ? (
              <div className="px-8 py-12 text-center text-gray-400 text-sm">
                No team members yet. Add HR users to this team.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-8 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Member
                    </th>
                    <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Role
                    </th>
                    <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Access
                    </th>
                    <th className="px-8 py-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-green-100 flex-shrink-0 flex items-center justify-center">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-green-700 text-xs font-bold">
                                {getInitials(member.name)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.role || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                          {member.access}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => removeMember(member.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-7 pt-6 pb-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Add Team Member</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-7 py-5 space-y-4">
              {/* Search user */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
                  Search HR User
                </label>
                <div className="relative" ref={searchRef}>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {searching ? (
                      <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedUser(null);
                    }}
                    className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
                  />
                  {/* Dropdown results */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-green-100 flex-shrink-0 flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-green-700 text-xs font-bold">{getInitials(user.name)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Selected user preview */}
                {selectedUser && (
                  <div className="mt-2 flex items-center gap-3 px-3 py-2.5 bg-green-50 border border-green-100 rounded-xl">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-green-100 flex-shrink-0 flex items-center justify-center">
                      {selectedUser.avatarUrl ? (
                        <img src={selectedUser.avatarUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-green-700 text-xs font-bold">{getInitials(selectedUser.name)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800">{selectedUser.name}</p>
                      <p className="text-xs text-green-600">{selectedUser.email}</p>
                    </div>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Access Level */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
                  Access Level
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="px-7 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                }}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || addingMember}
                className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingMember ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Add to Team"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}