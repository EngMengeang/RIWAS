import React from "react";
import SideBar from "../components/SideBar";

export default function Dashboard() {
  // Mock data for the cards
  const stats = [
    { label: "Total Job Postings", value: "12", trend: "+2 this month", color: "text-green-500" },
    { label: "Total Applicants", value: "148", trend: "+15% vs last week", color: "text-blue-500" },
    { label: "Pending Reviews", value: "24", trend: "High priority", color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-900">
      <SideBar />

      <main className="flex-1 ml-[227px] p-10">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-green-500 pb-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">Welcome back, Eng Mengeang. Here is what's happening today.</p>
          </div>
          <button className="bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-600 transition-all">
            Download Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">{stat.label}</p>
              <h3 className={`text-4xl font-black mb-2 ${stat.color}`}>{stat.value}</h3>
              <p className="text-xs font-bold text-slate-400 italic">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Quick Actions Card */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 border-l-4 border-green-500 pl-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[24px] hover:bg-green-50 hover:text-green-600 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:shadow-green-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span className="font-bold text-sm uppercase tracking-tighter">Post Job</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[24px] hover:bg-blue-50 hover:text-blue-600 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:shadow-blue-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <span className="font-bold text-sm uppercase tracking-tighter">Applications</span>
              </button>
            </div>
          </div>

          {/* Hiring Status Card */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 border-l-4 border-green-500 pl-4">Hiring Overview</h3>
            <div className="space-y-4">
              {[
                { stage: "Screening", count: 45, color: "bg-blue-500" },
                { stage: "Interviews", count: 12, color: "bg-purple-500" },
                { stage: "Offer Sent", count: 3, color: "bg-green-500" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-500">{item.stage}</span>
                    <span className="text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${(item.count/60)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}