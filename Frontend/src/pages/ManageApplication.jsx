import React, { useState } from "react";
import SideBar from "../components/SideBar";

export default function ManageApplication() {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([
    { id: 1, name: "John Doe", position: "Frontend Developer", dateApplied: "2026-01-25", status: "Pending" },
    { id: 2, name: "Jane Smith", position: "Backend Developer", dateApplied: "2026-01-24", status: "Reviewed" },
    { id: 3, name: "Michael Lee", position: "UI/UX Designer", dateApplied: "2026-01-22", status: "Accepted" },
    { id: 4, name: "Sokha Mean", position: "Frontend Developer", dateApplied: "2026-01-20", status: "Pending" },
  ]);

  const filteredApps = applications.filter((app) => {
    const matchesTab = filter === "All" || app.status === filter;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDelete = (id) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const handleNextStep = (id) => {
    setApplications(applications.map(app => {
      if (app.id === id) {
        if (app.status === "Pending") return { ...app, status: "Reviewed" };
        if (app.status === "Reviewed") return { ...app, status: "Accepted" };
      }
      return app;
    }));
  };

  const stats = {
    All: applications.length,
    Pending: applications.filter(a => a.status === "Pending").length,
    Reviewed: applications.filter(a => a.status === "Reviewed").length,
    Accepted: applications.filter(a => a.status === "Accepted").length,
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-900">
      <SideBar />

      <main className="flex-1 ml-[227px] p-10">
        <div className="flex justify-between items-center border-b border-green-500 pb-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Manage Applications</h2>
            <p className="text-slate-500 text-sm">Efficiently process your candidate pipeline.</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input 
              type="text"
              placeholder="Search candidate by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none shadow-sm"
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Status:</label>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-5 pr-12 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-green-500 outline-none cursor-pointer min-w-[160px]"
              >
                {["All", "Pending", "Reviewed", "Accepted"].map((tab) => (
                  <option key={tab} value={tab}>
                    {tab} ({stats[tab]})
                  </option>
                ))}
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">No</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Position</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Applied</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApps.map((app, index) => (
                <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-slate-300">{index + 1}</td>
                  <td className="px-8 py-5 font-bold text-slate-800 text-sm">{app.name}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold italic">
                      {app.position}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400">{app.dateApplied}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      app.status === "Pending" ? "bg-orange-100 text-orange-600" :
                      app.status === "Reviewed" ? "bg-blue-100 text-blue-600" :
                      "bg-green-100 text-green-600"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-2">
                      {app.status !== "Accepted" && (
                        <button 
                          onClick={() => handleNextStep(app.id)}
                          className="px-4 py-1.5 bg-green-50 text-green-600 rounded-xl text-[11px] font-black uppercase hover:bg-green-500 hover:text-white transition-all shadow-sm"
                        >
                          Next Step
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredApps.length === 0 && (
            <div className="py-20 text-center bg-white">
              <div className="mb-4 flex justify-center text-slate-200">
                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest">No candidates match your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}