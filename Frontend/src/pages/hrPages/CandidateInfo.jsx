import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiChevronDown, FiMail, FiCalendar,
  FiChevronLeft, FiChevronRight, FiFileText,
  FiX, FiUsers, FiTrendingUp, FiCheckCircle,
  FiAlertCircle, FiFilter, FiGitBranch,
} from 'react-icons/fi';
import SideBar from "../../components/SideBar";
import { getAllApplicationsForRecruiter, updateApplicationStatus } from "../../server/jobapplicationAPI";
import { getWorkflowByApplication } from "../../server/workflowAPI";
import { getWorkflowDefinitions } from "../../server/workflowdefinitionAPI";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";

/* ─── Status config ─────────────────────────────────────────────────────────── */
const STATUS = {
  applied:    { label: 'Applied',    bg: '#f8fafc', text: '#64748b', dot: '#94a3b8', border: '#e2e8f0' },
  review:     { label: 'In Review',  bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', border: '#bfdbfe' },
  interview:  { label: 'Interview',  bg: '#f5f3ff', text: '#7c3aed', dot: '#7c3aed', border: '#ddd6fe' },
  assessment: { label: 'Assessment', bg: '#fff7ed', text: '#c2410c', dot: '#ea580c', border: '#fed7aa' },
  offer:      { label: 'Offer Sent', bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', border: '#bbf7d0' },
  hired:      { label: 'Hired',      bg: '#dcfce7', text: '#14532d', dot: '#16a34a', border: '#86efac' },
  rejected:   { label: 'Rejected',   bg: '#fff1f2', text: '#be123c', dot: '#e11d48', border: '#fecdd3' },
};

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const getInitials = (name) =>
  name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

const stripFences = (s) =>
  s.replace(/^```json[\r\n]*/i, '').replace(/^```[\r\n]*/i, '').replace(/```[\r\n]*$/i, '').trim();

const parseAI = (ai) => {
  if (!ai) return {};
  let c = ai;
  if (typeof c === 'object' && c?.ai_analysis && !c?.personalInformation) c = c.ai_analysis;
  if (typeof c === 'string') { try { c = JSON.parse(stripFences(c)); } catch { return {}; } }
  if (typeof c === 'object' && !c.skills && typeof c.raw === 'string') {
    try { const r = JSON.parse(stripFences(c.raw)); if (typeof r === 'object') c = r; } catch {}
  }
  return typeof c === 'object' && c !== null ? c : {};
};

const asList = (v) => Array.isArray(v) ? v : (typeof v === 'string' && v.trim()) ? [v] : [];

const extractSection = (text, names) => {
  if (!text) return [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const ALL = ['education','experience','work experience','skills','skill','certification','certifications','projects','summary','profile','languages','extracurricular','achievements','references','objective','contact','personal'];
  const isTarget = l => names.some(n => l.toLowerCase().includes(n.toLowerCase()) && l.length < 60);
  const isOther  = l => ALL.some(h => l.toLowerCase().includes(h) && l.length < 60) && !isTarget(l);
  let inSec = false; const out = [];
  for (const l of lines) {
    if (isTarget(l)) { inSec = true; continue; }
    if (inSec) { if (isOther(l)) break; if (l.length > 2) out.push(l.replace(/^[-•*]\s*/, '')); }
  }
  return out;
};

const getSummary = (text) => {
  if (!text) return 'No summary available.';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const HEADS = ['summary', 'professional summary', 'profile', 'objective', 'about'];
  const OTHER = ['education', 'experience', 'skill', 'certification', 'project', 'language'];
  let inS = false; const out = [];
  for (const l of lines) {
    const lo = l.toLowerCase();
    if (HEADS.some(h => lo.includes(h) && l.length < 60)) { inS = true; continue; }
    if (inS) {
      if (OTHER.some(h => lo.includes(h) && l.length < 60)) break;
      if (l.length > 5) out.push(l);
      if (out.length >= 5) break;
    }
  }
  if (out.length) return out.join(' ');
  const m = lines.filter(l => l.length > 40);
  return m.length ? m.slice(0, 3).join(' ') : text.slice(0, 400) + (text.length > 400 ? '…' : '');
};

/* ─── Status Pill ───────────────────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const cfg = STATUS[status?.toLowerCase()] || STATUS.applied;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

/* ─── Section content renderer ──────────────────────────────────────────────── */
const SectionContent = ({ app, filter }) => {
  if (filter === 'Summary') return (
    <p className="text-sm text-gray-600 leading-relaxed">{app.summary || 'No summary available.'}</p>
  );
  if (filter === 'Smart Insight') {
    if (app.matchScore <= 0) return <p className="text-sm text-gray-400 italic">No AI analysis available.</p>;
    const pct   = Math.round(app.matchScore * 100);
    const clPct = Math.round(app.coverLetterScore * 100);
    const clLabel = app.coverLetterScore >= 0.8 ? 'Compelling' : app.coverLetterScore >= 0.6 ? 'Good' : app.coverLetterScore >= 0.4 ? 'Average' : 'Needs Work';
    return (
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600 font-medium">Job Match</span>
            <span className="font-semibold text-gray-900">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: pct + '%' }} />
          </div>
        </div>
        {app.coverLetterScore > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600 font-medium">Cover Letter <span className="text-gray-400 font-normal">· {clLabel}</span></span>
              <span className="font-semibold text-gray-900">{clPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: clPct + '%' }} />
            </div>
          </div>
        )}
      </div>
    );
  }
  if (filter === 'Skill Gaps') return app.missingSkills?.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {app.missingSkills.map((s, i) => (
        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-md border border-red-100">{s}</span>
      ))}
    </div>
  ) : <p className="text-sm text-gray-400 italic">No skill gaps identified.</p>;
  if (filter === 'Experience') return app.experience
    ? <p className="text-sm text-gray-600 leading-relaxed">{app.experience}</p>
    : <p className="text-sm text-gray-400 italic">No experience data available.</p>;
  if (filter === 'Skill') return app.skills.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {app.skills.map((s, i) => (
        <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">{s}</span>
      ))}
    </div>
  ) : <p className="text-sm text-gray-400 italic">No skills found.</p>;
  if (filter === 'Certification') return app.certifications.length > 0 ? (
    <ul className="space-y-1.5">
      {app.certifications.map((c, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <FiCheckCircle size={13} className="text-green-400 mt-0.5 flex-shrink-0" />{c}
        </li>
      ))}
    </ul>
  ) : <p className="text-sm text-gray-400 italic">No certifications found.</p>;
  if (filter === 'Education') return app.education.length > 0 ? (
    <ul className="space-y-1.5">
      {app.education.map((e, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="w-1 h-1 rounded-full bg-gray-300 mt-2 flex-shrink-0" />{e}
        </li>
      ))}
    </ul>
  ) : <p className="text-sm text-gray-400 italic">No education found.</p>;
  if (filter === 'Work Experience') return app.workExperience.length > 0 ? (
    <ul className="space-y-1.5">
      {app.workExperience.map((e, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="w-1 h-1 rounded-full bg-gray-300 mt-2 flex-shrink-0" />{e}
        </li>
      ))}
    </ul>
  ) : <p className="text-sm text-gray-400 italic">No work experience found.</p>;
  return null;
};

/* ─── Workflow Progress Line ─────────────────────────────────────────────────── */
// Mirrors MyApplication's progress bar exactly — uses real API stages + workflow steps
const WorkflowProgressLine = ({ appId, appStatus, workflowSteps, stages }) => {
  if (!stages || stages.length === 0) return (
    <div className="flex items-center justify-center py-6">
      <p className="text-xs text-gray-400">Loading stages...</p>
    </div>
  );

  // Resolve active index
  const nameToIdx = {};
  stages.forEach((s, i) => { nameToIdx[s.name.toLowerCase()] = i; });

  const statusLower = appStatus?.toLowerCase() || '';
  const LEGACY = {
    applied: 0,
    review:  Math.min(1, stages.length - 1),
    interview: Math.min(2, stages.length - 1),
    offer:   stages.length - 1,
    hired:   stages.length - 1,
    rejected: Math.max(stages.length - 2, 0),
  };
  let activeIdx = nameToIdx[statusLower] ?? LEGACY[statusLower] ?? 0;

  const workflowMax = (workflowSteps || []).reduce((max, w) => {
    const stepName = w.step?.toLowerCase().replace(/_/g, ' ') || '';
    const idx = nameToIdx[stepName] ?? nameToIdx[w.step?.toLowerCase()] ?? 0;
    return Math.max(max, idx);
  }, 0);

  activeIdx = Math.max(activeIdx, workflowMax);

  return (
    <div className="flex gap-2.5">
      {stages.map((stage, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i <= activeIdx ? stage.color : '#e5e7eb',
              opacity:    i <= activeIdx ? 1 : 0.6,
            }}
          />
          <span className="text-[10px] text-gray-500 text-center leading-tight whitespace-nowrap">
            {stage.name}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Workflow Center Modal ──────────────────────────────────────────────────── */
const WorkflowPanel = ({ app, onClose, stages, workflowSteps, loadingWorkflow }) => {
  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 modal-backdrop">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg modal-pop flex flex-col max-h-[80vh]">

        {/* Modal header — fixed */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: app.avatar ? 'transparent' : 'linear-gradient(135deg,#6ee7b7,#3b82f6)' }}
            >
              {app.avatar
                ? <img src={app.avatar} alt={app.name} className="w-full h-full object-cover" />
                : getInitials(app.name)
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{app.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{app.position}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <FiX size={14} />
          </button>
        </div>

        {/* Status + date row — fixed */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Current Status</p>
            <StatusPill status={app.status} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Applied</p>
            <p className="text-xs text-gray-600 font-medium">{app.displayDate || '—'}</p>
          </div>
        </div>

        {/* Pipeline progress line — fixed */}
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Recruitment Pipeline</p>
          {loadingWorkflow ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading pipeline...</span>
            </div>
          ) : stages.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No pipeline stages defined.</p>
          ) : (
            <WorkflowProgressLine
              appId={app.id}
              appStatus={app.status}
              workflowSteps={workflowSteps}
              stages={stages}
            />
          )}
        </div>

        {/* Activity log — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 hide-scroll">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Activity Log</p>
          {loadingWorkflow ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : workflowSteps.length === 0 ? (
            <div className="text-center py-8">
              <FiGitBranch size={22} className="text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No workflow activity yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workflowSteps.map((step, i) => {
                const stageName    = step.step?.replace(/_/g, ' ') || 'Step';
                const matchedStage = stages.find(s => s.name.toLowerCase() === stageName.toLowerCase());
                const color        = matchedStage?.color || '#6ee7b7';
                return (
                  <div key={step.id || i} className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 capitalize">{stageName}</p>
                      {step.created_at && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(step.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <FiCheckCircle size={13} className="text-green-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — fixed */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────────── */
const CandidateInfo = () => {
  const navigate = useNavigate();

  const [applications, setApplications]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedStage, setSelectedStage]   = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('Summary');
  const [selectedDate, setSelectedDate]     = useState(null);
  const [currentMonth, setCurrentMonth]     = useState(new Date());
  const [workflowApp, setWorkflowApp]       = useState(null);
  const [workflowSteps, setWorkflowSteps]   = useState([]);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  const [stages, setStages]                 = useState([]);
  const [expandedId, setExpandedId]         = useState(null);

  const stages_filter = ['All', 'applied', 'review', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
  const filterOptions = ['Summary', 'Smart Insight', 'Skill Gaps', 'Experience', 'Work Experience', 'Skill', 'Certification', 'Education'];

  // Load workflow definitions once
  useEffect(() => {
    getWorkflowDefinitions()
      .then(data => { if (data && data.length > 0) setStages(data); })
      .catch(() => {});
  }, []);

  // Load applications
  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const res  = await getAllApplicationsForRecruiter({ limit: 100 });
        const rows = res.data || [];
        const mapped = rows.map(app => {
          const user     = app.candidate?.profile?.user;
          const parsedAI = parseAI(app.ai_analysis);
          const raw      = app.extracted_text || '';
          const skills         = extractSection(raw, ['skills', 'technical skills', 'core skills', 'key skills']);
          const education      = extractSection(raw, ['education', 'academic', 'qualification']);
          const workExperience = extractSection(raw, ['experience', 'work experience', 'employment', 'work history']);
          const certifications = extractSection(raw, ['certification', 'certifications', 'certificates', 'licenses']);
          return {
            id:       app.id,
            name:     user ? ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || user.email || 'Unknown' : 'Unknown',
            position: app.job?.title || 'Unknown Position',
            email:    user?.email || '',
            appliedDate:  app.applied_at ? app.applied_at.split('T')[0] : '',
            displayDate:  app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            status: app.status || 'applied',
            stage:  app.status || 'applied',
            summary:        getSummary(raw),
            skills:         skills.length ? skills : asList(parsedAI?.skills),
            education:      education.length ? education : asList(parsedAI?.education),
            workExperience: workExperience.length ? workExperience : asList(parsedAI?.workExperience),
            certifications: certifications.length ? certifications : asList(parsedAI?.certifications),
            matchScore:       typeof parsedAI?.matchScore === 'number' ? parsedAI.matchScore : 0,
            coverLetterScore: typeof parsedAI?.coverLetterScore === 'number' ? parsedAI.coverLetterScore : 0,
            missingSkills:    asList(parsedAI?.missingSkills),
            experience:       parsedAI?.experience || '',
            avatar:           app.candidate?.profile?.avatarUrl || null,
          };
        });
        setApplications(mapped);
      } catch (e) { setError('Failed to load applications.'); console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Open workflow panel — fetch real steps
  const openWorkflow = async (app) => {
    setWorkflowApp(app);
    setWorkflowSteps([]);
    setLoadingWorkflow(true);
    try {
      const steps = await getWorkflowByApplication(app.id);
      setWorkflowSteps(steps || []);
    } catch { setWorkflowSteps([]); }
    finally { setLoadingWorkflow(false); }
  };

  const closeWorkflow = () => { setWorkflowApp(null); setWorkflowSteps([]); };

  /* Calendar */
  const getDays = (date) => {
    const y = date.getFullYear(), m = date.getMonth();
    const first = new Date(y, m, 1).getDay(), total = new Date(y, m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  };
  const countOnDate = (day) => {
    if (!day) return 0;
    const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return applications.filter(a => a.appliedDate === ds).length;
  };
  const clickDate = (day) => {
    if (!day) return;
    const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setSelectedDate(p => p === ds ? null : ds);
  };

  /* Filter */
  const filtered = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    return (app.name.toLowerCase().includes(q) || app.position.toLowerCase().includes(q) || app.email.toLowerCase().includes(q))
      && (selectedStage === 'All' || app.stage === selectedStage)
      && (!selectedDate || app.appliedDate === selectedDate);
  });

  /* Actions */
  const handleViewCV = (id) => navigate('/view-cv/' + id);
  const handleReject = async (id) => {
    const app = applications.find(a => a.id === id);
    if (!window.confirm(`Reject ${app.name}'s application?`)) return;
    try {
      await updateApplicationStatus(id, { status: 'rejected' });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', stage: 'rejected' } : a));
    } catch (e) { alert(e?.response?.data?.error || 'Failed.'); }
  };
  const handleNext = async (id) => {
    const app = applications.find(a => a.id === id);
    const map = { applied: 'review', review: 'interview', interview: 'assessment', assessment: 'offer', offer: 'hired' };
    if (app.stage === 'hired') return navigate('/send-offer/' + id, { state: { candidate: app } });
    const next = map[app.stage]; if (!next) return;
    try {
      await updateApplicationStatus(id, { status: next });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: next, stage: next } : a));
    } catch (e) { alert(e?.response?.data?.error || 'Failed.'); }
  };

  /* Stats */
  const stats = {
    total:    applications.length,
    active:   applications.filter(a => ['review', 'interview', 'assessment'].includes(a.status)).length,
    hired:    applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const positionMap = applications.reduce((acc, a) => {
    if (a.position) acc[a.position] = (acc[a.position] || 0) + 1;
    return acc;
  }, {});
  const topPositions = Object.entries(positionMap)
    .map(([name, count]) => ({ name, count, pct: Math.round(count / applications.length * 100) }))
    .sort((a, b) => b.count - a.count);

  const days      = getDays(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-pop { animation: modalPop 0.18s cubic-bezier(0.22,1,0.36,1); }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-backdrop { animation: backdropIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.15s ease; }
      `}</style>

      <SideBar />

      {/* Workflow panel */}
      {workflowApp && (
        <WorkflowPanel
          app={workflowApp}
          onClose={closeWorkflow}
          stages={stages}
          workflowSteps={workflowSteps}
          loadingWorkflow={loadingWorkflow}
        />
      )}

      <main className="flex-1 ml-[227px] flex flex-col h-screen overflow-hidden">

        {/* ── Header — matches JobList / ViewJobs style ── */}
        <div className="flex-shrink-0 px-8 pt-8 pb-0 bg-[#F9FAFB]">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Manage Applications</h1>
            <div className="flex items-center gap-6 mt-1">
              {[
                { icon: <FiUsers size={14} />,       label: 'Total',    val: stats.total,    color: 'text-gray-500' },
                { icon: <FiTrendingUp size={14} />,  label: 'Active',   val: stats.active,   color: 'text-blue-500' },
                { icon: <FiCheckCircle size={14} />, label: 'Hired',    val: stats.hired,    color: 'text-green-500' },
                { icon: <FiAlertCircle size={14} />, label: 'Rejected', val: stats.rejected, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={s.color}>{s.icon}</span>
                  <span className="text-sm font-semibold text-gray-900">{s.val}</span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-0.5 w-full bg-green-500 rounded" />
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-y-auto hide-scroll">

          {/* LEFT: cards */}
          <div className="flex-1 flex flex-col px-8 py-6 overflow-y-auto hide-scroll">

            {/* Filter bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex items-center gap-3 flex-wrap shadow-sm">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name, position or email..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-400 focus:bg-white transition-colors placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <FiFilter size={11} /> Stage
              </div>
              <div className="relative">
                <select
                  value={selectedStage}
                  onChange={e => setSelectedStage(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-400 cursor-pointer text-gray-700"
                >
                  {stages_filter.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All Stages' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
              <div className="text-xs text-gray-400 font-medium">View</div>
              <div className="relative">
                <select
                  value={selectedFilter}
                  onChange={e => setSelectedFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-400 cursor-pointer text-gray-700"
                >
                  {filterOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>

            {/* Count */}
            <div className="flex items-center justify-between mb-3 px-0.5">
              <p className="text-xs text-gray-500">
                <strong className="text-gray-700">{filtered.length}</strong> of <strong className="text-gray-700">{applications.length}</strong> applications
                {selectedDate && <span className="text-gray-400"> · filtered by date</span>}
              </p>
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="text-xs text-green-600 hover:text-green-700 font-medium underline underline-offset-2">
                  Clear date filter
                </button>
              )}
            </div>

            {/* Cards list */}
            <div className="flex-1 overflow-y-auto hide-scroll space-y-2.5 pb-6">
              {loading && (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center shadow-sm">
                  <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading applications...</p>
                </div>
              )}
              {!loading && error && (
                <div className="bg-white rounded-xl border border-red-100 py-16 text-center shadow-sm">
                  <FiAlertCircle size={24} className="text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center shadow-sm">
                  <FiUsers size={28} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No applications found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}

              {!loading && !error && filtered.map(app => {
                const isExpanded = expandedId === app.id;
                const isWfOpen   = workflowApp?.id === app.id;

                return (
                  <div
                    key={app.id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isWfOpen ? 'border-green-300' : 'border-gray-200'}`}
                  >
                    {/* Card body */}
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: app.avatar ? 'transparent' : 'linear-gradient(135deg,#6ee7b7,#3b82f6)' }}
                        >
                          {app.avatar
                            ? <img src={app.avatar} alt={app.name} className="w-full h-full object-cover" />
                            : getInitials(app.name)
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
                            <span className="text-sm font-semibold text-gray-900">{app.name}</span>
                            <StatusPill status={app.status} />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{app.position}</p>
                          <div className="flex items-center gap-5 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5"><FiMail size={10} />{app.email}</span>
                            <span className="flex items-center gap-1.5"><FiCalendar size={10} />Applied {app.displayDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded section */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 fade-in">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{selectedFilter}</p>
                          <SectionContent app={app} filter={selectedFilter} />
                        </div>
                      )}
                    </div>

                    {/* Action bar */}
                    <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewCV(app.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                        >
                          <FiFileText size={12} /> View CV
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : app.id)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                            isExpanded ? 'bg-gray-200 text-gray-700 border-gray-200' : 'text-gray-500 border-transparent hover:bg-white hover:border-gray-200'
                          }`}
                        >
                          <FiChevronDown size={11} className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                          {selectedFilter}
                        </button>
                        <button
                          onClick={() => isWfOpen ? closeWorkflow() : openWorkflow(app)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                            isWfOpen
                              ? 'bg-green-500 text-white border-green-500'
                              : 'text-gray-500 border-transparent hover:bg-white hover:border-gray-200'
                          }`}
                        >
                          <FiGitBranch size={12} />
                          {isWfOpen ? 'Workflow Open' : 'Workflow'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status === 'hired' && (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <FiCheckCircle size={12} /> Hired
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="text-xs text-red-400 font-medium">Rejected</span>
                        )}
                        {app.status !== 'rejected' && app.status !== 'hired' && (
                          <>
                            <button
                              onClick={() => handleReject(app.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleNext(app.id)}
                              className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                            >
                              {app.stage === 'offer' ? 'Send Offer →' : 'Next Stage →'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: sidebar */}
          <div className="w-64 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto hide-scroll p-5 space-y-6">

            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-700">{monthName}</p>
                <div className="flex gap-0.5">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1))}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiChevronLeft size={12} />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1))}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiChevronRight size={12} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {['S','M','T','W','T','F','S'].map((d,i) => (
                  <div key={i} className="text-[9px] font-semibold text-gray-300 pb-1.5 uppercase">{d}</div>
                ))}
                {days.map((day, i) => {
                  const cnt = countOnDate(day);
                  const ds  = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
                  const sel = ds === selectedDate;
                  return (
                    <button key={i} onClick={() => clickDate(day)} disabled={!day}
                      className={`relative aspect-square flex items-center justify-center rounded-md text-[11px] transition-all ${
                        !day ? 'invisible' :
                        sel  ? 'bg-green-500 text-white font-semibold' :
                        cnt > 0 ? 'bg-green-50 text-green-700 font-medium hover:bg-green-100' :
                                  'text-gray-400 hover:bg-gray-100'
                      }`}>
                      {day}
                      {cnt > 0 && !sel && <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-green-400 rounded-full" />}
                    </button>
                  );
                })}
              </div>
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="mt-3 w-full py-1.5 text-xs text-green-600 font-medium border border-green-100 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  Clear date filter
                </button>
              )}
            </div>

            <div className="border-t border-gray-100" />

            {/* Pipeline by stage */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Pipeline</p>
              <div className="space-y-1">
                {Object.entries(STATUS).map(([key, cfg]) => {
                  const count    = applications.filter(a => a.status === key).length;
                  const isActive = selectedStage === key;
                  return (
                    <button key={key}
                      onClick={() => setSelectedStage(isActive ? 'All' : key)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-left ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                      <span className="text-xs text-gray-600 flex-1">{cfg.label}</span>
                      <span className="text-xs font-semibold text-gray-900 tabular-nums">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Top Positions */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Top Positions</p>
              {topPositions.length === 0 ? (
                <p className="text-xs text-gray-400">No data yet.</p>
              ) : (
                <div className="space-y-3.5">
                  {topPositions.slice(0, 5).map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-600 truncate flex-1 mr-2">{item.name}</span>
                        <span className="text-[11px] font-semibold text-gray-600 flex-shrink-0">{item.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div className="h-1 rounded-full bg-green-400 transition-all duration-500" style={{ width: item.pct + '%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateInfo;