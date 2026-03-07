import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../server/jobsAPI";
import { getMyResumes } from "../../server/userResumeAPI";
import { submitApplicationWithResumeId } from "../../server/jobapplicationAPI";

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedCV, setSelectedCV] = useState("");
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [jobError, setJobError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await getJobById(jobId);
        setJob(res.data || null);
      } catch (err) {
        setJobError(err?.response?.data?.error || "Failed to load job.");
      } finally {
        setLoadingJob(false);
      }
    };
    const fetchResumes = async () => {
      try {
        const data = await getMyResumes();
        console.log("Fetched resumes:", data); // Debug log
        setResumes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchJob();
    fetchResumes();
  }, [jobId]);

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!selectedCV) {
      setErrorMsg("Please select a saved resume.");
      return;
    }
    
    // Verify the resume still exists
    const resumeExists = resumes.find(r => r.id === selectedCV);
    if (!resumeExists) {
      setErrorMsg("Selected resume not found. Please refresh and try again.");
      return;
    }
    
    setSubmitting(true);
    try {
      console.log("Submitting application with resume ID:", selectedCV);
      await submitApplicationWithResumeId(job.id, selectedCV);
      navigate("/application");
    } catch (err) {
      console.error("Application submission error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to submit application.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // helpers
  const fmt = (v) => {
    try {
      return v ? new Date(v).toLocaleDateString() : "—";
    } catch {
      return "—";
    }
  };
  const salary = (s) => {
    if (!s) return "—";
    if (typeof s === "string") return s;
    const range = [s.min, s.max].filter(Boolean).join(" - ");
    return range ? `${range}${s.currency ? " " + s.currency : ""}` : "—";
  };
  const toList = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v
            .split(/\r?\n|,/)
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

  if (loadingJob)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading job…</p>
      </div>
    );

  if (jobError || !job)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {jobError || "Job Not Found"}
          </h2>
          <button
            onClick={() => navigate("/view-jobs")}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );

  const reqList = toList(job.requirements);
  const respList = toList(job.responsibility || job.responsibilities);

  // small reusable field box
  const InfoBox = ({ label, value }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white">
        {value || "—"}
      </div>
    </div>
  );

  return (
    <div
      className="p-8 bg-gray-50 min-h-screen"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-7xl mx-auto">
        {/* PAGE TITLE + green underline */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Apply for {job.title || "Job"}
          </h1>
          <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="flex gap-6 items-start">
          {/* LEFT — Job details */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-8">
            {/* Job title + department */}
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {job.title}
            </h2>
            <p className="text-sm text-gray-600 mb-7">
              Department: {job.department || "—"}
            </p>

            {/* Job Type + Location */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <InfoBox label="Job Type" value={job.jobType} />
              <InfoBox label="Location" value={job.location} />
            </div>

            {/* Salary Range — full width */}
            <div className="mb-5">
              <InfoBox label="Salary Range" value={salary(job.salary)} />
            </div>

            {/* Deadline + Posted Date */}
            <div className="grid grid-cols-2 gap-5 mb-7">
              <InfoBox
                label="Application Deadline"
                value={fmt(job.applicationDeadline)}
              />
              <InfoBox
                label="Posted Date"
                value={fmt(job.publishedAt || job.createdAt)}
              />
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Job Description
              </label>
              <div className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed bg-white min-h-[80px]">
                {job.description || "—"}
              </div>
            </div>

            {/* Requirements */}
            {reqList.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Requirements
                </label>
                <div className="px-4 py-3 border border-gray-200 rounded-lg bg-white">
                  <ul className="space-y-1.5">
                    {reqList.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-gray-400 mt-0.5">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {respList.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Responsibilities
                </label>
                <div className="px-4 py-3 border border-gray-200 rounded-lg bg-white">
                  <ul className="space-y-1.5">
                    {respList.map((resp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-gray-400 mt-0.5">•</span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Select Resume */}
          <div className="w-80 shrink-0 bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
              Select Your Resume
            </h3>

            {/* Saved resumes dropdown */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Choose a saved resume
              </label>
              <div className="relative">
                <select
                  value={selectedCV}
                  onChange={(e) => {
                    setSelectedCV(e.target.value);
                    setErrorMsg("");
                  }}
                  disabled={loadingResumes || resumes.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 appearance-none outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingResumes
                      ? "Loading resumes..."
                      : resumes.length === 0
                        ? "No resumes available"
                        : "Select a resume"}
                  </option>
                  {resumes.map((r) => {
                    const uploadDate = r.uploaded_at || r.uploadedAt || r.createdAt;
                    const displayName = r.ai_analysis?.personalInformation?.fullName || 
                                       r.ai_analysis?.personalInformation?.title ||
                                       null;
                    
                    return (
                      <option key={r.id} value={r.id}>
                        {displayName 
                          ? `${displayName} - ${uploadDate ? new Date(uploadDate).toLocaleDateString() : 'Unknown date'}`
                          : `Resume - ${uploadDate ? new Date(uploadDate).toLocaleDateString() : 'Unknown date'}`}
                      </option>
                    );
                  })}
                </select>
              </div>
              {!loadingResumes && resumes.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 mb-2 font-medium">
                    ⚠️ No saved resumes found.
                  </p>
                  <button
                    onClick={() => navigate("/upload-cv")}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    → Go to Upload CV page
                  </button>
                </div>
              )}
              {!loadingResumes && resumes.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {resumes.length} resume{resumes.length !== 1 ? 's' : ''} available
                </p>
              )}
            </div>

            {/* Selected Resume Preview */}
            {selectedCV && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-xs font-semibold text-green-800 mb-2">
                  Selected Resume:
                </h4>
                {(() => {
                  const selected = resumes.find(r => r.id === selectedCV);
                  if (!selected) return null;
                  
                  const aiData = selected.ai_analysis?.personalInformation;
                  return (
                    <div className="text-xs text-green-700 space-y-1">
                      {aiData?.fullName && (
                        <p><span className="font-medium">Name:</span> {aiData.fullName}</p>
                      )}
                      {aiData?.title && (
                        <p><span className="font-medium">Title:</span> {aiData.title}</p>
                      )}
                      {aiData?.email && (
                        <p><span className="font-medium">Email:</span> {aiData.email}</p>
                      )}
                      <p className="text-gray-500 mt-2">
                        Uploaded: {new Date(selected.uploaded_at || selected.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {errorMsg}
              </div>
            )}

            {/* Back + Apply */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-60"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedCV}
                className="flex-1 py-2.5 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
