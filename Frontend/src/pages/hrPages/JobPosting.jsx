import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";
import { getApplicationsByJob } from "../../server/jobapplicationAPI";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  // map of jobId → applicant count
  const [counts, setCounts]   = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const res   = await fetch("http://localhost:5000/api/jobpostings/", {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) throw new Error("Failed to fetch job postings");
        const data = await res.json();
        const list = data.data || [];
        setJobs(list);
        setError(null);

        // Fetch real applicant counts for each job in parallel
        // Use limit:100 (same as JobDetailView) so counts match
        const countEntries = await Promise.all(
          list.map(async (job) => {
            try {
              const appRes = await getApplicationsByJob(job.id, { limit: 100 });
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
              return [job.id, count];
            } catch {
              return [job.id, 0];
            }
          })
        );
        setCounts(Object.fromEntries(countEntries));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`http://localhost:5000/api/jobpostings/${id}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setCounts((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch {
      alert("Failed to delete job.");
    }
  };

  const filtered = jobs.filter((job) => {
    const q = search.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      job.department?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <SideBar />

      <main className="flex-1 ml-[227px] p-8 bg-gray-50 min-h-screen">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
            <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
          </div>
          <button
            onClick={() => navigate("/post-job")}
            className="ml-6 mt-1 px-5 py-2 bg-green-500 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition-colors shadow-sm flex-shrink-0"
          >
            + Post New
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-green-400 placeholder-gray-400"
          />
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-500 text-sm">Loading jobs...</p>}

        {/* Error */}
        {!loading && error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">No job postings found.</p>
          </div>
        )}

        {/* ── Card Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
            {filtered.map((job) => {
              const applicantCount = counts[job.id] ?? "—";
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer border border-gray-100 group"
                  onClick={() => navigate(`/job-detail/${job.id}`)}
                >
                  {/* Cover image */}
                  <div className="relative h-44 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    <img
                      src={job.coverImage || "/postImage.png"}
                      alt="Job illustration"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-white/60 backdrop-blur-sm text-xs text-gray-500 font-medium">
                      {job.department || job.location || "General"}
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-green-600 transition-colors leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-0.5">
                      Applicants: <span className="font-semibold text-gray-800">{applicantCount}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Posted:{" "}
                      {job.publishedAt || job.createdAt
                        ? new Date(job.publishedAt || job.createdAt).toLocaleDateString()
                        : "—"}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/job-detail/${job.id}`)}
                        className="flex-1 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-full bg-white hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/edit-job/${job.id}`)}
                        className="flex-1 py-2 text-sm font-semibold bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, job.id, job.title)}
                        className="flex-1 py-2 text-sm font-semibold bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
