import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";
import { getAllApplicationsForRecruiter } from "../../server/jobapplicationAPI";
import {
  getActiveTemplate,
  createTemplate,
  activateTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../server/templateAPI";
import {
  getAttributesByTemplate,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  updateActiveAttributes,
} from "../../server/attributeAPI";
import {
  addMatrixScore,
  getMatrixScoresByApplication,
} from "../../server/matrixscoringAPI";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

/* ─── Dot colors ────────────────────────────────────────────────────────────── */
const DOT_COLORS = [
  "bg-blue-400","bg-green-400","bg-purple-400","bg-orange-400",
  "bg-pink-400","bg-teal-400","bg-indigo-400","bg-red-400",
];
const dot = (i) => DOT_COLORS[i % DOT_COLORS.length];

/* ─── Score constants ───────────────────────────────────────────────────────── */
const SCORE_LABELS = { 1:"Poor", 2:"Fair", 3:"Good", 4:"Very Good", 5:"Excellent" };
const SCORE_COLORS = {
  1:"bg-red-100 text-red-600 border-red-200",
  2:"bg-orange-100 text-orange-600 border-orange-200",
  3:"bg-yellow-100 text-yellow-600 border-yellow-200",
  4:"bg-blue-100 text-blue-600 border-blue-200",
  5:"bg-green-100 text-green-600 border-green-200",
};

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const toArr = (r) => {
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.data)) return r.data;
  if (Array.isArray(r.attributes)) return r.attributes;
  if (Array.isArray(r.scores)) return r.scores;
  return [];
};

const getName = (app) => {
  const u = app?.candidate?.profile?.user;
  return u ? `${u.firstName||""} ${u.lastName||""}`.trim() || u.email : "Unknown";
};
const initials = (n="") => n.split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();

/* ─── Small reusable components ─────────────────────────────────────────────── */
const ScoreBtn = ({ value, selected, onClick }) => (
  <button type="button" onClick={() => onClick(value)}
    className={`w-10 h-10 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center ${
      selected ? SCORE_COLORS[value]+" scale-105 shadow-sm" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600"
    }`} title={SCORE_LABELS[value]}>
    {value}
  </button>
);

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);
const DeleteIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
);

