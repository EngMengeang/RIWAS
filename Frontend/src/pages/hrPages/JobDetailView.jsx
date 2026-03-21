import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar";
import { getApplicationsByJob } from "../../server/jobapplicationAPI";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

export default function JobDetailView() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [job, setJob]                   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [applicantCount, setApplicantCount] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // Fetch job details + applicant count in parallel
        const [jobRes, appRes] = await Promise.all([
          fetch(`http://localhost:5000/api/jobpostings/${id}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }),
          getApplicationsByJob(id, { limit: 100 }).catch(() => null),
        ]);

        if (!jobRes.ok) throw new Error("Failed to fetch job details");
        const jobData = await jobRes.json();
        setJob(jobData.data || jobData);
        setError(null);

        // Resolve applicant count from whichever response shape the API returns
        if (appRes) {
          const raw = appRes?.data ?? appRes;
          let count = 0;
          if (typeof raw?.total === "number") {
            count = raw.total;
          } else if (Array.isArray(raw)) {
            count = raw.length;
          } else if (typeof raw?.count === "number") {
            count = raw.count;
          } else if (Array.isArray(raw?.data)) {
            count = raw.data.length;
          }
          setApplicantCount(count);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatSalary = (salary) => {
    if (!salary) return "N/A";
    if (typeof salary === "string") return salary;
    if (typeof salary === "object") {
      const { min, max, currency } = salary;
      if (min && max) return `${currency || "$"}${min} - ${max}`;
      return `${currency || "$"}${min || max || "N/A"}`;
    }
    return "N/A";
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${job?.title}"?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`http://localhost:5000/api/jobpostings/${id}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      navigate("/job-listing");
    } catch {
      alert("Failed to delete.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <SideBar />

      <main className="flex-1 ml-[227px] p-8 bg-gray-50 min-h-screen">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-1 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Job Postings
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
            <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
          </div>

          {!loading && job && (
            <div className="ml-6 mt-5 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate(`/edit-job/${id}`)}
                className="px-5 py-2 text-sm font-semibold bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 text-sm font-semibold bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-20">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading job details...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && job && (
          <div className="space-y-5">

            {/* ── Cover + Identity ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-52 bg-gradient-to-br from-blue-100 to-purple-100">
                <img
                  src={job.coverImage || "/postImage.png"}
                  alt={job.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="absolute bottom-0 left-0 right-0 px-5 py-2 bg-white/60 backdrop-blur-sm text-xs text-gray-500 font-medium">
                  {job.department || job.location || "General"}
                </div>
              </div>

              <div className="px-8 py-6 flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.department && (
                      <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                        {job.department}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 capitalize">
                        {job.jobType.replace("_", " ")}
                      </span>
                    )}
                    {job.status && (
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${
                        job.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {job.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Real applicant count */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    Applicants
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {applicantCount !== null ? applicantCount : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Info grid ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Job Information
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Job Type",     value: job.jobType?.replace("_", " ") || "N/A" },
                  { label: "Location",     value: job.location || "N/A" },
                  { label: "Salary Range", value: formatSalary(job.salary) },
                  { label: "Posted Date",  value: fmtDate(job.publishedAt || job.createdAt) },
                  { label: "Deadline",     value: fmtDate(job.applicationDeadline) },
                  { label: "Department",   value: job.department || "N/A" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Description ── */}
            {job.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Job Description
                </p>
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </div>
            )}

            {/* ── Requirements + Responsibilities side by side ── */}
            {(job.requirements?.length > 0 || job.responsibility) && (
              <div className="grid grid-cols-2 gap-5">
                {job.requirements && job.requirements.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Requirements
                    </p>
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <ul className="space-y-2">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {job.responsibility && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Responsibilities
                    </p>
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <ul className="space-y-2">
                        {(Array.isArray(job.responsibility)
                          ? job.responsibility
                          : typeof job.responsibility === "string"
                          ? job.responsibility.split("\n").filter(Boolean)
                          : []
                        ).map((r, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="h-4" />
          </div>
        )}
      </main>
    </div>
  );
}
