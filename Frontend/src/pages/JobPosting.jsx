import React from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";

export default function JobList() {
  const navigate = useNavigate();

  const jobs = [
    {
      id: 1,
      title: "Senior UI/UX Designer",
      company: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      location: "Mumbai, India",
      type: "Part-Time",
      salary: "$120/hr",
      posted: "5 days ago",
      applications: 48 
    },
    {
      id: 2,
      title: "Graphic Designer",
      company: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg",
      location: "Kochi, India",
      type: "Part-Time",
      salary: "$150-220k",
      posted: "30 days ago",
      applications: 124
    },
    {
      id: 3,
      title: "Senior Motion Designer",
      company: "Dribbble",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/32/Dribbble_logo.svg",
      location: "Chennai, India",
      type: "Contract",
      salary: "$85/hr",
      posted: "10 days ago",
      applications: 12
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <SideBar />

      <main className="flex-1 ml-[227px] p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Job Postings</h1>
            <p className="text-slate-400 text-xs font-medium">You have {jobs.length} active listings</p>
          </div>
          {/* Create New Button Style */}
          <button 
            onClick={() => navigate("/post-job")}
            className="px-8 py-3 bg-[#0F172A] text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            Create New
          </button>
        </div>

        {/* Filter Bar Section */}
        <div className="flex justify-between items-center mb-10 gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-4 top-3 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search job by name or role..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Status:</span>
            <div className="relative">
              <select className="appearance-none pl-6 pr-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none shadow-sm cursor-pointer">
                <option>All ({jobs.length})</option>
                <option>Active</option>
                <option>Paused</option>
              </select>
              <span className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* List Header Labels */}
        <div className="grid grid-cols-12 gap-4 px-6 mb-3">
          <div className="col-span-5 text-[10px] font-black uppercase tracking-widest text-slate-300">Role & Company</div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-300">Applications</div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-300">Salary</div>
          <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Actions</div>
        </div>

        {/* Compact List Items */}
        <div className="space-y-3">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              onClick={() => navigate(`/job-detail/${job.id}`)}
              className="group grid grid-cols-12 gap-4 items-center bg-white border border-slate-50 rounded-[24px] p-5 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="col-span-5 flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-slate-50 rounded-xl p-2.5 border border-slate-100 group-hover:bg-white transition-colors">
                  <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-green-600 transition-colors leading-tight">
                    {job.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">{job.company} • {job.location}</p>
                </div>
              </div>

              <div className="col-span-2">
                <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {job.applications} Applied
                </span>
              </div>

              <div className="col-span-2 text-sm font-black text-slate-700">
                {job.salary}
              </div>

              <div className="col-span-3 flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => navigate(`/job-detail/${job.id}`)}
                  className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                >
                  Manage
                </button>
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}