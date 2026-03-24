import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import SideBar from "../../components/SideBar";
import {
  FaArrowUp, FaClock, FaCheckCircle, FaSearch, FaFilter, FaBriefcase,
  FaUsers, FaUserCheck, FaEdit, FaTrash, FaEye, FaChevronDown,
  FaMapMarkerAlt, FaDollarSign, FaTimes, FaCheck, FaHourglass,
  FaFileAlt, FaPlus,
} from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";

import { getDashboardData } from "../../server/dashboardAPI";
import { getAllJobs, updateJob, deleteJob, createJob } from "../../server/jobpostingAPI";
import { updateApplicationStatus } from "../../server/jobapplicationAPI";

const APPLICATION_STATUS = {
  APPLIED:    "applied",
  REVIEW:     "review",
  INTERVIEW:  "interview",
  OFFER:      "offer",
  HIRED:      "hired",
  REJECTED:   "rejected",
};

const JOB_STATUS = {
  DRAFT:     "draft",
  PUBLISHED: "published",
  CLOSED:    "closed",
};

const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT      = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const FUNNEL_STAGES = [
  { key:"applied",   label:"Application", color:"#1d4ed8" },
  { key:"review",    label:"Screening",   color:"#2563eb" },
  { key:"interview", label:"Interview",   color:"#3b82f6" },
  { key:"offer",     label:"Offer",       color:"#60a5fa" },
  { key:"hired",     label:"Hired",       color:"#93c5fd" },
  { key:"rejected",  label:"Rejected",    color:"#bfdbfe" },
];

const DONUT_COLORS = ["#3b82f6","#f472b6","#22d3ee","#4ade80","#fb923c"];

const APP_STATUS_STYLE = {
  applied:   { bg:"#eff6ff", c:"#2563eb", label:"Applied"    },
  review:    { bg:"#faf5ff", c:"#9333ea", label:"In Review"  },
  interview: { bg:"#fefce8", c:"#ca8a04", label:"Interview"  },
  offer:     { bg:"#fff7ed", c:"#ea580c", label:"Offer"      },
  hired:     { bg:"#f0fdf4", c:"#16a34a", label:"Hired"      },
  rejected:  { bg:"#fef2f2", c:"#dc2626", label:"Rejected"   },
};

const JOB_TYPE_STYLE = {
  "full_time": { bg:"#eff6ff", c:"#2563eb", label:"Full-time" },
  "part_time": { bg:"#f0fdf4", c:"#16a34a", label:"Part-time" },
  "contract":  { bg:"#faf5ff", c:"#9333ea", label:"Contract"  },
  "intern":    { bg:"#fef3c7", c:"#d97706", label:"Intern"    },
  "remote":    { bg:"#fff7ed", c:"#ea580c", label:"Remote"    },
};

const JOB_STATUS_STYLE = {
  published: { bg:"#f0fdf4", c:"#16a34a", label:"Published" },
  draft:     { bg:"#f8fafc", c:"#64748b", label:"Draft"     },
  closed:    { bg:"#fef2f2", c:"#dc2626", label:"Closed"    },
};

const formatSalary = (salary) => {
  if (!salary) return null;
  if (typeof salary === "string") return salary;
  if (typeof salary === "object") {
    const { min, max, currency = "USD" } = salary;
    const sym = currency === "USD" ? "$" : currency;
    if (min && max) return `${sym}${Number(min).toLocaleString()}–${sym}${Number(max).toLocaleString()}`;
    if (min) return `From ${sym}${Number(min).toLocaleString()}`;
    if (max) return `Up to ${sym}${Number(max).toLocaleString()}`;
  }
  return null;
};

const safeStr = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

.pf{opacity:0;transform:translateY(10px);animation:pfu .42s ease forwards;}
@keyframes pfu{to{opacity:1;transform:translateY(0);}}

.sk{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:sk 1.5s infinite;border-radius:6px;}
@keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}

.card{background:#fff;border-radius:18px;border:1px solid #eef0f6;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:box-shadow .25s,transform .25s;}
.card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);transform:translateY(-2px);}

.stat{border-radius:14px;padding:16px 20px;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.12);transition:transform .2s,box-shadow .2s;cursor:default;position:relative;overflow:hidden;}
.stat::before{content:'';position:absolute;top:-50%;right:-50%;width:100%;height:100%;background:rgba(255,255,255,.1);border-radius:50%;transform:scale(0);transition:transform .6s;}
.stat:hover::before{transform:scale(3);}
.stat:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,.18);}

.funnel-bar{height:100%;border-radius:99px;transition:width .9s cubic-bezier(.4,0,.2,1);box-shadow:0 2px 6px rgba(0,0,0,.1) inset;}
.bfill{width:100%;border-radius:4px 4px 0 0;transition:height .7s cubic-bezier(.4,0,.2,1);box-shadow:0 -2px 8px rgba(0,0,0,.1) inset;}
.bcol:hover .bfill{opacity:.85;transform:scaleY(1.02);}
.progress-fill{height:100%;border-radius:99px;transition:width .9s cubic-bezier(.4,0,.2,1);box-shadow:0 2px 6px rgba(0,0,0,.1) inset;}

