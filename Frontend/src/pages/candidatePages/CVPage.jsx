import React, { useState, useEffect } from "react";
import { getMyResume, updateResume } from "../../server/userResumeAPI";

const toArray = (v) => (Array.isArray(v) ? v : v && typeof v === "string" && v.trim() ? [v] : []);

const parseAIAnalysis = (ai_analysis) => {
  if (!ai_analysis) return null;
  let c = ai_analysis;

  // Unwrap double-nested { ai_analysis: { ... } } updated
  if (typeof c === "object" && c !== null && c.ai_analysis && !c.personalInformation) {
    c = c.ai_analysis;
  }

  if (typeof c === "string") {
    try {
      c = JSON.parse(
        c.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim()
      );
    } catch { return null; }
  }

  if (typeof c === "object" && c !== null && !c.personalInformation && typeof c.raw === "string") {
    try {
      const fromRaw = JSON.parse(
        c.raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim()
      );
      if (typeof fromRaw === "object" && fromRaw !== null) c = fromRaw;
    } catch { /* keep c as is */ }
  }

  return typeof c === "object" && c !== null ? c : null;
};

const transformAIToForm = (p) => {
  if (!p) return null;
  return {
    personalInformation: {
      fullName:    p.personalInformation?.fullName    || "",
      title:       p.personalInformation?.title       || "",
      email:       p.personalInformation?.email       || "",
      phone:       p.personalInformation?.phone       || "",
      dateOfBirth: p.personalInformation?.dateOfBirth || "",
      address:     p.personalInformation?.address     || "",
    },
    summary: p.professionalSummary || "",
    education:      toArray(p.education).map(e  => ({ degree: e?.degree || "", school: e?.school || "", year: e?.year || "" })),
    experience:     toArray(p.experience).map(e => ({ position: e?.position || "", company: e?.company || "", startDate: e?.startDate || "", endDate: e?.endDate || "", description: e?.description || "" })),
    projects:       toArray(p.projects).map(pr => typeof pr === "string" ? { name: pr, description: "" } : { name: pr?.name || "", description: pr?.description || "" }),
    skills: {
      programming: toArray(p.skills?.programming).join(", "),
      frameworks:  toArray(p.skills?.frameworks).join(", "),
      tools:       toArray(p.skills?.tools).join(", "),
      softSkills:  toArray(p.skills?.softSkills).join(", "),
    },
    certifications:  toArray(p.certifications).map(c  => typeof c === "string" ? { name: c } : { name: c?.name || "" }),
    extracurricular: toArray(p.extracurricular).map(e  => typeof e === "string" ? { role: e, organization: "", year: "", description: "" } : { role: e?.role || "", organization: e?.organization || "", year: e?.year || "", description: e?.description || "" }),
    languages:       toArray(p.languages).map(l       => typeof l === "string" ? { name: l, level: "" } : { name: l?.name || l?.language || "", level: l?.level || "" }),
    achievements:    toArray(p.achievements).map(a    => typeof a === "string" ? { name: a } : { name: a?.name || "" }),
  };
};

const Lbl = ({ children }) => (
  <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>
);

