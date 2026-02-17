import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";

export default function ProfilePage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Account Details - will be updated from API
  const [profile, setProfile] = useState({
    fullName: "Loading...",
    email: "",
    phone: "",
    role: "",
    avatarUrl: ""
  });

  useEffect(() => {
    // Get user data from localStorage
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setId(user.id);
      console.log("User ID:", user.id);
      
      // Set initial profile from localStorage user data
      setProfile({
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        phone: user.phoneNumber || "",
        role: user.role || "",
        avatarUrl: user.profilePicture || ""
      });
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`http://localhost:5000/api/profiles/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
          }
        });
        
        if (res.status === 404) {
          // Profile not found - use localStorage data
          console.log("Profile not found, using localStorage data");
          setLoading(false);
          return;
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        
        const result = await res.json();
        console.log("Profile data:", result);
        
        // Extract profile and user data from response
        const profileData = result.data;
        const userData = profileData?.user;
        
        if (profileData) {
          setProfile({
            fullName: `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim(),
            email: userData?.email || "",
            phone: userData?.phoneNumber || "",
            role: profileData?.headline || profileData?.bio || userData?.role || "",
            avatarUrl: profileData?.avatarUrl || userData?.profilePicture || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);

  // State for Team Management
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Vorn Sina", email: "vorn.sina@example.com", role: "Senior Data Scientist", access: "Super Admin" },
    { id: 2, name: "Keo Socheata", email: "socheata.k@example.com", role: "HR Analyst", access: "Admin" }
  ]);

  // State for Invite Modal Inputs
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "", access: "Member" });

  const handleInvite = (e) => {
    e.preventDefault();
    if (newMember.name && newMember.email) {
      const id = Date.now(); // More reliable unique ID
      setTeamMembers([...teamMembers, { ...newMember, id }]);
      setIsModalOpen(false);
      setNewMember({ name: "", email: "", role: "", access: "Member" });
    }
  };

  const removeMember = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  // Reusable Styles
  const btnBase = "h-11 px-8 rounded-xl font-bold text-sm transition-all flex items-center justify-center whitespace-nowrap active:scale-95";
  const btnDark = `${btnBase} bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200 w-[140px]`;
  const btnSecondary = `${btnBase} bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`;
  const inputDisplay = "h-11 flex items-center w-full px-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 font-medium text-sm";

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      <SideBar />
      <main className="flex-1 ml-[227px]">
        <div className="px-12 py-12 max-w-7xl mx-auto space-y-8">

          {/* 2. ACCOUNT DETAILS (Merged below Configuration) */}
          <section className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm">
            {/* HEADER */}
            <div className=" bg-white  border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-slate-900 overflow-hidden border-4 border-slate-50 shadow-sm">
                  <img 
                    src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`} 
                    alt="profile" 
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                  <p className="text-slate-400 text-sm mt-1">{profile.email} • {profile.role}</p>
                </div>
              </div>
              <button onClick={() => navigate("/edit-profile")} className={btnSecondary}>Edit Profile</button>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mt-12 mb-6">Personal Details</h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className={inputDisplay}>{profile.fullName}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className={inputDisplay}>{profile.email}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className={inputDisplay}>{profile.phone}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <div className={inputDisplay}>{profile.role}</div>
              </div>
            </div>
          </section>


          {/* 1. SYSTEM CONFIGURATION */}
          <section className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm">
            <h3 className="font-bold text-xl text-slate-800 mb-6">System Configuration</h3>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recruitment Process</label>
                <div className="flex gap-4">
                  <div className="h-11 flex-1 px-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center font-semibold text-slate-700">7 Steps Process</div>
                  <Link to="/recruitment-workflow" className={btnDark}>Edit Process</Link>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Scoring Matrix</label>
                <div className="flex gap-4">
                  <div className="h-11 flex-1 px-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center font-semibold text-slate-700">5 Steps Matrix</div>
                  <Link to="/matrix-page" className={btnDark}>Edit Matrix</Link>
                </div>
              </div>
            </div>
          </section>


          {/* 3. TEAM MANAGEMENT */}
          <section className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-8 flex justify-between items-center border-b border-slate-50">
              <h3 className="font-bold text-xl text-slate-800">Team Management</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className={`${btnDark} w-auto px-4 flex items-center gap-2`}
              >
                Invite Member +
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-5">Collaborator</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Access Level</th>
                  <th className="px-10 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="group hover:bg-slate-50/30">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{member.name}</p>
                          <p className="text-[11px] text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{member.role || "N/A"}</td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                        {member.access}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-red-300 hover:text-red-500 transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* INVITE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <form onSubmit={handleInvite} className="bg-white p-10 rounded-[32px] w-full max-w-[480px] shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Invite Collaborator</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                  <input
                    required
                    placeholder="e.g. John Doe"
                    className="w-full h-11 px-5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="w-full h-11 px-5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Role</label>
                    <input
                      placeholder="e.g. Designer"
                      className="w-full h-11 px-5 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Access Level</label>
                    <select
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-600 text-xs"
                      value={newMember.access}
                      onChange={(e) => setNewMember({ ...newMember, access: e.target.value })}
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                  <button type="submit" className="bg-slate-900 text-white flex-1 h-12 rounded-xl font-bold shadow-lg shadow-slate-200">Confirm Invite</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}