/* ── Search bar ── */
.sbox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #eef0f6;border-radius:10px;padding:7px 14px;flex:1;max-width:260px;min-width:140px;transition:all .2s;}
.sbox:focus-within{border-color:#818cf8;box-shadow:0 0 0 3px rgba(129,140,248,.1);}
.sbox input{border:none;outline:none;font-family:'Roboto',sans-serif;font-size:11.5px;color:#334155;background:transparent;width:100%;}
.sbox input::placeholder{color:#cbd5e1;}

/* ── Filter pill (candidates section) ── */
.fpill{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:99px;border:1px solid #eef0f6;background:#fff;font-size:10.5px;font-weight:600;color:#64748b;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:'Roboto',sans-serif;}
.fpill:hover{border-color:#c7d2fe;color:#4f46e5;}
.fpill.on{background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border-color:#4f46e5;box-shadow:0 4px 12px rgba(79,70,229,.25);}

/* ── Icon btn ── */
.ibtn{display:flex;align-items:center;gap:6px;padding:7px 13px;border-radius:9px;border:1px solid #eef0f6;background:#fff;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:'Roboto',sans-serif;}
.ibtn:hover{border-color:#c7d2fe;color:#4f46e5;transform:translateY(-1px);box-shadow:0 2px 8px rgba(79,70,229,.15);}
.ibtn.on{background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border-color:#4f46e5;box-shadow:0 4px 12px rgba(79,70,229,.25);}

/* ── Job filter bar (inside job section) ── */
.jfbar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f8fafc;border-radius:12px;border:1px solid #eef0f6;margin-bottom:14px;flex-wrap:wrap;}

.met{border-radius:14px;padding:15px 18px;display:flex;align-items:center;gap:13px;border:1px solid rgba(0,0,0,.04);transition:transform .2s,box-shadow .2s;}
.met:hover{transform:translateY(-3px);box-shadow:0 4px 12px rgba(0,0,0,.08);}

.tgrid{display:grid;grid-template-columns:36px 1.4fr 1.2fr 1fr 0.9fr 0.9fr;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;transition:all .15s;overflow:hidden;}
.tgrid:hover{background:linear-gradient(90deg,#f8fafc,#f1f5f9);transform:translateX(2px);}
.tgrid.hdr{padding-bottom:8px;border-bottom:2px solid #f1f5f9;margin-bottom:2px;}

.jcard{border-radius:16px;border:1px solid #eef0f6;background:#fff;padding:18px 20px;transition:all .2s;}
.jcard:hover{box-shadow:0 6px 20px rgba(0,0,0,.08);transform:translateY(-2px);border-color:#ddd6fe;}

.act-btn{background:none;border:none;cursor:pointer;padding:6px;border-radius:7px;color:#94a3b8;transition:all .15s;display:flex;align-items:center;font-family:'Roboto',sans-serif;}
.act-btn:hover{background:#f1f5f9;color:#334155;transform:scale(1.1);}

.dsel{background:transparent;font-family:'Roboto',sans-serif;font-size:10px;font-weight:700;border:none;outline:none;cursor:pointer;color:#334155;}

/* Modal */
.overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);z-index:50;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:#fff;border-radius:20px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.18);animation:slideUp .3s;}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-title{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:20px;}
.field{margin-bottom:14px;}
.field label{display:block;font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;}
.field input,.field textarea,.field select{width:100%;padding:9px 12px;border-radius:10px;border:1px solid #eef0f6;font-family:'Roboto',sans-serif;font-size:12.5px;color:#334155;outline:none;transition:all .15s;background:#fff;}
.field input:focus,.field textarea:focus,.field select:focus{border-color:#818cf8;box-shadow:0 0 0 3px rgba(129,140,248,.1);}
.field textarea{resize:vertical;min-height:80px;}
.btn-primary{background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-family:'Roboto',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:0 4px 12px rgba(79,70,229,.25);}
.btn-primary:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 6px 16px rgba(79,70,229,.35);}
.btn-secondary{background:#f8fafc;color:#64748b;border:1px solid #eef0f6;border-radius:10px;padding:10px 20px;font-family:'Roboto',sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s;}
.btn-secondary:hover{background:#f1f5f9;border-color:#cbd5e1;}

/* Dropdown menu */
.drop-menu{position:absolute;right:0;top:36px;background:#fff;border:1px solid #eef0f6;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:20;min-width:160px;overflow:hidden;animation:dropIn .2s;}
@keyframes dropIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
.drop-item{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:12px;font-weight:500;color:#334155;cursor:pointer;transition:background .12s;font-family:'Roboto',sans-serif;}
.drop-item:hover{background:#f8fafc;}
.drop-item.danger{color:#ef4444;}
.drop-item.danger:hover{background:#fef2f2;}

/* Avatar */
.avatar{border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:transform .2s;}
.avatar:hover{transform:scale(1.05);}

/* Post job button */
.post-btn{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;font-family:'Roboto',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:0 4px 12px rgba(79,70,229,.25);}
.post-btn:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 6px 16px rgba(79,70,229,.35);}

/* Section header */
.sec-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.sec-title{font-size:13px;font-weight:700;color:#0f172a;}
.sec-sub{font-size:10px;color:#94a3b8;margin-top:2px;}

/* ── Dashboard containment ── */
.dash-main{max-width:100%;overflow:hidden;}

@media(max-width:1100px){
  .stat-grid{grid-template-columns:repeat(2,1fr) !important;}
  .chart-grid{grid-template-columns:1fr !important;}
  .metric-grid{grid-template-columns:repeat(2,1fr) !important;}
  .tgrid{grid-template-columns:36px 1.4fr 1fr 0.8fr 0.7fr 0.7fr;gap:4px;padding:8px 10px;font-size:10px;}
}
@media(max-width:850px){
  .stat-grid{grid-template-columns:1fr 1fr !important;}
  .metric-grid{grid-template-columns:1fr !important;}
  .tgrid{grid-template-columns:36px 1fr 1fr 0.8fr;}
  .tgrid .hide-sm{display:none;}
}
`;

const COLORS = ["#3b82f6","#8b5cf6","#f472b6","#22d3ee","#4ade80","#fb923c","#f59e0b","#10b981"];
function Avatar({ name = "", avatarUrl, size = 34 }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name} className="avatar"
        style={{ width:size, height:size, objectFit:"cover", flexShrink:0 }}
        onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
      />
    );
  }
  const initials = name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();
  const bg = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div className="avatar" style={{ width:size, height:size, background:bg, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*.32, fontWeight:700, flexShrink:0 }}>
      {initials}
    </div>
  );
}

function Donut({ segments, total, colors }) {
  const r = 15.9, circ = 2 * Math.PI * r;
  const tot = segments.reduce((a,s) => a + +s.count, 0) || 1;
  let off = 0;
  return (
    <div style={{ width:118, height:118, position:"relative" }}>
      <svg viewBox="0 0 36 36" style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }}>
        <circle cx="18" cy="18" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="4"/>
        {segments.slice(0,5).map((s,i) => {
          const pct = +s.count/tot, dash = pct*circ;
          const el = <circle key={i} cx="18" cy="18" r={r} fill="transparent" stroke={colors[i%colors.length]} strokeWidth="4" strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-off*circ}/>;
          off += pct; return el;
        })}
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:17, fontWeight:900, color:"#0f172a", lineHeight:1 }}>{total}</span>
        <span style={{ fontSize:8, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", marginTop:2 }}>total</span>
      </div>
    </div>
  );
}

// ── Shared hook: portal dropdown anchored to a trigger via fixed positioning ──
function usePortalDropdown() {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const triggerRef = useRef();

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  return { open, setOpen, toggle, pos, triggerRef };
}

// ── Job Action Menu ──
function JobActionMenu({ job, onEdit, onDelete, onStatusChange }) {
  const { open, setOpen, toggle, pos, triggerRef } = usePortalDropdown();

  const menu = open && ReactDOM.createPortal(
    <div
      style={{
        position:"fixed", top:pos.top, right:pos.right, zIndex:9999,
        background:"#fff", border:"1px solid #eef0f6", borderRadius:12,
        boxShadow:"0 8px 32px rgba(0,0,0,.14)", minWidth:168, overflow:"hidden",
        animation:"dropIn .18s ease",
      }}
    >
      <div className="drop-item" onClick={() => { onEdit(job); setOpen(false); }}><FaEdit size={11}/> Edit Job</div>
      <div className="drop-item" onClick={() => { onStatusChange(job, JOB_STATUS.PUBLISHED); setOpen(false); }}><FaCheck size={11}/> Publish</div>
      <div className="drop-item" onClick={() => { onStatusChange(job, JOB_STATUS.CLOSED); setOpen(false); }}><FaHourglass size={11}/> Close</div>
      <div className="drop-item" onClick={() => { onStatusChange(job, JOB_STATUS.DRAFT); setOpen(false); }}><FaFileAlt size={11}/> Set Draft</div>
      <div style={{ height:1, background:"#f1f5f9", margin:"3px 0" }}/>
      <div className="drop-item danger" onClick={() => { onDelete(job.id); setOpen(false); }}><FaTrash size={11}/> Delete Job</div>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} style={{ display:"inline-flex" }}>
      <button
        className="act-btn"
        onClick={toggle}
        style={{ border:"1px solid #eef0f6", borderRadius:8, padding:"5px 9px", gap:5, display:"flex", alignItems:"center" }}
      >
        <span style={{ fontSize:10, fontWeight:600, color:"#64748b" }}>Actions</span>
        <FaChevronDown size={8} color="#94a3b8" style={{ transition:"transform .2s", transform: open ? "rotate(180deg)" : "none" }}/>
      </button>
      {menu}
    </div>
  );
}

function AppStatusMenu({ appId, currentStatus, onUpdate }) {
  const [local, setLocal] = useState(currentStatus);
  const { open, setOpen, toggle, pos, triggerRef } = usePortalDropdown();

  useEffect(() => { setLocal(currentStatus); }, [currentStatus]);

  const s = APP_STATUS_STYLE[local] || APP_STATUS_STYLE.applied;

  const handleSelect = (st) => {
    setLocal(st);
    setOpen(false);
    onUpdate(appId, st);
  };

  const menu = open && ReactDOM.createPortal(
    <div
      style={{
        position:"fixed", top:pos.top, right:pos.right, zIndex:9999,
        background:"#fff", border:"1px solid #eef0f6", borderRadius:12,
        boxShadow:"0 8px 32px rgba(0,0,0,.14)", minWidth:160, overflow:"hidden",
        padding:"4px 0", animation:"dropIn .18s ease",
      }}
    >
      {Object.values(APPLICATION_STATUS).map(st => {
        const ss = APP_STATUS_STYLE[st];
        const active = local === st;
        return (
          <div
            key={st}
            className="drop-item"
            onClick={() => handleSelect(st)}
            style={{
              background: active ? ss.bg : undefined,
              fontWeight: active ? 700 : 500,
              color: active ? ss.c : "#334155",
              gap:8,
            }}
          >
            <div style={{ width:8, height:8, borderRadius:"50%", background:ss.c, flexShrink:0 }}/>
            <span style={{ flex:1 }}>{ss.label}</span>
            {active && <FaCheck size={8} color={ss.c}/>}
          </div>
        );
      })}
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} style={{ display:"inline-flex" }}>
      <div
        onClick={toggle}
        style={{
          display:"flex", alignItems:"center", gap:5, cursor:"pointer",
          background:s.bg, color:s.c,
          padding:"4px 10px", borderRadius:99,
          fontSize:10, fontWeight:700,
          border:`1px solid ${s.c}28`,
          boxShadow:"0 1px 3px rgba(0,0,0,.06)",
          transition:"all .15s",
          userSelect:"none",
        }}
      >
        <div style={{ width:6, height:6, borderRadius:"50%", background:s.c, flexShrink:0 }}/>
        {s.label}
        <FaChevronDown size={7} style={{ marginLeft:1, opacity:.6, transition:"transform .2s", transform: open ? "rotate(180deg)" : "none" }}/>
      </div>
      {menu}
    </div>
  );
}

function JobModal({ job, onClose, onSave }) {
  const [form, setForm] = useState({
    title: job?.title || "", description: job?.description || "",
    location: job?.location || "", salary: formatSalary(job?.salary) || "",
    jobType: job?.jobType || "full_time", status: job?.status || JOB_STATUS.DRAFT,
    applicationDeadline: job?.applicationDeadline?.slice(0,10) || "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <p className="modal-title" style={{ margin:0 }}>{job ? "Edit Job" : "Post New Job"}</p>
          <button className="act-btn" onClick={onClose}><FaTimes size={14}/></button>
        </div>
        <div className="field"><label>Job Title</label><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Senior Software Engineer"/></div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the role..."/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div className="field"><label>Location</label><input value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Remote / City"/></div>
          <div className="field"><label>Salary Range</label><input value={form.salary} onChange={e=>set("salary",e.target.value)} placeholder="$60k–$90k"/></div>
          <div className="field"><label>Job Type</label>
            <select value={form.jobType} onChange={e=>set("jobType",e.target.value)}>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div className="field"><label>Status</label>
            <select value={form.status} onChange={e=>set("status",e.target.value)}>
              {Object.values(JOB_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field" style={{ gridColumn:"1/-1" }}><label>Application Deadline</label><input type="date" value={form.applicationDeadline} onChange={e=>set("applicationDeadline",e.target.value)}/></div>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{job ? "Save Changes" : "Post Job"}</button>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const now = new Date();
  const [month, setMonth]         = useState(now.getMonth() + 1);
  const [year]                    = useState(now.getFullYear());
  const [dashData, setDashData]   = useState(null);
  const [jobs, setJobs]           = useState([]);
  const [dashLoading, setDashLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError]         = useState(null);

  // ── Candidate section filters (top bar) ──
  const [search, setSearch]       = useState("");
  const [posFilter, setPosFilter] = useState("All Positions");
  const [stageFilter, setStageFilter] = useState("All Stages");

  // ── Job section filters (inside job section) ──
  const [jobTitleFilter, setJobTitleFilter] = useState("All Titles");
  const [jobTitleDropOpen, setJobTitleDropOpen] = useState(false);
  const [jobSearch, setJobSearch] = useState("");

  const [jobModal, setJobModal]   = useState(null);
  const [toast, setToast]         = useState(null);
  const jobTitleDropRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setDashLoading(true);
    getDashboardData({ month, year })
      .then(res => setDashData(res))
      .catch(e => { console.error("Dashboard error", e); setError("Failed to load dashboard data. Please try again."); })
      .finally(() => setDashLoading(false));
  }, [month, year]);

  const fetchJobs = () => {
    setJobsLoading(true);
    getAllJobs({ limit: 20 })
      .then(res => {
        const jobsData = res?.data?.data || res?.data || [];
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      })
      .catch(e => console.error("Jobs error", e))
      .finally(() => setJobsLoading(false));
  };
  useEffect(() => { fetchJobs(); }, []);

  useEffect(() => {
    const handler = (e) => { if (jobTitleDropRef.current && !jobTitleDropRef.current.contains(e.target)) setJobTitleDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sum     = dashData?.summary                || {};
  const appSt   = dashData?.applicationStatusStats || [];
  const byPos   = dashData?.applicationsByPosition || [];
  const hiresMo = dashData?.hiresByMonth           || [];
  const recent  = dashData?.recentApplications     || [];

  // Positions for candidate filter (from dashboard data)
  const uniquePositions = ["All Positions", ...Array.from(new Set(byPos.map(p => p.position).filter(Boolean))).slice(0,4)];

  // Job titles for job section filter (from jobs data)
  const uniqueJobTitles = ["All Titles", ...Array.from(new Set(jobs.map(j => j.title).filter(Boolean))).slice(0,6)];

  const stMap  = Object.fromEntries(appSt.map(s => [s.status?.toLowerCase(), +s.count]));
  const fMax   = Math.max(...FUNNEL_STAGES.map(s => stMap[s.key]||0), 1);
  const hMap   = Object.fromEntries(hiresMo.map(h => [h.month?.slice(0,3), +h.count]));
  const hMax   = Math.max(...SHORT.map(m => hMap[m]||0), 1);
  const posT   = byPos.reduce((a,p) => a + +p.count, 0) || sum.totalCandidates || 0;
  const appT   = appSt.reduce((a,s) => a + +s.count, 0);
  const succR  = appT > 0 ? Math.round(((sum.hiresThisMonth||0)/appT)*100) : 0;

  // Filtered candidates
  const filteredRecent = recent.filter(a => {
    const name = (a.candidateName || "").toLowerCase();
    const pos  = (a.position || "").toLowerCase();
    const q    = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || pos.includes(q);
    const matchPos    = posFilter === "All Positions" || a.position === posFilter;
    const matchStage  = stageFilter === "All Stages"  || (a.status||"").toLowerCase() === stageFilter.toLowerCase();
    return matchSearch && matchPos && matchStage;
  });

  // Filtered jobs
  const filteredJobs = jobs.filter(j => {
    const matchTitle = jobTitleFilter === "All Titles" || j.title === jobTitleFilter;
    const q = jobSearch.toLowerCase();
    const matchSearch = !q || (j.title||"").toLowerCase().includes(q) || (j.location||"").toLowerCase().includes(q);
    return matchTitle && matchSearch;
  });

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background:"#fef08a", padding:"1px 2px", borderRadius:2 }}>{part}</mark>
        : part
    );
  };

  const handleSaveJob = async (form) => {
    try {
      // Transform form data to match backend expectations
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        jobType: form.jobType,
        requirements: [], // Backend expects an array
      };

      console.log("Original form data:", form);

      // Parse salary string into object format { min, max, currency }
      if (form.salary && form.salary.trim()) {
        const salaryStr = form.salary.trim();
        // Try to extract numbers from formats like "$60k–$90k", "$60,000-$90,000", "60k-90k", etc.
        const rangeMatch = salaryStr.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*k?\s*[-–—]\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*k?/i);
        const singleMatch = salaryStr.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*k?/i);
        
        if (rangeMatch) {
          let min = parseFloat(rangeMatch[1].replace(/,/g, ''));
          let max = parseFloat(rangeMatch[2].replace(/,/g, ''));
          // If values look like "60k" format (under 1000), multiply by 1000
          if (min < 1000) min *= 1000;
          if (max < 1000) max *= 1000;
          payload.salary = { min, max, currency: "USD" };
        } else if (singleMatch) {
          let val = parseFloat(singleMatch[1].replace(/,/g, ''));
          if (val < 1000) val *= 1000;
          payload.salary = { min: val, max: val, currency: "USD" };
        }
      }

      // Add application deadline if provided
      if (form.applicationDeadline) {
        payload.applicationDeadline = form.applicationDeadline;
      }

      // Add status (for create or update)
      if (form.status) {
        payload.status = form.status;
      }

      console.log("Payload being sent to API:", payload);

      if (jobModal === "new") { 
        await createJob(payload); 
        showToast("Job posted successfully!"); 
      } else { 
        await updateJob(jobModal.id, payload); 
        showToast("Job updated successfully!"); 
      }
      setJobModal(null); 
      fetchJobs();
      getDashboardData({ month, year }).then(res => setDashData(res)).catch(() => {});
    } catch (e) { 
      console.error("Save job error:", e);
      console.error("Error response:", e.response?.data);
      console.error("Validation errors:", e.response?.data?.errors);
      
      // Show first error or generic message
      const errorMsg = e.response?.data?.errors?.[0] || e.response?.data?.error || e.response?.data?.message || "Failed to save job.";
      showToast(errorMsg, "error"); 
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await deleteJob(id);
      showToast("Job deleted.");
      fetchJobs();
      getDashboardData({ month, year }).then(res => setDashData(res)).catch(() => {});
    }
    catch (e) { showToast("Failed to delete job.", "error"); }
  };

  const handleStatusChange = async (job, newStatus) => {
    try {
      await updateJob(job.id, { status: newStatus });
      showToast(`Job set to "${newStatus}".`);
      fetchJobs();
      getDashboardData({ month, year }).then(res => setDashData(res)).catch(() => {});
    }
    catch (e) { showToast("Failed to update status.", "error"); }
  };

  const handleAppStatus = async (appId, newStatus) => {
    // Optimistically update local state so badge reflects new value immediately
    setDashData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        recentApplications: (prev.recentApplications || []).map(a =>
          a.id === appId ? { ...a, status: newStatus } : a
        ),
      };
    });
    try {
      await updateApplicationStatus(appId, { status: newStatus });
      showToast(`Status updated to "${newStatus}".`);
      // Refresh full dashboard data in background (updates counts/funnel)
      getDashboardData({ month, year }).then(res => setDashData(res)).catch(() => {});
    } catch (e) {
      showToast("Failed to update status.", "error");
      // Revert: re-fetch original data
      getDashboardData({ month, year }).then(res => setDashData(res)).catch(() => {});
    }
  };

  const F = { fontFamily:"'Roboto',sans-serif" };
  const Sk = ({ w, h, circle }) => <div className="sk" style={{ width:w, height:h, borderRadius:circle?"50%":6 }}/>;
  const candidateFiltersActive = search || posFilter !== "All Positions" || stageFilter !== "All Stages";
  const jobFiltersActive = jobTitleFilter !== "All Titles" || jobSearch;

  return (
    <>
      <style>{CSS}</style>

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:100, background: toast.type==="error"?"#fef2f2":"#f0fdf4", color: toast.type==="error"?"#dc2626":"#16a34a", border:`1px solid ${toast.type==="error"?"#fecaca":"#bbf7d0"}`, borderRadius:12, padding:"11px 18px", fontSize:12.5, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.1)", ...F }}>
          {toast.msg}
        </div>
      )}

      {jobModal && (
        <JobModal job={jobModal === "new" ? null : jobModal} onClose={() => setJobModal(null)} onSave={handleSaveJob}/>
      )}

      <div className="flex min-h-screen bg-[#F4F6FA]" style={{ ...F }}>
        <SideBar />
        <main className="flex-1 ml-[227px] p-6 pb-14 dash-main">

          {error && (
            <div style={{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:12, padding:"11px 18px", fontSize:12.5, fontWeight:600, marginBottom:16, ...F }}>
              {error}
            </div>
          )}

          {/* ── TOP BAR — only candidate-related filters ── */}
          <div className="pf" style={{ display:"flex", alignItems:"center", gap:6, marginBottom:22, flexWrap:"wrap", width:"100%", boxSizing:"border-box" }}>
            {/* Search */}
            <div className="sbox">
              <FaSearch size={11} color="#94a3b8"/>
              <input placeholder="Search candidates, positions…" value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && <FaTimes size={10} color="#94a3b8" style={{ cursor:"pointer", flexShrink:0 }} onClick={() => setSearch("")}/>}
            </div>

            {/* Divider */}
            <div style={{ width:1, height:24, background:"#eef0f6", flexShrink:0 }}/>

            {/* Position pills */}
            {uniquePositions.map(p => (
              <button key={p} className={`fpill${posFilter===p?" on":""}`} onClick={() => setPosFilter(p)}>{p}</button>
            ))}

            {/* Divider */}
            <div style={{ width:1, height:24, background:"#eef0f6", flexShrink:0 }}/>

            {/* Stage pills */}
            {["All Stages","applied","review","interview","offer","hired"].map(s => (
              <button key={s} className={`fpill${stageFilter===s?" on":""}`} onClick={() => setStageFilter(s)}>
                {s === "All Stages" ? s : APP_STATUS_STYLE[s]?.label || s}
              </button>
            ))}

            {/* Clear */}
            {candidateFiltersActive && (
              <button className="fpill" onClick={() => { setSearch(""); setPosFilter("All Positions"); setStageFilter("All Stages"); }} style={{ marginLeft:"auto", color:"#ef4444", borderColor:"#fecaca" }}>
                <FaTimes size={9}/> Clear
              </button>
            )}

            {filteredRecent.length > 0 && candidateFiltersActive && (
              <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>
                {filteredRecent.length} result{filteredRecent.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* ── STAT CARDS ── */}
          <div className="pf stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20, animationDelay:".05s" }}>
            {[
              { label:"Applications",         val:dashLoading?"—":appT,                      sub:`+${sum.totalApplicantsToday||0} today`,  bg:"linear-gradient(135deg,#3b82f6,#6366f1)", icon:<FaUsers size={14}/> },
              { label:"New Applicants Today",  val:dashLoading?"—":sum.totalApplicantsToday||0, sub:"Since last week",                      bg:"linear-gradient(135deg,#8b5cf6,#a855f7)", icon:<HiOutlineDocumentText size={14}/> },
              { label:"Open Positions",        val:dashLoading?"—":sum.openPositions||0,       sub:"Active listings",                       bg:"linear-gradient(135deg,#0ea5e9,#22d3ee)", icon:<FaBriefcase size={14}/> },
              { label:"Hires This Month",      val:dashLoading?"—":sum.hiresThisMonth||0,      sub:`${succR}% success rate`,                bg:"linear-gradient(135deg,#10b981,#4ade80)", icon:<FaUserCheck size={14}/> },
            ].map((s,i) => (
              <div key={i} className="stat pf" style={{ background:s.bg, animationDelay:`${.07+i*.06}s` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <p style={{ fontSize:9.5, fontWeight:700, opacity:.85, textTransform:"uppercase", letterSpacing:".09em" }}>{s.label}</p>
                  <div style={{ background:"rgba(255,255,255,.2)", borderRadius:8, padding:6, display:"flex" }}>{s.icon}</div>
                </div>
                <div style={{ fontSize:28, fontWeight:900, lineHeight:1, marginBottom:5 }}>{s.val}</div>
                <div style={{ fontSize:9.5, opacity:.8, display:"flex", alignItems:"center", gap:4 }}><FaArrowUp size={8}/> {s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── FUNNEL + DONUT ── */}
          <div className="pf chart-grid" style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:18, marginBottom:18, animationDelay:".12s" }}>
            <div className="card" style={{ padding:"22px 24px" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Recent Applications</p>
              <p style={{ fontSize:10, color:"#94a3b8", marginBottom:18 }}>Pipeline status overview</p>
              {dashLoading
                ? [1,2,3,4,5,6].map(i => <div key={i} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:11 }}><Sk w={72} h={10}/><Sk w="100%" h={7}/><Sk w={28} h={10}/></div>)
                : FUNNEL_STAGES.map(stage => {
                    const count = stMap[stage.key]||0;
                    return (
                      <div key={stage.key} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                        <span style={{ fontSize:10.5, fontWeight:600, color:"#94a3b8", width:76, flexShrink:0 }}>{stage.label}</span>
                        <div style={{ flex:1, background:"#f1f5f9", height:7, borderRadius:99, overflow:"hidden" }}>
                          <div className="funnel-bar" style={{ width:`${Math.round((count/fMax)*100)}%`, background:stage.color }}/>
                        </div>
                        <span style={{ fontSize:10.5, fontWeight:700, color:"#334155", width:32, textAlign:"right" }}>{count}</span>
                      </div>
                    );
                  })
              }
            </div>
            <div className="card" style={{ padding:"22px 24px" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Applications by Position</p>
              <p style={{ fontSize:10, color:"#94a3b8", marginBottom:16 }}>Role distribution</p>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
                {dashLoading ? <Sk w={118} h={118} circle /> : <Donut segments={byPos} total={posT} colors={DONUT_COLORS}/>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {dashLoading
                  ? [1,2,3,4,5].map(i => <Sk key={i} w="100%" h={12}/>)
                  : byPos.slice(0,5).map((p,i) => (
                      <div key={p.position} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:DONUT_COLORS[i%DONUT_COLORS.length] }}/>
                          <span style={{ fontSize:10.5, fontWeight:500, color:"#64748b", maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.position}</span>
                        </div>
                        <span style={{ fontSize:10.5, fontWeight:700, color:"#334155" }}>{p.count}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>

          {/* ── METRICS ── */}
          <div className="pf metric-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:18, animationDelay:".18s" }}>
            {[
              { icon:<FaClock size={14}/>,       label:"Avg. Time to Hire", val:dashLoading?"—":sum.avgTimeToHire||0, unit:"days",  bg:"linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", ic:"#1d4ed8" },
              { icon:<FaCheckCircle size={14}/>, label:"Success Rate",      val:dashLoading?"—":succR,                unit:"%",     bg:"linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", ic:"#059669" },
              { icon:<FaArrowUp size={14}/>,     label:"New Hires",         val:dashLoading?"—":sum.hiresThisMonth||0,unit:"total", bg:"linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", ic:"#d97706" },
            ].map((m,i) => (
              <div key={i} className="met pf" style={{ background:m.bg, animationDelay:`${.2+i*.06}s` }}>
                <div style={{ background:"#fff", padding:9, borderRadius:10, boxShadow:"0 2px 6px rgba(0,0,0,.1)", color:m.ic, display:"flex" }}>{m.icon}</div>
                <div>
                  <p style={{ fontSize:9.5, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>{m.label}</p>
                  <p style={{ fontSize:20, fontWeight:900, color:"#0f172a", lineHeight:1 }}>{m.val} <span style={{ fontSize:9.5, fontWeight:400, color:"#64748b" }}>{m.unit}</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* ── BAR CHART ── */}
          <div className="card pf" style={{ padding:"22px 24px", marginBottom:18, animationDelay:".24s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Hires by Month</p>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"#f8fafc", padding:"6px 12px", borderRadius:9, border:"1px solid #eef0f6" }}>
                <span style={{ fontSize:10, fontWeight:700, color:"#94a3b8" }}>This Month</span>
                <select className="dsel" value={month} onChange={e=>setMonth(+e.target.value)}>
                  {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
                <FaChevronDown size={8} color="#94a3b8"/>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", height:110, gap:5, padding:"0 4px" }}>
              {SHORT.map((m,i) => {
                const h = dashLoading ? 14 : Math.max(((hMap[m]||0)/hMax)*88, 5);
                const active = i+1 === month;
                return (
                  <div key={m} className="bcol" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flex:1 }}>
                    <div style={{ width:"100%", maxWidth:22, background:"#f1f5f9", borderRadius:"5px 5px 0 0", display:"flex", flexDirection:"column", justifyContent:"flex-end", overflow:"hidden", height:88 }}>
                      <div className="bfill" style={{ height:`${h}px`, background: active ? "linear-gradient(to top,#4f46e5,#818cf8)" : "#c7d2fe" }}/>
                    </div>
                    <span style={{ fontSize:8.5, fontWeight:700, color:active?"#0f172a":"#cbd5e1" }}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RECENT APPLICATIONS TABLE ── */}
          <div className="card pf" style={{ padding:"22px 24px", marginBottom:18, animationDelay:".3s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Recent Applications</p>
                {candidateFiltersActive && (
                  <p style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{filteredRecent.length} result{filteredRecent.length !== 1 ? "s" : ""} matching filters</p>
                )}
              </div>
              <button className="ibtn">Most Recent <FaChevronDown size={8}/></button>
            </div>

            <div className="tgrid hdr">
              {["","Candidate Name","Position Applied","Current Stage","Applied Date","Status Date"].map((h,i) => (
                <span key={i} style={{ fontSize:9.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em" }}>{h}</span>
              ))}
            </div>

            {dashLoading
              ? [1,2,3,4,5].map(i => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"36px 1.4fr 1.2fr 1fr 0.9fr 0.9fr", gap:8, padding:"10px 14px", alignItems:"center" }}>
                    <Sk w={34} h={34} circle/><Sk w="80%" h={12}/><Sk w="70%" h={12}/><Sk w={80} h={22}/><Sk w={70} h={12}/><Sk w={70} h={12}/>
                  </div>
                ))
              : filteredRecent.length === 0
                ? <div style={{ padding:"40px 20px", textAlign:"center" }}>
                    <div style={{ fontSize:48, marginBottom:12, opacity:.3 }}>🔍</div>
                    <p style={{ fontSize:14, fontWeight:600, color:"#334155", marginBottom:4 }}>No applications found</p>
                    <p style={{ fontSize:12, color:"#94a3b8" }}>
                      {candidateFiltersActive ? "Try adjusting your filters or search terms" : "Applications will appear here once candidates start applying"}
                    </p>
                  </div>
                : filteredRecent.map(app => {
                    const candidateName = app.candidateName || "Unknown";
                    const headline = app.candidate?.profile?.headline || "";
                    return (
                      <div key={app.id} className="tgrid">
                        <Avatar name={candidateName} avatarUrl={app.candidate?.profile?.avatarUrl} size={34}/>
                        <div>
                          <p style={{ fontSize:12, fontWeight:600, color:"#334155", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {search ? highlightMatch(candidateName, search) : candidateName}
                          </p>
                          <p style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{headline || "—"}</p>
                        </div>
                        <span style={{ fontSize:11.5, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {search ? highlightMatch(app.position || "", search) : app.position}
                        </span>
                        <AppStatusMenu appId={app.id} currentStatus={app.status} onUpdate={handleAppStatus}/>
                        <span style={{ fontSize:11, color:"#94a3b8" }}>{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "—"}</span>
                        <span style={{ fontSize:11, color:"#94a3b8" }}>{app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : "—"}</span>
                      </div>
                    );
                  })
            }
          </div>

          {/* ── JOB OPENINGS ── */}
          <div className="pf" style={{ animationDelay:".36s" }}>

            {/* Section header with Post Job button */}
            <div className="sec-hdr">
              <div>
                <p className="sec-title">Job Openings</p>
                <p className="sec-sub">{jobs.length} total listing{jobs.length !== 1 ? "s" : ""}</p>
              </div>
              <button className="post-btn" onClick={() => setJobModal("new")}>
                <FaPlus size={10}/> Post New Job
              </button>
            </div>

            {/* Job filter bar — title dropdown + search, all in one tidy row */}
            <div className="jfbar">
              {/* Title filter dropdown */}
              <div ref={jobTitleDropRef} style={{ position:"relative" }}>
                <button
                  className={`ibtn${jobTitleFilter !== "All Titles" ? " on" : ""}`}
                  onClick={() => setJobTitleDropOpen(o => !o)}
                  style={{ minWidth:130 }}
                >
                  <FaBriefcase size={9}/>
                  {jobTitleFilter === "All Titles" ? "All Titles" : (jobTitleFilter.length > 22 ? jobTitleFilter.slice(0,22)+"…" : jobTitleFilter)}
                  <FaChevronDown size={8} style={{ marginLeft:"auto" }}/>
                </button>
                {jobTitleDropOpen && (
                  <div className="drop-menu" style={{ minWidth:200, top:38 }}>
                    {uniqueJobTitles.map(t => (
                      <div key={t} className="drop-item" onClick={() => { setJobTitleFilter(t); setJobTitleDropOpen(false); }}
                        style={{ fontWeight: jobTitleFilter === t ? 700 : 400 }}>
                        {jobTitleFilter === t && <FaCheck size={9} color="#4f46e5"/>}
                        {jobTitleFilter !== t && <FaBriefcase size={9} color="#cbd5e1"/>}
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Job search */}
              <div className="sbox" style={{ maxWidth:220, flex:"unset" }}>
                <FaSearch size={10} color="#94a3b8"/>
                <input placeholder="Search jobs…" value={jobSearch} onChange={e => setJobSearch(e.target.value)}/>
                {jobSearch && <FaTimes size={9} color="#94a3b8" style={{ cursor:"pointer", flexShrink:0 }} onClick={() => setJobSearch("")}/>}
              </div>

              {/* Result count */}
              {jobFiltersActive && (
                <>
                  <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>
                    {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
                  </span>
                  <button className="fpill" onClick={() => { setJobTitleFilter("All Titles"); setJobSearch(""); }}
                    style={{ marginLeft:"auto", color:"#ef4444", borderColor:"#fecaca", fontSize:10 }}>
                    <FaTimes size={8}/> Clear
                  </button>
                </>
              )}
            </div>

            {/* Job cards — Actions dropdown only (no duplicate standalone delete/edit) */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {jobsLoading
                ? [1,2,3].map(i => (
                    <div key={i} className="card" style={{ padding:"18px 20px" }}>
                      <Sk w={200} h={14}/><div style={{ height:10 }}/><Sk w="100%" h={10}/><div style={{ height:10 }}/><Sk w="100%" h={6}/>
                    </div>
                  ))
                : filteredJobs.length === 0
                  ? <div style={{ padding:"40px 20px", textAlign:"center", background:"#fff", borderRadius:16, border:"1px solid #eef0f6" }}>
                      <div style={{ fontSize:40, marginBottom:12, opacity:.3 }}>📋</div>
                      <p style={{ fontSize:14, fontWeight:600, color:"#334155", marginBottom:4 }}>No jobs found</p>
                      <p style={{ fontSize:12, color:"#94a3b8" }}>
                        {jobFiltersActive ? "Try adjusting your filters" : "Post your first job to get started"}
                      </p>
                    </div>
                  : filteredJobs.map((job, i) => {
                      const ts  = JOB_TYPE_STYLE[job.jobType] || JOB_TYPE_STYLE["full_time"];
                      const ss  = JOB_STATUS_STYLE[job.status] || JOB_STATUS_STYLE.draft;
                      const appCount  = job.applications?.length ?? Number(job.totalApplications ?? 0);
                      const hireCount = job.applications?.filter(a=>a.status==="hired").length ?? Number(job.hiredCount ?? 0);
                      const pct = appCount > 0 ? Math.min(Math.round((hireCount / appCount)*100), 100) : 0;

                      return (
                        <div key={job.id} className="jcard pf" style={{ animationDelay:`${.36+i*.04}s` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                                <p style={{ fontSize:13.5, fontWeight:700, color:"#0f172a" }}>{job.title}</p>
                                <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 9px", borderRadius:99, background:ts.bg, color:ts.c }}>{ts.label}</span>
                                <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 9px", borderRadius:99, background:ss.bg, color:ss.c }}>{ss.label}</span>
                              </div>
                              <p style={{ fontSize:11, color:"#94a3b8", maxWidth:500, lineHeight:1.55 }}>
                                {safeStr(job.description)?.slice(0,120)}{safeStr(job.description)?.length>120?"…":""}
                              </p>
                            </div>
                            {/* Single "Actions" dropdown — no duplicate standalone buttons */}
                            <JobActionMenu job={job} onEdit={setJobModal} onDelete={handleDeleteJob} onStatusChange={handleStatusChange}/>
                          </div>

                          <div style={{ display:"flex", gap:16, margin:"10px 0 8px", flexWrap:"wrap" }}>
                            {job.location && <span style={{ fontSize:10.5, color:"#64748b", display:"flex", alignItems:"center", gap:4 }}><FaMapMarkerAlt size={9} color="#94a3b8"/> {safeStr(job.location)}</span>}
                            {formatSalary(job.salary) && <span style={{ fontSize:10.5, color:"#64748b", display:"flex", alignItems:"center", gap:4 }}><FaDollarSign size={9} color="#94a3b8"/> {formatSalary(job.salary)}</span>}
                            <span style={{ fontSize:10.5, color:"#64748b", display:"flex", alignItems:"center", gap:4 }}><FaUsers size={9} color="#94a3b8"/> {appCount} applicants</span>
                            <span style={{ fontSize:10.5, color:"#64748b", display:"flex", alignItems:"center", gap:4 }}><FaUserCheck size={9} color="#94a3b8"/> {hireCount} hired</span>
                            {job.applicationDeadline && <span style={{ fontSize:10.5, color:"#64748b", display:"flex", alignItems:"center", gap:4 }}><FaClock size={9} color="#94a3b8"/> Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>}
                          </div>

                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                            <span style={{ fontSize:9.5, fontWeight:600, color:"#94a3b8" }}>Hiring Progress</span>
                            <span style={{ fontSize:9.5, fontWeight:700, color:"#4f46e5" }}>{pct}%</span>
                          </div>
                          <div style={{ background:"#f1f5f9", borderRadius:99, height:6, overflow:"hidden" }}>
                            <div className="progress-fill" style={{ width:`${pct}%`, background:"linear-gradient(to right,#4f46e5,#818cf8)" }}/>
                          </div>
                        </div>
                      );
                    })
              }
            </div>
          </div>

        </main>
      </div>
    </>
  );
}