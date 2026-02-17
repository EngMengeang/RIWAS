import React from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";

export default function JobDetail() {
  const navigate = useNavigate();

  // Mock data based on your "Data Science Intern" example
  const job = {
    title: "Data Science Intern",
    department: "IT",
    type: "Internship",
    location: "Cambodia Academy of Digital Technology",
    salaryRange: "150$ - 250$",
    postedDate: "20/12/2025",
    deadline: "15/01/2026",
    description: "Assist with data cleaning, visualization, and models.",
    requirements: [
      "React/Vue + Node/Python",
      "Databases",
      "REST APIs",
      "Git",
      ".Problem solving"
    ],
    responsibilities: [
      "Support data pipeline development",
      "Create visualization dashboards",
      "Collaborate with senior developers"
    ]
  };

  const labelStyle = "text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block";
  const infoTextStyle = "text-slate-700 font-bold";
  const sectionHeaderStyle = "text-xl font-extrabold text-slate-800 pb-2 border-b-2 border-[#54f09d] mb-6";

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <SideBar />

      <main className="flex-1 ml-[227px] p-10">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-all"
          >
            <span>←</span> Back to Postings
          </button>
          
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-green-500 text-[#0F172A] rounded-full font-bold text-sm shadow-lg shadow-green-100 hover:bg-green-600 transition-all">
              Edit
            </button>
            <button className="px-6 py-2 bg-red-50 text-red-500 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-all">
              Delete
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm">
          {/* Job Identity */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-800 mb-2">{job.title}</h1>
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-black uppercase tracking-widest">
                Department: {job.department}
              </span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-10 mb-12">
            <div>
              <label className={labelStyle}>Job Type</label>
              <p className={infoTextStyle}>{job.type}</p>
            </div>
            <div>
              <label className={labelStyle}>Location</label>
              <p className={infoTextStyle}>{job.location}</p>
            </div>
            <div>
              <label className={labelStyle}>Salary Range</label>
              <p className={infoTextStyle}>{job.salaryRange}</p>
            </div>
            <div>
              <label className={labelStyle}>Posted Date</label>
              <p className={infoTextStyle}>{job.postedDate}</p>
            </div>
            <div>
              <label className={labelStyle}>Application Deadline</label>
              <p className={infoTextStyle}>{job.deadline}</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-10">
            <section>
              <h2 className={sectionHeaderStyle}>Job Description</h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                {job.description}
              </p>
            </section>

            <section>
              <h2 className={sectionHeaderStyle}>Requirements</h2>
              <ul className="grid grid-cols-2 gap-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    {req}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={sectionHeaderStyle}>Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-500 font-medium">
                    <span className="mt-2 w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                    {resp}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}