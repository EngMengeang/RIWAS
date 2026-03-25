import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideBar from "../../components/SideBar";

// ─── Google Fonts: Roboto ─────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector("[href*='Roboto']")) document.head.appendChild(fontLink);

// ─── API Setup ────────────────────────────────────────────────────────────────
const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getWorkflowDefinitions = async () => (await API.get("/workflow-definitions")).data.data;
const createWorkflowDefinitionAPI = async (payload) => (await API.post("/workflow-definitions", payload)).data;
const updateWorkflowDefinitionAPI = async (id, payload) => (await API.put(`/workflow-definitions/${id}`, payload)).data;
const deleteWorkflowDefinitionAPI = async (id) => (await API.delete(`/workflow-definitions/${id}`)).data;

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = [
  { label: "Slate",   value: "#475569" },
  { label: "Blue",    value: "#2563eb" },
  { label: "Violet",  value: "#7c3aed" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber",   value: "#d97706" },
  { label: "Rose",    value: "#e11d48" },
  { label: "Sky",     value: "#0284c7" },
  { label: "Orange",  value: "#ea580c" },
];

const DEFAULT_FORM = { name: "", description: "", color: "#2563eb" };

// ─── Drag Dots ────────────────────────────────────────────────────────────────
const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
    <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
    <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecruitmentWorkflow() {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [hasPendingOrderChanges, setHasPendingOrderChanges] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [modal, setModal] = useState({ open: false, mode: "create", stage: null });
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchStages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkflowDefinitions();
      setStages([...(data || [])].sort((a, b) => a.order - b.order));
      setHasPendingOrderChanges(false);
    } catch {
      setError("Unable to load stages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStages(); }, [fetchStages]);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setFormError("");
    setModal({ open: true, mode: "create", stage: null });
  };
  const openEdit = (stage) => {
    setForm({ name: stage.name, description: stage.description || "", color: stage.color || "#2563eb" });
    setFormError("");
    setModal({ open: true, mode: "edit", stage });
  };
  const closeModal = () => setModal({ open: false, mode: "create", stage: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Stage name is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      if (modal.mode === "create") {
        const nextOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) + 1 : 1;
        await createWorkflowDefinitionAPI({ ...form, order: nextOrder });
        showToast("Stage created.");
      } else {
        await updateWorkflowDefinitionAPI(modal.stage.id, {
          ...form, order: modal.stage.order, is_active: modal.stage.is_active
        });
        showToast("Stage updated.");
      }
      closeModal();
      fetchStages();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (stage) => {
    try {
      await updateWorkflowDefinitionAPI(stage.id, { ...stage, is_active: !stage.is_active });
      setStages(prev => prev.map(s => s.id === stage.id ? { ...s, is_active: !s.is_active } : s));
      showToast(`Stage ${!stage.is_active ? "activated" : "deactivated"}.`);
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkflowDefinitionAPI(id);

      // Keep stage numbering contiguous after delete (1..N)
      const remainingStages = stages
        .filter((s) => s.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((s, i) => ({ ...s, order: i + 1 }));

      await Promise.all(
        remainingStages.map((s) =>
          updateWorkflowDefinitionAPI(s.id, {
            name: s.name,
            description: s.description,
            order: s.order,
            color: s.color,
            is_active: s.is_active,
          })
        )
      );

      setStages(remainingStages);
      setHasPendingOrderChanges(false);
      setDeleteConfirm(null);
      showToast("Stage removed and steps renumbered.");
    } catch {
      showToast("Failed to delete stage.", "error");
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragging === null || dragging === dropIndex) {
      setDragging(null); setDragOver(null); return;
    }
    const reordered = [...stages];
    const [moved] = reordered.splice(dragging, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((s, i) => ({ ...s, order: i + 1 }));
    setStages(updated);
    setHasPendingOrderChanges(true);
    setDragging(null);
    setDragOver(null);
    showToast("Order updated. Click Save Workflow to apply changes.");
  };

  const saveWorkflowOrder = async () => {
    if (!hasPendingOrderChanges) {
      navigate("/profile-page");
      return;
    }
    setSavingOrder(true);
    try {
      await Promise.all(
        stages.map((s) =>
          updateWorkflowDefinitionAPI(s.id, {
            name: s.name,
            description: s.description,
            order: s.order,
            color: s.color,
            is_active: s.is_active,
          })
        )
      );
      setHasPendingOrderChanges(false);
      navigate("/profile-page");
    } catch {
      showToast("Failed to save workflow order.", "error");
      fetchStages();
    } finally {
      setSavingOrder(false);
    }
  };

  const activeStages = stages.filter(s => s.is_active !== false);

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif" }} className="min-h-screen bg-[#f8f9fb] flex text-slate-800">
      <SideBar />

      <main className="flex-1 ml-[227px] h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-10 space-y-5">

          {/* ── Header — matches Profile page ──────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Recruitment Workflow</h1>
              <div className="h-0.5 w-full bg-green-500 rounded mt-2" />
            </div>
            <div className="ml-6 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={saveWorkflowOrder}
                disabled={savingOrder}
                className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm text-white transition-all active:scale-95 shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#047857", fontWeight: 600 }}
              >
                {savingOrder ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {savingOrder ? "Saving..." : "Save Workflow"}
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm text-white transition-all active:scale-95 shadow-sm hover:opacity-90"
                style={{ backgroundColor: "#1e293b", fontWeight: 500 }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                Add Stage
              </button>
            </div>
          </div>

          {/* ── Toast ──────────────────────────────────────────────────────── */}
          <div className={`overflow-hidden transition-all duration-300 ${toast.show ? "max-h-12 opacity-100" : "max-h-0 opacity-0"}`}>
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] ${
                toast.type === "error"
                  ? "bg-red-50 border border-red-100 text-red-600"
                  : "bg-emerald-50 border border-emerald-100 text-emerald-700"
              }`}
              style={{ fontWeight: 500 }}
            >
              {toast.type === "error"
                ? <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
              }
              {toast.msg}
            </div>
          </div>

          {/* ── Error ──────────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-[13px]" style={{ fontWeight: 500 }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}

          {/* ── Pipeline Preview ────────────────────────────────────────────── */}
          {!loading && activeStages.length > 0 && (
            <div className="bg-white border border-slate-200/70 rounded-2xl px-6 py-5 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4" style={{ fontWeight: 600 }}>
                Active Pipeline · {activeStages.length} stage{activeStages.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeStages.map((stage, i) => (
                  <React.Fragment key={stage.id}>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-[12px]"
                      style={{ backgroundColor: stage.color || "#2563eb", fontWeight: 500 }}
                    >
                      <span className="opacity-50 text-[11px]">{i + 1}</span>
                      <span>{stage.name}</span>
                    </div>
                    {i < activeStages.length - 1 && (
                      <svg className="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                      </svg>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* ── Stages Table ────────────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[24px_40px_1fr_96px_88px] gap-4 items-center px-6 py-3 bg-slate-50/80 border-b border-slate-100">
              <div />
              <div />
              <p className="text-[11px] text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Stage</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider text-center" style={{ fontWeight: 600 }}>Status</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider text-right" style={{ fontWeight: 600 }}>Actions</p>
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin"/>
                <p className="text-[13px]">Loading stages...</p>
              </div>
            )}

            {!loading && stages.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[14px] text-slate-700" style={{ fontWeight: 600 }}>No stages yet</p>
                  <p className="text-[13px] text-slate-400 mt-0.5">Add your first stage to build the pipeline</p>
                </div>
                <button
                  onClick={openCreate}
                  className="mt-1 h-8 px-4 rounded-lg text-[13px] text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#1e293b", fontWeight: 500 }}
                >
                  Add First Stage
                </button>
              </div>
            )}

            {!loading && stages.length > 0 && (
              <div>
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    draggable
                    onDragStart={(e) => { setDragging(index); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(index); }}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    className={`
                      group grid grid-cols-[24px_40px_1fr_96px_88px] gap-4 items-center px-6 py-4
                      border-b border-slate-50 last:border-0 transition-all cursor-grab active:cursor-grabbing select-none
                      ${dragging === index ? "opacity-30 scale-[0.99]" : ""}
                      ${dragOver === index && dragging !== index
                        ? "bg-blue-50/50 border-l-[3px] border-blue-300"
                        : "hover:bg-slate-50/60"}
                    `}
                  >
                    <div className="text-slate-200 group-hover:text-slate-400 transition-colors flex-shrink-0">
                      <GripIcon />
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: stage.color || "#2563eb", fontWeight: 700 }}
                    >
                      {stage.order}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] text-slate-800 truncate" style={{ fontWeight: 500 }}>
                        {stage.name}
                      </p>
                      {stage.description && (
                        <p className="text-[12px] text-slate-400 truncate mt-0.5" style={{ fontWeight: 400 }}>
                          {stage.description}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] ${
                          stage.is_active === false
                            ? "bg-slate-100 text-slate-400"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${stage.is_active === false ? "bg-slate-300" : "bg-emerald-500"}`} />
                        {stage.is_active === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => toggleActive(stage)}
                        title={stage.is_active === false ? "Activate" : "Deactivate"}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        {stage.is_active === false
                          ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                        }
                      </button>
                      <button
                        onClick={() => openEdit(stage)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(stage.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                <div className="px-6 py-2.5 text-center text-[11px] text-slate-300 border-t border-slate-50" style={{ fontWeight: 400 }}>
                  Drag rows to reorder · Click Save Workflow to apply order changes
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {modal.open && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[440px] shadow-2xl border border-slate-100 overflow-hidden" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <div className="px-7 pt-6 pb-5 border-b border-slate-50">
              <h3 className="text-[17px] text-slate-900" style={{ fontWeight: 700 }}>
                {modal.mode === "create" ? "New Stage" : "Edit Stage"}
              </h3>
              <p className="text-[13px] text-slate-400 mt-0.5" style={{ fontWeight: 400 }}>
                {modal.mode === "create" ? "Add a new step to your hiring pipeline." : "Update the details for this stage."}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 uppercase tracking-widest" style={{ fontWeight: 600 }}>Stage Name *</label>
                <input
                  required
                  placeholder="e.g. Technical Interview"
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-slate-400 focus:bg-white transition-all"
                  style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 400 }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 uppercase tracking-widest" style={{ fontWeight: 600 }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="What happens in this stage?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
                  style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 400 }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-2 uppercase tracking-widest" style={{ fontWeight: 600 }}>Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-7 h-7 rounded-lg transition-all ${form.color === c.value ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] flex-shrink-0"
                  style={{ backgroundColor: form.color, fontWeight: 700 }}
                >
                  {modal.mode === "create" ? stages.length + 1 : modal.stage?.order}
                </div>
                <span className="text-[13px] text-slate-500" style={{ fontWeight: 500 }}>
                  {form.name || "Stage preview"}
                </span>
              </div>
              {formError && <p className="text-[13px] text-red-500" style={{ fontWeight: 500 }}>{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 h-10 rounded-lg text-[13px] text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all" style={{ fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 h-10 rounded-lg text-[13px] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 hover:opacity-90" style={{ backgroundColor: "#1e293b", fontWeight: 600 }}>
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  {saving ? "Saving..." : modal.mode === "create" ? "Create Stage" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[340px] shadow-2xl border border-slate-100 p-7 text-center" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 className="text-[16px] text-slate-900 mb-1" style={{ fontWeight: 700 }}>Delete this stage?</h3>
            <p className="text-[13px] text-slate-400 mb-6" style={{ fontWeight: 400 }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-lg text-[13px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all" style={{ fontWeight: 500 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-lg text-[13px] text-white hover:opacity-90 transition-all" style={{ backgroundColor: "#ef4444", fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}