const Field = ({ label, value, editing, onChange, textarea, rows = 3, fullWidth }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    {label && <Lbl>{label}</Lbl>}
    {textarea ? (
      editing ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 text-sm border border-green-400 rounded-lg outline-none resize-y leading-relaxed font-[Roboto,sans-serif]"
        />
      ) : (
        <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 leading-relaxed whitespace-pre-wrap break-words min-h-[42px]">
          {value || <span className="text-gray-400">—</span>}
        </div>
      )
    ) : (
      <input
        type="text"
        disabled={!editing}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-sm rounded-lg outline-none border font-[Roboto,sans-serif]
          ${editing
            ? "border-green-400 bg-white text-gray-900"
            : "border-gray-200 bg-white text-gray-800 cursor-default"
          }`}
      />
    )}
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm mb-5 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-sm font-bold text-green-500">{title}</h2>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const SectionWithAdd = ({ title, btnLabel, onAdd, children }) => (
  <div className="bg-white rounded-xl shadow-sm mb-5 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <h2 className="text-sm font-bold text-green-500">{title}</h2>
      <button
        onClick={onAdd}
        className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
      >
        {btnLabel}
      </button>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const HR = () => <div className="border-t border-dashed border-gray-200 my-5" />;
const Empty = ({ text }) => <p className="text-gray-400 italic text-xs m-0">{text}</p>;

const RemoveBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-2.5 py-1 text-xs font-semibold text-red-500 border border-red-300 bg-red-50 hover:bg-red-100 rounded-md transition-colors shrink-0"
  >
    Remove
  </button>
);

const CVPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeId,  setResumeId]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  const [formData, setFormData] = useState({
    personalInformation: { fullName: "", title: "", email: "", phone: "", dateOfBirth: "", address: "" },
    summary: "",
    education: [], experience: [], projects: [],
    skills: { programming: "", frameworks: "", tools: "", softSkills: "" },
    certifications: [], extracurricular: [], languages: [], achievements: [],
  });

  const fetchResume = async () => {
    setLoading(true);
    try {
      const res     = await getMyResume();
      const body    = res?.data;
      const rawData = body?.data ?? body;
      const data    = Array.isArray(rawData) ? rawData[0] : rawData;
      if (!data) return;
      setResumeId(data.id);
      const mapped = transformAIToForm(parseAIAnalysis(data.ai_analysis));
      if (mapped) setFormData(mapped);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResume(); }, []);

  const setPI      = (k, v) => setFormData(p => ({ ...p, personalInformation: { ...p.personalInformation, [k]: v } }));
  const setSkill   = (k, v) => setFormData(p => ({ ...p, skills: { ...p.skills, [k]: v } }));
  const setArr     = (sec, i, k, v) => setFormData(p => { const a = [...p[sec]]; a[i] = { ...a[i], [k]: v }; return { ...p, [sec]: a }; });
  const addItem    = (sec, blank) => setFormData(p => ({ ...p, [sec]: [...p[sec], blank] }));
  const removeItem = (sec, i)     => setFormData(p => ({ ...p, [sec]: p[sec].filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!resumeId) return;
    const split = (s) => s ? s.split(",").map(x => x.trim()).filter(Boolean) : [];
    try {
      await updateResume(resumeId, {
        ai_analysis: {
          personalInformation: { ...formData.personalInformation },
          professionalSummary: formData.summary,
          education:           formData.education,
          experience:          formData.experience,
          projects:            formData.projects,
          skills: {
            programming: split(formData.skills.programming),
            frameworks:  split(formData.skills.frameworks),
            tools:       split(formData.skills.tools),
            softSkills:  split(formData.skills.softSkills),
          },
          certifications:  formData.certifications.map(c => c.name),
          extracurricular: formData.extracurricular,
          languages:       formData.languages,
          achievements:    formData.achievements.map(a => a.name),
        },
      });
      setIsEditing(false);
      await fetchResume();
      alert("Resume updated successfully!");
    } catch { alert("Failed to save."); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-gray-400 text-sm">Loading resume…</p>
    </div>
  );

  const pi = formData.personalInformation;

  return (
    <div className="p-8 bg-gray-100 min-h-screen" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      <div className="max-w-[1200px] mx-auto">

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">My Resume / CV</h1>
            <div className="flex gap-2.5">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                >
                  Edit Resume
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
        </div>

        <Card title="Personal Information">
          <div className="grid grid-cols-2 gap-x-7 gap-y-4">
            <Field label="Full name"     value={pi.fullName}    editing={isEditing} onChange={v => setPI("fullName", v)} />
            <Field label="Professional"  value={pi.title}       editing={isEditing} onChange={v => setPI("title", v)} />
            <Field label="Email"         value={pi.email}       editing={isEditing} onChange={v => setPI("email", v)} />
            <Field label="Phone Number"  value={pi.phone}       editing={isEditing} onChange={v => setPI("phone", v)} />
            <Field label="Date of Birth" value={pi.dateOfBirth} editing={isEditing} onChange={v => setPI("dateOfBirth", v)} />
            <Field label="Address"       value={pi.address}     editing={isEditing} onChange={v => setPI("address", v)} />
          </div>
        </Card>

        <Card title="Professional Summary">
          <Field value={formData.summary} editing={isEditing} textarea rows={4}
            onChange={v => setFormData(p => ({ ...p, summary: v }))} />
        </Card>

        <SectionWithAdd title="Education" btnLabel="+ Add Education" onAdd={() => addItem("education", { degree: "", school: "", year: "" })}>
          {formData.education.length === 0 && <Empty text="No education added yet." />}
          {formData.education.map((e, i) => (
            <div key={i}>
              {i > 0 && <HR />}
              <div className="flex justify-end mb-2">
                <RemoveBtn onClick={() => removeItem("education", i)} />
              </div>
              <div className="grid gap-x-5 mb-3" style={{ gridTemplateColumns: "1fr 160px" }}>
                <Field label="Degree" value={e.degree} editing={isEditing} onChange={v => setArr("education", i, "degree", v)} />
                <Field label="Year"   value={e.year}   editing={isEditing} onChange={v => setArr("education", i, "year", v)} />
              </div>
              <Field label="School / Institution" value={e.school} editing={isEditing} onChange={v => setArr("education", i, "school", v)} />
            </div>
          ))}
          {formData.achievements.length > 0 && (
            <div className="mt-5">
              <Lbl>Achievements</Lbl>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col gap-2.5">
                {formData.achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-green-500 font-black text-lg shrink-0">•</span>
                    <input
                      type="text" disabled={!isEditing} value={a.name}
                      onChange={e => setArr("achievements", i, "name", e.target.value)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg outline-none border
                        ${isEditing ? "border-green-400 bg-white" : "border-green-200 bg-white"} text-gray-900`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionWithAdd>

        <SectionWithAdd title="Experience" btnLabel="+ Add Experience" onAdd={() => addItem("experience", { position: "", company: "", startDate: "", endDate: "", description: "" })}>
          {formData.experience.length === 0 && <Empty text="No experience added yet." />}
          {formData.experience.map((e, i) => (
            <div key={i}>
              {i > 0 && <HR />}
              <div className="flex justify-end mb-2">
                <RemoveBtn onClick={() => removeItem("experience", i)} />
              </div>
              <div className="grid grid-cols-2 gap-x-7 gap-y-4">
                <Field label="Position"   value={e.position}    editing={isEditing} onChange={v => setArr("experience", i, "position", v)} />
                <Field label="Company"    value={e.company}     editing={isEditing} onChange={v => setArr("experience", i, "company", v)} />
                <Field label="Start Date" value={e.startDate}   editing={isEditing} onChange={v => setArr("experience", i, "startDate", v)} />
                <Field label="End Date"   value={e.endDate}     editing={isEditing} onChange={v => setArr("experience", i, "endDate", v)} />
                <Field label="Description" value={e.description} editing={isEditing} textarea rows={3} onChange={v => setArr("experience", i, "description", v)} fullWidth />
              </div>
            </div>
          ))}
        </SectionWithAdd>

        <SectionWithAdd title="Projects" btnLabel="+ Add Project" onAdd={() => addItem("projects", { name: "", description: "" })}>
          {formData.projects.length === 0 && <Empty text="No projects added yet." />}
          {formData.projects.map((p, i) => (
            <div key={i}>
              {i > 0 && <HR />}
              <div className="flex justify-end mb-2">
                <RemoveBtn onClick={() => removeItem("projects", i)} />
              </div>
              <div className="flex flex-col gap-3.5">
                <Field label="Project Name" value={p.name}        editing={isEditing} onChange={v => setArr("projects", i, "name", v)} />
                <Field label="Description"  value={p.description} editing={isEditing} textarea rows={2} onChange={v => setArr("projects", i, "description", v)} />
              </div>
            </div>
          ))}
        </SectionWithAdd>

        <Card title="Skills">
          <div className="grid grid-cols-2 gap-x-7 gap-y-4">
            <Field label="Programming" value={formData.skills.programming} editing={isEditing} onChange={v => setSkill("programming", v)} />
            <Field label="Frameworks"  value={formData.skills.frameworks}  editing={isEditing} onChange={v => setSkill("frameworks", v)} />
            <Field label="Tools"       value={formData.skills.tools}       editing={isEditing} onChange={v => setSkill("tools", v)} />
            <Field label="Soft Skills" value={formData.skills.softSkills}  editing={isEditing} onChange={v => setSkill("softSkills", v)} />
          </div>
        </Card>

        <SectionWithAdd title="CERTIFICATIONS" btnLabel="+ Add CERTIFICATIONS" onAdd={() => addItem("certifications", { name: "" })}>
          {formData.certifications.length === 0 && <Empty text="No certifications added yet." />}
          <div className="flex flex-col gap-2.5">
            {formData.certifications.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <input
                  type="text" disabled={!isEditing} value={c.name}
                  onChange={e => setArr("certifications", i, "name", e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg outline-none border
                    ${isEditing ? "bg-white border-green-400" : "bg-gray-50 border-gray-200"} text-gray-900`}
                />
                <RemoveBtn onClick={() => removeItem("certifications", i)} />
              </div>
            ))}
          </div>
        </SectionWithAdd>

        <SectionWithAdd title="Extracurricular Activities" btnLabel="+ Add Activity" onAdd={() => addItem("extracurricular", { role: "", organization: "", year: "", description: "" })}>
          {formData.extracurricular.length === 0 && <Empty text="No extracurricular activities yet." />}
          {formData.extracurricular.map((e, i) => (
            <div key={i}>
              {i > 0 && <HR />}
              <div className="flex justify-end mb-2">
                <RemoveBtn onClick={() => removeItem("extracurricular", i)} />
              </div>
              <div className="grid grid-cols-2 gap-x-7 gap-y-4">
                <Field label="Role"         value={e.role}         editing={isEditing} onChange={v => setArr("extracurricular", i, "role", v)} />
                <Field label="Organization" value={e.organization} editing={isEditing} onChange={v => setArr("extracurricular", i, "organization", v)} />
                <Field label="Year"         value={e.year}         editing={isEditing} onChange={v => setArr("extracurricular", i, "year", v)} />
                <div />
                <Field label="Description" value={e.description} editing={isEditing} textarea rows={2} onChange={v => setArr("extracurricular", i, "description", v)} fullWidth />
              </div>
            </div>
          ))}
        </SectionWithAdd>

        <SectionWithAdd title="Languages" btnLabel="+ Add Language" onAdd={() => addItem("languages", { name: "", level: "" })}>
          {formData.languages.length === 0 && <Empty text="No languages added yet." />}
          <div className="flex flex-col gap-4">
            {formData.languages.map((l, i) => (
              <div key={i} className="grid grid-cols-2 gap-x-7 items-end">
                <div>
                  <Lbl>Language</Lbl>
                  <input
                    type="text" disabled={!isEditing} value={l.name}
                    onChange={e => setArr("languages", i, "name", e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg outline-none border
                      ${isEditing ? "bg-white border-green-400" : "bg-gray-50 border-gray-200"} text-gray-900`}
                  />
                </div>
                <div className="flex items-end gap-2.5">
                  <div className="flex-1">
                    <Lbl>Level</Lbl>
                    <div className="relative">
                      <select
                        disabled={!isEditing}
                        value={l.level}
                        onChange={e => setArr("languages", i, "level", e.target.value)}
                        className={`w-full px-3 py-2 pr-8 text-sm rounded-lg outline-none border appearance-none
                          ${isEditing ? "bg-white border-green-400 cursor-pointer" : "bg-gray-50 border-gray-200 cursor-default"}
                          ${l.level ? "text-gray-900" : "text-gray-400"}`}
                      >
                        <option value="">Select level</option>
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Beginner">Beginner</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</span>
                    </div>
                  </div>
                  <RemoveBtn onClick={() => removeItem("languages", i)} />
                </div>
              </div>
            ))}
          </div>
        </SectionWithAdd>

      </div>
    </div>
  );
};

export default CVPage;