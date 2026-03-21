import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

const JOB_TYPE = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACT:  "contract",
  INTERN:    "intern",
  REMOTE:    "remote",
};

const JOB_STATUS = {
  DRAFT:     "draft",
  PUBLISHED: "published",
  CLOSED:    "closed",
};

const parseSalary = (salary) => {
  if (!salary) return { min: "", max: "" };
  if (typeof salary === "object") {
    return {
      min: salary.min != null ? String(salary.min) : "",
      max: salary.max != null ? String(salary.max) : "",
    };
  }
  // string like "$1000 - $2000"
  const nums = String(salary).replace(/[^0-9\s.-]/g, "").trim().split(/\s*-\s*/);
  return { min: nums[0] || "", max: nums[1] || "" };
};

export default function EditJob() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [form, setForm]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [loadError, setLoadError]     = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  /* ── Load existing job via raw fetch (avoids FormData issues) ── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const res   = await fetch(`http://localhost:5000/api/jobpostings/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) throw new Error("Failed to load job");
        const data  = await res.json();
        const job   = data.data || data;
        const sal   = parseSalary(job.salary);

        setForm({
          title:               job.title              || "",
          department:          job.department          || "",
          description:         job.description         || "",
          location:            job.location            || "",
          jobType:             job.jobType             || "",
          status:              job.status              || JOB_STATUS.PUBLISHED,
          requirements:        Array.isArray(job.requirements)
            ? job.requirements.join("\n")
            : job.requirements || "",
          responsibility:      Array.isArray(job.responsibility)
            ? job.responsibility.join("\n")
            : job.responsibility || "",
          minSalary:           sal.min,
          maxSalary:           sal.max,
          applicationDeadline: job.applicationDeadline
            ? new Date(job.applicationDeadline).toISOString().split("T")[0]
            : "",
        });
      } catch (err) {
        setLoadError(err.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = "Job title is required";
    if (!form.jobType)            errs.jobType     = "Job type is required";
    if (!form.location.trim())    errs.location    = "Location is required";
    if (!form.description.trim()) errs.description = "Description is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    // Build clean JSON payload
    const payload = {
      title:          form.title.trim(),
      department:     form.department.trim(),
      description:    form.description.trim(),
      location:       form.location.trim(),
      jobType:        form.jobType,
      status:         form.status,
      requirements:   form.requirements
        ? form.requirements.split("\n").map((r) => r.trim()).filter(Boolean)
        : [],
      responsibility: form.responsibility
        ? form.responsibility.split("\n").map((r) => r.trim()).filter(Boolean)
        : [],
      salary: {
        min:      Number(form.minSalary) || 0,
        max:      Number(form.maxSalary) || 0,
        currency: "USD",
      },
    };

    if (form.applicationDeadline) {
      payload.applicationDeadline = new Date(form.applicationDeadline).toISOString();
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      const res   = await fetch(`http://localhost:5000/api/jobpostings/${id}`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to update job");

      alert("Job updated successfully!");
      navigate(`/job-detail/${id}`);
    } catch (err) {
      alert(err.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = "block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5";
  const inputBase  = "w-full px-3 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:border-green-400 transition-colors placeholder-gray-300";
  const inputCls   = (field) => `${inputBase} ${fieldErrors[field] ? "border-red-300" : "border-gray-200"}`;

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <SideBar />

      <main className="flex-1 ml-[227px] p-8 bg-gray-50 min-h-screen">
        <div className="w-full">

          {/* Header */}
          <div className="mb-8">
            <button type="button" onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-1 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 py-20">
              <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading job data...</p>
            </div>
          )}

          {/* Load error */}
          {!loading && loadError && (
            <p className="text-sm text-red-500">{loadError}</p>
          )}

          {/* Form */}
          {!loading && !loadError && form && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Basic Information</p>
                <div className="grid grid-cols-3 gap-4">

                  <div className="col-span-3">
                    <label className={labelStyle}>Job Title <span className="text-red-400">*</span></label>
                    <input type="text" name="title" value={form.title} onChange={handleChange}
                      placeholder="e.g. Senior Frontend Developer" className={inputCls("title")} />
                    {fieldErrors.title && <p className="text-xs text-red-400 mt-1">{fieldErrors.title}</p>}
                  </div>

                  <div>
                    <label className={labelStyle}>Department</label>
                    <input type="text" name="department" value={form.department} onChange={handleChange}
                      placeholder="e.g. Engineering" className={inputCls("department")} />
                  </div>

                  <div>
                    <label className={labelStyle}>Job Type <span className="text-red-400">*</span></label>
                    <select name="jobType" value={form.jobType} onChange={handleChange} className={inputCls("jobType")}>
                      <option value="">Select type</option>
                      <option value={JOB_TYPE.FULL_TIME}>Full-time</option>
                      <option value={JOB_TYPE.PART_TIME}>Part-time</option>
                      <option value={JOB_TYPE.CONTRACT}>Contract</option>
                      <option value={JOB_TYPE.INTERN}>Internship</option>
                      <option value={JOB_TYPE.REMOTE}>Remote</option>
                    </select>
                    {fieldErrors.jobType && <p className="text-xs text-red-400 mt-1">{fieldErrors.jobType}</p>}
                  </div>

                  <div>
                    <label className={labelStyle}>Location <span className="text-red-400">*</span></label>
                    <input type="text" name="location" value={form.location} onChange={handleChange}
                      placeholder="e.g. Phnom Penh / Remote" className={inputCls("location")} />
                    {fieldErrors.location && <p className="text-xs text-red-400 mt-1">{fieldErrors.location}</p>}
                  </div>

                  <div>
                    <label className={labelStyle}>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className={inputCls("status")}>
                      <option value={JOB_STATUS.PUBLISHED}>Published</option>
                      <option value={JOB_STATUS.DRAFT}>Draft</option>
                      <option value={JOB_STATUS.CLOSED}>Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Min Salary (USD)</label>
                    <input type="number" name="minSalary" value={form.minSalary} onChange={handleChange}
                      placeholder="e.g. 800" min="0" className={inputCls("minSalary")} />
                  </div>

                  <div>
                    <label className={labelStyle}>Max Salary (USD)</label>
                    <input type="number" name="maxSalary" value={form.maxSalary} onChange={handleChange}
                      placeholder="e.g. 2000" min="0" className={inputCls("maxSalary")} />
                  </div>

                  <div>
                    <label className={labelStyle}>Application Deadline</label>
                    <input type="date" name="applicationDeadline" value={form.applicationDeadline}
                      onChange={handleChange} className={inputCls("applicationDeadline")} />
                  </div>
                </div>
              </div>

              {/* Description & Requirements */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Description & Requirements</p>

                {/* Description full width */}
                <div className="mb-4">
                  <label className={labelStyle}>Job Description <span className="text-red-400">*</span></label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                    placeholder="Describe the role..." className={inputCls("description")} />
                  {fieldErrors.description && <p className="text-xs text-red-400 mt-1">{fieldErrors.description}</p>}
                </div>

                {/* Requirements + Responsibilities side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Requirements</label>
                    <p className="text-[10px] text-gray-400 mb-1.5">One requirement per line</p>
                    <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={6}
                      placeholder={"Strong JavaScript skills\nExperience with React\nGit proficiency"}
                      className={inputCls("requirements")} />
                  </div>
                  <div>
                    <label className={labelStyle}>Responsibilities</label>
                    <p className="text-[10px] text-gray-400 mb-1.5">One item per line</p>
                    <textarea name="responsibility" value={form.responsibility} onChange={handleChange} rows={6}
                      placeholder={"Build and maintain responsive UI\nCollaborate with backend team"}
                      className={inputCls("responsibility")} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pb-10">
                <button type="button" onClick={() => navigate(-1)}
                  className="px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}