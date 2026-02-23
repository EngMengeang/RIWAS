import React from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";

export default function EditProfile() {
  const navigate = useNavigate();
  const inputStyle = "h-11 w-full px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-slate-100 transition-all";

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-900">
      <SideBar />
      <main className="flex-1 ml-[227px]">
        <div className="px-12 py-10 bg-white border-b border-slate-100 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="h-10 px-6 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
            <button onClick={() => navigate(-1)} className="h-10 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md">Save Changes</button>
          </div>
        </div>

        <div className="px-12 py-12 max-w-4xl mx-auto">
          <section className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm space-y-8">
            <div className="flex flex-col items-center mb-8">
               <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-2 border-slate-200">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mengeang" alt="avatar" />
               </div>
               <button className="text-xs font-bold text-emerald-600 hover:underline">Change Photo</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input className={inputStyle} defaultValue="Eng Mengeang" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input className={inputStyle} defaultValue="mengeangeng@gmail.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input className={inputStyle} defaultValue="+855 987 654 321" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                <input className={inputStyle} defaultValue="HR Manager" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bio</label>
              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none min-h-[120px]" defaultValue="Focusing on streamlining recruitment processes..." />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}