/* ─── Main ───────────────────────────────────────────────────────────────────── */
export default function MatrixPage() {
  const navigate = useNavigate();

  /* template */
  const [template,    setTemplate]    = useState(null);
  const [attributes,  setAttributes]  = useState([]);
  /* applications + scoring */
  const [applications, setApplications] = useState([]);
  const [selectedApp,  setSelectedApp]  = useState(null);
  const [scores,       setScores]       = useState({});
  const [savedScores,  setSavedScores]  = useState([]);
  const [stageName,    setStageName]    = useState("HR Interview");
  const [loadingScores, setLoadingScores] = useState(false);
  /* ui */
  const [view,         setView]         = useState("summary"); // summary | edit
  const [pageLoading,  setPageLoading]  = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");

  /* ── template form state ── */
  const [showTmplForm,   setShowTmplForm]   = useState(false);
  const [tmplName,       setTmplName]       = useState("");
  const [tmplDesc,       setTmplDesc]       = useState("");
  const [creatingTmpl,   setCreatingTmpl]   = useState(false);
  /* template edit inline */
  const [editingTmpl,    setEditingTmpl]    = useState(false);
  const [editTmplName,   setEditTmplName]   = useState("");
  const [editTmplDesc,   setEditTmplDesc]   = useState("");
  const [savingTmpl,     setSavingTmpl]     = useState(false);

  /* ── attribute form state ── */
  const [showAttrForm,  setShowAttrForm]  = useState(false);
  const [attrName,      setAttrName]      = useState("");
  const [attrWeight,    setAttrWeight]    = useState("1");
  const [addingAttr,    setAddingAttr]    = useState(false);
  /* attribute edit inline */
  const [editAttrId,    setEditAttrId]    = useState(null);
  const [editAttrName,  setEditAttrName]  = useState("");
  const [editAttrWeight,setEditAttrWeight]= useState("1");
  const [savingAttr,    setSavingAttr]    = useState(false);

  /* ── flash ── */
  const flash = (msg, isErr=false) => {
    if (isErr) { setError(msg); setTimeout(()=>setError(""),4000); }
    else { setSuccess(msg); setTimeout(()=>setSuccess(""),3000); }
  };

  /* ── load attributes ── */
  const loadAttributes = async (tmplId) => {
    if (!tmplId) return;
    try {
      const res = await getAttributesByTemplate(tmplId);
      setAttributes(toArr(res));
    } catch { setAttributes([]); }
  };

  /* ── initial load ── */
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        const [tmplRes, appsRes] = await Promise.allSettled([
          getActiveTemplate(),
          getAllApplicationsForRecruiter({ limit: 100 }),
        ]);
        let tmpl = tmplRes.status==="fulfilled" ? tmplRes.value : null;
        const rawApps = appsRes.status==="fulfilled" ? toArr(appsRes.value?.data ?? appsRes.value) : [];
        // deduplicate
        const seen = new Set();
        const apps = rawApps.filter(a => { if(seen.has(a.id)) return false; seen.add(a.id); return true; });

        if (!tmpl) {
          const cached = localStorage.getItem("lastMatrixTemplate");
          if (cached) try { tmpl = JSON.parse(cached); } catch {}
        }
        setTemplate(tmpl||null);
        setApplications(apps);
        if (tmpl?.id) await loadAttributes(tmpl.id);
      } catch { flash("Failed to load.", true); }
      finally { setPageLoading(false); }
    })();
  }, []);

  /* ────────────────────────────────────────────────────────────────────────────
     TEMPLATE CRUD
  ──────────────────────────────────────────────────────────────────────────── */

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!tmplName.trim()) return;
    setCreatingTmpl(true);
    try {
      const res     = await createTemplate({ name: tmplName.trim(), description: tmplDesc.trim() });
      const created = res?.data?.data || res?.data || res;
      const newId   = created?.id;
      if (!newId) { flash("Could not get template ID.", true); return; }
      try { await activateTemplate(newId); } catch (ae) {
        const msg = ae?.response?.data?.message || "";
        if (!msg.toLowerCase().includes("already active")) console.warn("activate:", ae?.response?.data);
      }
      setTmplName(""); setTmplDesc(""); setShowTmplForm(false);
      let fresh = await getActiveTemplate().catch(()=>null);
      if (!fresh) fresh = { ...created, is_active: true };
      setTemplate(fresh);
      localStorage.setItem("lastMatrixTemplate", JSON.stringify(fresh));
      if (fresh?.id) await loadAttributes(fresh.id);
      flash("Template created!");
    } catch (e) { flash(e?.response?.data?.error||"Failed to create template.", true); }
    finally { setCreatingTmpl(false); }
  };

  const handleUpdateTemplate = async () => {
    if (!editTmplName.trim()||!template?.id) return;
    setSavingTmpl(true);
    try {
      await updateTemplate(template.id, { name: editTmplName.trim(), description: editTmplDesc.trim() });
      const updated = { ...template, name: editTmplName.trim(), description: editTmplDesc.trim() };
      setTemplate(updated);
      localStorage.setItem("lastMatrixTemplate", JSON.stringify(updated));
      setEditingTmpl(false);
      flash("Template updated!");
    } catch (e) { flash(e?.response?.data?.error||"Failed to update template.", true); }
    finally { setSavingTmpl(false); }
  };

  const handleDeleteTemplate = async () => {
    if (!template?.id) return;
    if (!window.confirm(`Delete template "${template.name}"? This will also remove all its attributes.`)) return;
    try {
      await deleteTemplate(template.id);
      setTemplate(null);
      setAttributes([]);
      localStorage.removeItem("lastMatrixTemplate");
      setView("summary");
      flash("Template deleted.");
    } catch (e) { flash(e?.response?.data?.error||"Failed to delete template.", true); }
  };

  /* ────────────────────────────────────────────────────────────────────────────
     ATTRIBUTE CRUD
  ──────────────────────────────────────────────────────────────────────────── */

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    if (!attrName.trim()||!template?.id) return;
    setAddingAttr(true);
    try {
      await createAttribute({ template_id: template.id, name: attrName.trim(), weight: Number(attrWeight)||1 });
      setAttrName(""); setAttrWeight("1"); setShowAttrForm(false);
      await loadAttributes(template.id);
      flash("Attribute added!");
    } catch (e) { flash(e?.response?.data?.error||"Failed to add attribute.", true); }
    finally { setAddingAttr(false); }
  };

  const startEditAttr = (attr) => {
    setEditAttrId(attr.id);
    setEditAttrName(attr.name);
    setEditAttrWeight(String(attr.weight||1));
  };
  const cancelEditAttr = () => { setEditAttrId(null); setEditAttrName(""); setEditAttrWeight("1"); };

  const handleUpdateAttribute = async (attrId) => {
    if (!editAttrName.trim()) return;
    setSavingAttr(true);
    try {
      await updateAttribute(attrId, { name: editAttrName.trim(), weight: Number(editAttrWeight)||1 });
      setAttributes(prev => prev.map(a => a.id===attrId ? { ...a, name:editAttrName.trim(), weight:Number(editAttrWeight)||1 } : a));
      cancelEditAttr();
      flash("Attribute updated!");
    } catch (e) { flash(e?.response?.data?.error||"Failed to update attribute.", true); }
    finally { setSavingAttr(false); }
  };

  const handleDeleteAttribute = async (attrId, attrName) => {
    if (!window.confirm(`Delete attribute "${attrName}"?`)) return;
    try {
      await deleteAttribute(attrId);
      setAttributes(prev => prev.filter(a => a.id!==attrId));
      flash("Attribute deleted.");
    } catch (e) { flash(e?.response?.data?.error||"Failed to delete attribute.", true); }
  };

  const handleSaveActiveAttributes = async (activeIds) => {
    if (!template?.id) return;
    try {
      await updateActiveAttributes({ template_id: template.id, activeIds });
      await loadAttributes(template.id);
      flash("Template saved!");
      setView("summary");
    } catch (e) { flash(e?.response?.data?.error||"Failed to save.", true); }
  };

  /* ────────────────────────────────────────────────────────────────────────────
     SCORING
  ──────────────────────────────────────────────────────────────────────────── */

  const handleSelectApp = async (app) => {
    setSelectedApp(app);
    setScores({}); setSavedScores([]);
    setLoadingScores(true);
    try {
      let currentAttrs = attributes;
      if (template?.id && attributes.length===0) {
        const r = await getAttributesByTemplate(template.id).catch(()=>[]);
        currentAttrs = toArr(r);
        setAttributes(currentAttrs);
      }
      const res  = await getMatrixScoresByApplication(app.id);
      const list = toArr(res);
      setSavedScores(list);
      const pre = {};
      list.forEach(s => { pre[String(s.attribute_id)] = { score:s.score, note:s.interview_note||"" }; });
      setScores(pre);
    } catch (e) { console.error("load scores:", e); }
    finally { setLoadingScores(false); }
  };

  const setScore = (attrId, v) =>
    setScores(p => ({ ...p, [String(attrId)]: { ...p[String(attrId)], score:v } }));
  const setNote  = (attrId, v) =>
    setScores(p => ({ ...p, [String(attrId)]: { ...p[String(attrId)], note:v } }));

  const handleSaveScores = async () => {
    if (!selectedApp) { flash("Select a candidate first.", true); return; }
    const toSave = attributes.map(a=>({ attr:a, entry:scores[String(a.id)] })).filter(({entry})=>entry?.score);
    if (!toSave.length) { flash("Score at least one attribute.", true); return; }
    setSaving(true);
    try {
      for (const { attr, entry } of toSave) {
        await addMatrixScore({
          application_id: selectedApp.id,
          attribute_id:   attr.id,
          score:          Number(entry.score),
          interview_note: entry.note||"",
          stage_name:     stageName,
        });
      }
      flash("Scores saved!");
      const refreshed = await getMatrixScoresByApplication(selectedApp.id);
      setSavedScores(toArr(refreshed));
    } catch (e) { flash(e?.response?.data?.error||"Failed to save scores.", true); }
    finally { setSaving(false); }
  };

  /* computed */
  const totalScore = attributes.reduce((s,a)=>s+(scores[String(a.id)]?.score||0)*(a.weight||1),0);
  const maxScore   = attributes.reduce((s,a)=>s+5*(a.weight||1),0);
  const pct        = maxScore>0 ? Math.round(totalScore/maxScore*100) : 0;

  /* ──────────────────────────────────────────────────────────────────────────
     EDIT VIEW (Image 2 style)
  ──────────────────────────────────────────────────────────────────────────── */
  if (!pageLoading && template && view==="edit") return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily:"'Roboto',sans-serif" }}>
      <SideBar />
      <main className="flex-1 ml-[227px] p-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Scoring Matrix</h1>
            <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
          </div>
          <button
            onClick={() => navigate("/profile-page")}
            className="h-10 px-5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            Back
          </button>
        </div>

        {error   && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{success}</div>}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex max-w-3xl">

          {/* Left — attribute list */}
          <div className="w-72 flex-shrink-0 border-r border-gray-100 p-5 flex flex-col">
            <p className="text-sm font-bold text-gray-900 mb-5">{template.name}</p>

            <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
              {attributes.map((attr, i) => (
                <div key={attr.id}>
                  {editAttrId===attr.id ? (
                    /* Inline edit */
                    <div className="px-2 py-2 bg-green-50 rounded-lg border border-green-100 space-y-1.5">
                      <input value={editAttrName} onChange={e=>setEditAttrName(e.target.value)} autoFocus
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 bg-white"
                        placeholder="Attribute name" />
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="1" max="5" value={editAttrWeight}
                          onChange={e=>setEditAttrWeight(e.target.value)}
                          className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 bg-white" />
                        <button onClick={()=>handleUpdateAttribute(attr.id)} disabled={savingAttr}
                          className="flex-1 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                          {savingAttr ? "..." : "Save"}
                        </button>
                        <button onClick={cancelEditAttr}
                          className="px-2 py-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">✕</button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(i)}`} />
                      <span className="text-sm text-gray-700 font-medium flex-1 truncate">{attr.name}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">×{attr.weight||1}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={()=>startEditAttr(attr)}
                          className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                          <EditIcon />
                        </button>
                        <button onClick={()=>handleDeleteAttribute(attr.id, attr.name)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {attributes.length===0 && (
                <p className="text-xs text-gray-400 italic px-3">No attributes yet.</p>
              )}
            </div>

            {/* Add attribute */}
            {!showAttrForm ? (
              <button onClick={()=>setShowAttrForm(true)}
                className="mt-4 w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600">
                + Add
              </button>
            ) : (
              <form onSubmit={handleAddAttribute} className="mt-4 space-y-2">
                <input value={attrName} onChange={e=>setAttrName(e.target.value)} required
                  placeholder="Attribute name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 bg-gray-50" />
                <input type="number" min="1" max="5" value={attrWeight} onChange={e=>setAttrWeight(e.target.value)}
                  placeholder="Weight (1-5)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 bg-gray-50" />
                <div className="flex gap-2">
                  <button type="button" onClick={()=>setShowAttrForm(false)}
                    className="flex-1 py-2 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={addingAttr}
                    className="flex-1 py-2 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                    {addingAttr?"...":"Add"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right — checkbox panel */}
          <EditCheckboxPanel
            attributes={attributes}
            onSave={handleSaveActiveAttributes}
            onCancel={()=>setView("summary")}
          />
        </div>
      </main>
    </div>
  );

  /* ──────────────────────────────────────────────────────────────────────────
     SUMMARY / SCORING VIEW
  ──────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily:"'Roboto',sans-serif" }}>
      <SideBar />
      <main className="flex-1 ml-[227px] p-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Scoring Matrix</h1>
            <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
          </div>
          <button
            onClick={() => navigate("/profile-page")}
            className="h-10 px-5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            Back
          </button>
        </div>

        {error   && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{success}</div>}

        {pageLoading ? (
          <div className="flex items-center gap-3 py-20 justify-center">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="flex gap-8 items-start">

            {/* ── LEFT: Template summary card ── */}
            <div className="flex-shrink-0 w-80">

              {/* No template */}
              {!template && !showTmplForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                  <p className="text-sm text-gray-500 mb-4">No active scoring template.</p>
                  <button onClick={()=>setShowTmplForm(true)}
                    className="px-5 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600">
                    + Create Template
                  </button>
                </div>
              )}

              {/* Create template form */}
              {!template && showTmplForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-900">New Template</p>
                    <button onClick={()=>setShowTmplForm(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                  </div>
                  <form onSubmit={handleCreateTemplate} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Template Name *</label>
                      <input value={tmplName} onChange={e=>setTmplName(e.target.value)} required
                        placeholder="e.g. Interview Matrix Scoring"
                        className="w-full mt-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 bg-gray-50" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Description</label>
                      <input value={tmplDesc} onChange={e=>setTmplDesc(e.target.value)}
                        placeholder="Optional"
                        className="w-full mt-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 bg-gray-50" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={()=>setShowTmplForm(false)}
                        className="flex-1 py-2.5 text-sm border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50">Cancel</button>
                      <button type="submit" disabled={creatingTmpl}
                        className="flex-1 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50">
                        {creatingTmpl?"Creating...":"Create"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Template summary card */}
              {template && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className="px-6 pt-6 pb-4">
                    {editingTmpl ? (
                      <div className="space-y-2">
                        <input value={editTmplName} onChange={e=>setEditTmplName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 bg-gray-50 font-semibold"
                          placeholder="Template name" autoFocus />
                        <input value={editTmplDesc} onChange={e=>setEditTmplDesc(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 bg-gray-50"
                          placeholder="Description (optional)" />
                        <div className="flex gap-2">
                          <button onClick={()=>setEditingTmpl(false)}
                            className="flex-1 py-2 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">Cancel</button>
                          <button onClick={handleUpdateTemplate} disabled={savingTmpl}
                            className="flex-1 py-2 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                            {savingTmpl?"Saving...":"Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-gray-900">{template.name}</h2>
                          {template.description && <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>}
                        </div>
                        {/* Template actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={()=>{ setEditTmplName(template.name); setEditTmplDesc(template.description||""); setEditingTmpl(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Edit template">
                            <EditIcon />
                          </button>
                          <button onClick={handleDeleteTemplate}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete template">
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* In Use row */}
                  <div className="mx-5 mb-4 px-4 py-3 border border-gray-100 rounded-xl flex items-center justify-between bg-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Current Template</p>
                      <p className="text-xs text-gray-400 mt-0.5">{attributes.length} Evaluation criteria</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full border border-green-200">
                      In Use
                    </span>
                  </div>

                  {/* Attribute list */}
                  <div className="mx-5 mb-5 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {attributes.map((attr, i) => (
                      <div key={attr.id} className="group flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(i)}`} />
                          <span className="text-sm text-gray-600">{attr.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">1-5 scale</span>
                      </div>
                    ))}
                    {attributes.length===0 && (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">No criteria added yet.</div>
                    )}
                  </div>

                  {/* Modify button */}
                  <div className="px-5 pb-5">
                    <button onClick={()=>setView("edit")}
                      className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      Modify Scoring Template →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Candidate scoring ── */}
            {template && (
              <div className="flex-1 space-y-5 min-w-0">

                {/* Candidate selector */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Candidates ({applications.length})
                  </p>
                  {applications.length===0 ? (
                    <p className="text-sm text-gray-400 italic">No applications found.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {applications.map(app => {
                        const name = getName(app);
                        const isSel = selectedApp?.id===app.id;
                        return (
                          <button key={app.id} onClick={()=>handleSelectApp(app)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                              isSel?"bg-green-50 border-green-200":"bg-gray-50 border-gray-100 hover:bg-gray-100"
                            }`}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden"
                              style={{ background: app.candidate?.profile?.avatarUrl?"transparent":"linear-gradient(135deg,#6ee7b7,#3b82f6)" }}>
                              {app.candidate?.profile?.avatarUrl
                                ? <img src={app.candidate.profile.avatarUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                : initials(name)
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${isSel?"text-green-700":"text-gray-700"}`}>{name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{app.job?.title||"—"}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Scoring panel */}
                {!selectedApp && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Select a candidate above to score</p>
                  </div>
                )}

                {selectedApp && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Candidate header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0"
                          style={{ background: selectedApp.candidate?.profile?.avatarUrl?"transparent":"linear-gradient(135deg,#6ee7b7,#3b82f6)" }}>
                          {selectedApp.candidate?.profile?.avatarUrl
                            ? <img src={selectedApp.candidate.profile.avatarUrl} alt={getName(selectedApp)} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                            : initials(getName(selectedApp))
                          }
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{getName(selectedApp)}</p>
                          <p className="text-xs text-gray-400">{selectedApp.job?.title||"—"}</p>
                          <span className="mt-1 inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full capitalize">
                            {selectedApp.status||"applied"}
                          </span>
                        </div>
                      </div>
                      {maxScore>0 && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{pct}<span className="text-sm text-gray-400 font-normal">%</span></p>
                          <p className="text-[10px] text-gray-400">{totalScore}/{maxScore} pts</p>
                        </div>
                      )}
                    </div>

                    {maxScore>0 && (
                      <div className="px-6 py-3 border-b border-gray-100">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${
                            pct>=80?"bg-green-500":pct>=60?"bg-blue-400":pct>=40?"bg-yellow-400":"bg-red-400"
                          }`} style={{ width:pct+"%" }} />
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-5">
                      {/* Stage input */}
                      <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Score Each Attribute</p>
                        <input value={stageName} onChange={e=>setStageName(e.target.value)}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-400 w-36"
                          placeholder="Stage name" />
                      </div>

                      {attributes.length===0 ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-400">No attributes. <button onClick={()=>setView("edit")} className="text-green-600 underline">Add some</button></p>
                        </div>
                      ) : loadingScores ? (
                        <div className="flex items-center gap-2 py-4">
                          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-400">Loading scores...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {attributes.map((attr, i) => {
                            const key = String(attr.id);
                            const cur = scores[key];
                            return (
                              <div key={attr.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot(i)}`} />
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800">{attr.name}</p>
                                      <p className="text-[10px] text-gray-400">Weight ×{attr.weight||1}{cur?.score?` · ${cur.score*(attr.weight||1)} pts`:""}</p>
                                    </div>
                                  </div>
                                  {cur?.score && (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${SCORE_COLORS[cur.score]}`}>
                                      {SCORE_LABELS[cur.score]}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2.5">
                                  {[1,2,3,4,5].map(v=>(
                                    <ScoreBtn key={v} value={v} selected={cur?.score===v} onClick={()=>setScore(attr.id,v)} />
                                  ))}
                                </div>
                                <input value={cur?.note||""} onChange={e=>setNote(attr.id,e.target.value)}
                                  placeholder="Interview note (optional)..."
                                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 bg-white placeholder-gray-300" />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          {Object.values(scores).filter(s=>s?.score).length}/{attributes.length} scored
                        </p>
                        <button onClick={handleSaveScores} disabled={saving}
                          className="px-6 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 shadow-sm">
                          {saving?"Saving...":"Save Scores"}
                        </button>
                      </div>
                    </div>

                    {/* Saved scores */}
                    {savedScores.length>0 && (
                      <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Saved Scores ({savedScores.length})</p>
                        <div className="space-y-2">
                          {savedScores.map((s,i) => {
                            const attrName = s.attribute?.name || attributes.find(a=>String(a.id)===String(s.attribute_id))?.name || "Unknown Attribute";
                            const attrIdx  = attributes.findIndex(a=>String(a.id)===String(s.attribute_id));
                            return (
                              <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot(attrIdx>=0?attrIdx:i)}`} />
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">{attrName}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {s.stage_name && <span className="text-[10px] text-gray-400">{s.stage_name}</span>}
                                      {s.interview_note && <span className="text-[10px] text-gray-400">· {s.interview_note}</span>}
                                    </div>
                                  </div>
                                </div>
                                <span className={`flex-shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-semibold border ${SCORE_COLORS[s.score]||"bg-gray-100 text-gray-500 border-gray-200"}`}>
                                  {SCORE_LABELS[s.score]||s.score}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Edit Checkbox Panel (right side of edit view) ─────────────────────────── */
function EditCheckboxPanel({ attributes, onSave, onCancel }) {
  const [activeIds, setActiveIds] = useState(
    attributes.filter(a=>a.is_active!==false).map(a=>a.id)
  );
  const [saving, setSaving] = useState(false);

  // Sync when attributes prop changes (e.g. after add/delete)
  useEffect(() => {
    setActiveIds(attributes.filter(a=>a.is_active!==false).map(a=>a.id));
  }, [attributes.length]);

  const toggle = (id) =>
    setActiveIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(activeIds); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
        {attributes.map((attr, i) => {
          const checked = activeIds.includes(attr.id);
          return (
            <div key={attr.id} onClick={()=>toggle(attr.id)}
              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(i)}`} />
                <span className="text-sm font-medium text-gray-700">{attr.name}</span>
                <span className="text-[10px] text-gray-400">×{attr.weight||1}</span>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
              }`}>
                {checked && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
        {attributes.length===0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            Add attributes using the panel on the left.
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
        <button onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-red-500 hover:text-red-600">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 text-sm font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50">
          {saving?"Saving...":"Save"}
        </button>
      </div>
    </div>
  );
}