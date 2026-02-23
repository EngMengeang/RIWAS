import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";

export default function PostJob() {
  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    location: "",
    jobType: "",
    status: "",
    requirements: "",
    minSalary: "",
    maxSalary: "",
    postedDate: "",
    deadline: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      title: form.title,
      description: form.description,
      location: form.location,
      jobType: form.jobType,

      // convert string → array
      requirements: form.requirements.split(",").map(r => r.trim()).filter(r => r),

      salary: {
        min: Number(form.minSalary),
        max: Number(form.maxSalary),
        currency: "USD"
      }
    };

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:5000/api/jobpostings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      const data = await res.json();
      console.log(data);
      
      if (res.ok) {
        alert("Job created successfully!");
        setForm({
          title: "",
          department: "",
          description: "",
          location: "",
          jobType: "",
          status: "",
          requirements: "",
          minSalary: "",
          maxSalary: "",
          postedDate: "",
          deadline: ""
        });
      } else {
        alert(data.error || "Failed to create job");
      }

    } catch (err) {
      console.error(err);
    }
  };




  // Consistent Styling variables
  const labelStyle = "block text-sm font-semibold text-slate-600 mb-2";
  const inputStyle = "w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all placeholder:text-slate-300";
  const sectionHeaderStyle = "text-xl font-bold text-slate-800 pb-2 border-b-2 border-[#54f09d] mb-8";
  const cardStyle = "bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-8";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]"> {/* Soft grey background to make white boxes pop */}
      <SideBar />

      <main className="flex-1 ml-[227px] p-12">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-slate-700">Post New Job</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-all"
          >
            Cancel
          </button>
        </div>

        <form className="w-full" onSubmit={handleSubmit}>

          {/* Section 1: Basic Information */}
          <section className={cardStyle}>
            <h2 className={sectionHeaderStyle}>Basic Information</h2>
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-1">
                <label className={labelStyle}>Job Title</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g, Senior Web Developer" className={inputStyle} />
              </div>
              <div className="col-span-1">
                <label className={labelStyle}>Department</label>
                <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="e.g, Information Technology" className={inputStyle} />
              </div>
              <div className="col-span-1">
                <label className={labelStyle}>Job Type</label>
                <select name="jobType" value={form.jobType} onChange={handleChange} className={inputStyle}>
                  <option value="">Select Job Type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className={labelStyle}>Min Salary</label>
                <input type="text" name="minSalary" value={form.minSalary} onChange={handleChange} placeholder="e.g, 500$" className={inputStyle} />
              </div>
              <div className="col-span-1">
                <label className={labelStyle}>Max Salary</label>
                <input type="text" name="maxSalary" value={form.maxSalary} onChange={handleChange} placeholder="e.g, 2000$" className={inputStyle} />
              </div>
            </div>
          </section>

          {/* Section 2: Job Details */}
          <section className={cardStyle}>
            <h2 className={sectionHeaderStyle}>Job Details</h2>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <label className={labelStyle}>Posted Date</label>
                <input type="text" name="postedDate" value={form.postedDate} onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Application Deadline</label>
                <input type="text" name="deadline" value={form.deadline} onChange={handleChange} placeholder="dd/mm/yy" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Location</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g, Cambodia, Remote" className={inputStyle} />
              </div>
            </div>
          </section>

          {/* Section 3: Description & Requirement */}
          <section className={cardStyle}>
            <h2 className={sectionHeaderStyle}>Description & Requirement</h2>
            <div className="space-y-8">
              <div>
                <label className={labelStyle}>Job Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="e.g, Describe the role, what candidate will do..."
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Requirements</label>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows="5"
                  placeholder="e.g, Certification, Year of Experiences"
                  className={inputStyle}
                />
              </div>
            </div>
          </section>

          {/* Submit Button Section */}
          <div className="flex justify-end mb-12">
            <button
              type="submit"
              className="px-4 py-3 bg-[#03EF62] text-[#0F172A] rounded-xl font-bold text-base shadow-md hover:bg-[#1eb054] transition-all transform active:scale-95 flex items-center justify-center min-w-[140px]"
            >
              Publish
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}