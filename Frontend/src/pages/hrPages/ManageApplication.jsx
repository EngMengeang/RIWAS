import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import { getAllJobs } from "../../server/jobpostingAPI";
import { updateApplicationStatus, getApplicationsByJob } from "../../server/jobapplicationAPI";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

const STATUS_ORDER  = ["applied", "review", "interview", "offer", "hired"];
const STATUS_LABELS = { applied: "Applied", review: "Review", interview: "Interview", offer: "Offer", hired: "Hired", rejected: "Rejected" };
const STATUS_STYLE  = { applied: "bg-gray-100 text-gray-600", review: "bg-blue-100 text-blue-600", interview: "bg-purple-100 text-purple-600", offer: "bg-yellow-100 text-yellow-600", hired: "bg-green-100 text-green-600", rejected: "bg-red-100 text-red-600" };
const getNextStatus = (current) => { const idx = STATUS_ORDER.indexOf(current?.toLowerCase()); return idx >= 0 && idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null; };

// ── Profile Card Modal ────────────────────────────────────────────────────────
const ProfileCard = ({ app, onClose }) => {
  const u       = app.candidate?.profile?.user;
  const profile = app.candidate?.profile;
  const name    = u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Unknown";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative" style={{ fontFamily: "'Roboto', sans-serif" }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
        >
          ✕
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 overflow-hidden flex items-center justify-center mb-3 ring-4 ring-green-50">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-green-600">{initials}</span>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-800">{name}</h3>
          <p className="text-sm text-slate-400">{u?.email || "—"}</p>
        </div>
        <div className="border-t border-gray-100 mb-5" />
        <div className="space-y-3">
          <Row label="Position Applied" value={app.job?.title || "—"} />
          <Row label="Date Applied"     value={app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "—"} />
          <Row label="Status"           value={
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_STYLE[app.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[app.status?.toLowerCase()] || app.status}
            </span>
          } />
          {profile?.phone    && <Row label="Phone"    value={profile.phone} />}
          {profile?.location && <Row label="Location" value={profile.location} />}
          {profile?.bio && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Bio</p>
              <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function ManageApplication() {
  const [filter, setFilter]             = useState("All");
  const [searchQuery, setSearchQuery]   = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);
  const [selectedApp, setSelectedApp]   = useState(null);

  const loadApplications = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const jobsRes = await getAllJobs({ limit: 100 });
      const jobs    = jobsRes.data?.data || jobsRes.data || [];
      const results = await Promise.all(
        jobs.map(async (job) => {
          try {
            const res = await getApplicationsByJob(job.id, { limit: 100 });
            return (res.data || []).map((app) => ({ ...app, job: app.job || job }));
          } catch { return []; }
        })
      );
      setApplications(results.flat());
    } catch {
      setError("Failed to load applications.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, []);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const setLocalStatus = (id, status) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const handleNextStep = async (app) => {
    const next = getNextStatus(app.status);
    if (!next) return;
    const previous = app.status;
    setError(null);
    setLocalStatus(app.id, next);
    try {
      await updateApplicationStatus(app.id, { status: next });
      flash(`Moved to "${STATUS_LABELS[next]}"`);
    } catch (err) {
      setLocalStatus(app.id, previous);
      setError(err?.response?.data?.error || err?.response?.data?.message || "Failed to update status.");
      return;
    }

    loadApplications({ silent: true }).catch(() => {});
  };

  const handleReject = async (app) => {
    const name = app.candidate?.profile?.user?.firstName || "this candidate";
    if (!window.confirm(`Reject ${name}?`)) return;
    const previous = app.status;
    setError(null);
    setLocalStatus(app.id, "rejected");
    try {
      await updateApplicationStatus(app.id, { status: "rejected" });
      flash("Application rejected.");
    } catch (err) {
      setLocalStatus(app.id, previous);
      setError(err?.response?.data?.error || err?.response?.data?.message || "Failed to reject.");
      return;
    }

    loadApplications({ silent: true }).catch(() => {});
  };

  const filteredApps = applications.filter((app) => {
    const u        = app.candidate?.profile?.user;
    const name     = `${u?.firstName || ""} ${u?.lastName || ""}`.toLowerCase();
    const position = app.job?.title?.toLowerCase() || "";
    const status   = app.status?.toLowerCase() || "";
    const matchesTab    = filter === "All" || status === filter.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || position.includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    All: applications.length,
    ...Object.fromEntries(Object.keys(STATUS_LABELS).map((k) => [k, applications.filter((a) => a.status?.toLowerCase() === k).length])),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <SideBar />

      {/* Profile Card Modal */}
      {selectedApp && <ProfileCard app={selectedApp} onClose={() => setSelectedApp(null)} />}

      <main className="flex-1 ml-[227px] p-8">

        {/* ── Header — matches JobList / ViewJobs style ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Manage Applications</h1>
          </div>
          <div className="h-0.5 w-full bg-green-500 rounded" />
        </div>

        {/* Alerts */}
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{success}</div>}
        {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search candidate by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-400 focus:bg-white transition-colors placeholder-gray-400"
            />
            <svg className="w-4 h-4 absolute left-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Filter:</label>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-green-400 outline-none cursor-pointer min-w-[160px]"
              >
                <option value="All">All ({stats.All})</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label} ({stats[key] || 0})</option>
                ))}
              </select>
              <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading applications...</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["No", "Profile", "Name", "Position", "Date Applied", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest ${h === "Actions" || h === "Profile" ? "text-center" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApps.map((app, index) => {
                  const u        = app.candidate?.profile?.user;
                  const profile  = app.candidate?.profile;
                  const name     = u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Unknown";
                  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  const position    = app.job?.title || "—";
                  const dateApplied = app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "—";
                  const status      = app.status?.toLowerCase() || "applied";
                  const nextStatus  = getNextStatus(status);

                  return (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* No */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-300">{index + 1}</td>

                      {/* Avatar */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="mx-auto w-9 h-9 rounded-full bg-green-100 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-green-400 transition-all"
                          title="View profile"
                        >
                          {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-green-600">{initials}</span>
                          )}
                        </button>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="font-semibold text-gray-800 text-sm hover:text-green-600 transition-colors text-left"
                        >
                          {name}
                        </button>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium not-italic">
                          {position}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-400">{dateApplied}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-widest ${STATUS_STYLE[status] || "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[status] || status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {nextStatus && status !== "rejected" && (
                            <button
                              onClick={() => handleNextStep(app)}
                              className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-500 hover:text-white transition-all"
                            >
                              Next
                            </button>
                          )}
                          {status !== "rejected" && status !== "hired" && (
                            <button
                              onClick={() => handleReject(app)}
                              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                            >
                              Reject
                            </button>
                          )}
                          {status === "hired" && (
                            <span className="text-xs font-semibold text-green-500">Hired</span>
                          )}
                          {status === "rejected" && (
                            <span className="text-xs font-semibold text-red-400">Rejected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filteredApps.length === 0 && (
            <div className="py-20 text-center bg-white">
              <svg className="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/>
              </svg>
              <p className="text-gray-400 text-sm font-medium">No candidates match your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}