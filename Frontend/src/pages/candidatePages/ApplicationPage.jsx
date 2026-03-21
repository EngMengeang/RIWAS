import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';
import { getMyApplications } from '../../server/jobapplicationAPI';
import { getWorkflowByApplication } from '../../server/workflowAPI';
import { getWorkflowDefinitions } from '../../server/workflowdefinitionAPI'; // NEW
import { getProfile } from '../../server/profileAPI';

// ─── Default fallback stages (used only if API returns nothing) ───────────────
// Mirrors the old hardcoded array so the UI never breaks during network errors.
const FALLBACK_STAGES = [
  { name: 'Application',  color: '#a78bfa' },
  { name: 'Screening',    color: '#67e8f9' },
  { name: 'Interview',    color: '#6ee7b7' },
  { name: 'Assessment',   color: '#93c5fd' },
  { name: 'References',   color: '#fcd34d' },
  { name: 'Decision',     color: '#f97316' },
  { name: 'Job Offer',    color: '#4ade80' },
];

// ─── Hook: load workflow stages from API, fall back to constants ──────────────
function useWorkflowDefinitions() {
  const [stages, setStages] = useState(FALLBACK_STAGES);

  useEffect(() => {
    getWorkflowDefinitions()
      .then((data) => {
        if (data && data.length > 0) {
          // Normalise to { name, color } so the rest of the component is unchanged
          setStages(data.map((s) => ({ name: s.name, color: s.color || '#6ee7b7' })));
        }
      })
      .catch(() => {
        // Silent — fallback stages already set
      });
  }, []);

  return stages;
}

// ─── Email content map (unchanged from original) ─────────────────────────────
const EMAIL_CONTENT = {
  applied: {
    subject: (job) => `Application Received - ${job}`,
    body: (job) => (
      <>
        <p>Thank you for submitting your application for the <strong>{job}</strong> position at [Company Name].</p>
        <p>We confirm that we have received your application and our recruitment team will review it carefully.
          If your qualifications match our requirements, we will contact you regarding the next steps in the
          recruitment process.</p>
        <p>We appreciate your interest in [Company Name] and thank you for considering us as a potential employer.</p>
      </>
    ),
  },
  review: {
    subject: (job) => `Application Under Review - ${job}`,
    body: (job) => (
      <>
        <p>Your application for <strong>{job}</strong> is currently under review by our recruitment team.</p>
        <p>We are carefully evaluating your qualifications and will be in touch with further updates shortly.
          Thank you for your patience.</p>
      </>
    ),
  },
  interview: {
    subject: (job) => `Interview Scheduled - ${job}`,
    body: (job) => (
      <>
        <p>Good news! You have been shortlisted for an interview for the <strong>{job}</strong> position.</p>
        <p>Our team will reach out shortly with the interview details including the date, time, and format.
          Please ensure you are available and prepared.</p>
      </>
    ),
  },
  assessment: {
    subject: (job) => `Assessment Stage - ${job}`,
    body: (job) => (
      <>
        <p>Your application for <strong>{job}</strong> has progressed to the assessment stage.</p>
        <p>You will receive further instructions regarding the assessment process. Please check your email
          regularly for updates.</p>
      </>
    ),
  },
  offer: {
    subject: (job) => `Job Offer - ${job}`,
    body: (job) => (
      <>
        <p>Congratulations! We are pleased to extend a job offer for the <strong>{job}</strong> position.</p>
        <p>Our HR team will follow up with the full offer letter and next steps. Please review the details
          carefully and do not hesitate to reach out if you have any questions.</p>
      </>
    ),
  },
  hired: {
    subject: (job) => `Welcome Aboard - ${job}`,
    body: (job) => (
      <>
        <p>Congratulations! We are thrilled to confirm that you have been <strong>hired</strong> for the <strong>{job}</strong> position.</p>
        <p>Our onboarding team will be in touch with you shortly with start date details and next steps.
          Welcome to the team!</p>
      </>
    ),
  },
  rejected: {
    subject: (job) => `Application Decision - ${job}`,
    body: (job) => (
      <>
        <p>Thank you for applying for the <strong>{job}</strong> position and for the time you invested in our
          recruitment process.</p>
        <p>After careful consideration, we regret to inform you that we will not be moving forward with your
          application at this time. We encourage you to apply for future openings that match your profile.</p>
      </>
    ),
  },
};

// ─── EmailModal (unchanged from original) ────────────────────────────────────
const EmailModal = ({ jobTitle, candidateName, hrName, hrAvatar, status, onClose }) => {
  const key     = status?.toLowerCase() || 'applied';
  const content = EMAIL_CONTENT[key] || EMAIL_CONTENT.applied;
  const initials = hrName ? hrName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'HR';
  return (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-16 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 leading-snug pr-4">
          Subject: {content.subject(jobTitle)}
        </h2>
        <button
          onClick={onClose}
          className="px-4 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shrink-0"
        >
          Close
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 overflow-hidden shrink-0 flex items-center justify-center">
          {hrAvatar ? (
            <img
              src={hrAvatar}
              alt={hrName || 'HR'}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<span style="color:#15803d;font-weight:700;font-size:13px">${initials}</span>`;
              }}
            />
          ) : (
            <span style={{ color: '#15803d', fontWeight: 700, fontSize: 13 }}>{initials}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{hrName || 'Human Resource Department'}</p>
          <p className="text-xs text-gray-400">to me</p>
        </div>
      </div>
      <div className="border-t border-gray-200 mb-6" />
      <div className="text-sm text-gray-700 leading-relaxed space-y-4">
        <p>Dear {candidateName || 'Candidate'},</p>
        {content.body(jobTitle)}
        <div className="pt-2">
          <p>Kind regards,</p>
          <p>{hrName || 'Human Resources Department'}</p>
          <p>Human Resources Department</p>
          <p>[Company Name]</p>
        </div>
      </div>
    </div>
  </div>
  );
};

// ─── Status / workflow → stage index helpers (updated to use dynamic stages) ──
// These now receive `stages` as a parameter instead of reading a module constant.

const buildStatusMap = (stages) => {
  // Map lowercase stage name → index
  const nameToIdx = {};
  stages.forEach((s, i) => {
    nameToIdx[s.name.toLowerCase()] = i;
  });
  return nameToIdx;
};

const getStageIndex = (status, workflowSteps = [], stages) => {
  const nameToIdx = buildStatusMap(stages);

  // Try to resolve the application `status` string against stage names
  const statusLower = status?.toLowerCase() || '';
  // Direct match by name
  let statusIdx = nameToIdx[statusLower] ?? 0;
  // Legacy keyword fallback (so old `applied`, `review`, `interview`, `offer`, `hired`, `rejected`
  // values still resolve even if HR renamed the stages)
  const LEGACY_FALLBACK = {
    applied:   0,
    review:    Math.min(1, stages.length - 1),
    interview: Math.min(2, stages.length - 1),
    offer:     stages.length - 1,
    hired:     stages.length - 1,
    rejected:  Math.max(stages.length - 2, 0),
  };
  if (statusIdx === 0 && LEGACY_FALLBACK[statusLower] !== undefined) {
    statusIdx = LEGACY_FALLBACK[statusLower];
  }

  // Resolve workflow steps by matching their `step` string against stage names
  const workflowMax = workflowSteps.reduce((max, w) => {
    const stepName = w.step?.toLowerCase().replace(/_/g, ' ') || '';
    const idx = nameToIdx[stepName] ?? nameToIdx[w.step?.toLowerCase()] ?? 0;
    return Math.max(max, idx);
  }, 0);

  return Math.max(statusIdx, workflowMax);
};

// ─── Notification sync (unchanged from original) ─────────────────────────────
const STATUS_NOTIFICATION = {
  applied:    { title: 'Application Received',   body: (job) => `Thank you for applying for ${job}. We have received your application.` },
  review:     { title: 'Application Under Review', body: (job) => `Your application for ${job} is currently under review.` },
  interview:  { title: 'Interview Scheduled',    body: (job) => `Good news! You have been shortlisted for an interview for ${job}.` },
  assessment: { title: 'Assessment Stage',       body: (job) => `Your application for ${job} has moved to the assessment stage.` },
  offer:      { title: 'Job Offer Extended',     body: (job) => `Congratulations! A job offer has been extended for ${job}.` },
  hired:      { title: "You've Been Hired!",     body: (job) => `Congratulations! You have been hired for ${job}.` },
  rejected:   { title: 'Application Decision',   body: (job) => `Your application for ${job} has been reviewed. Unfortunately it was not successful.` },
};

const syncNotificationsFromApplications = (applications) => {
  const stored   = JSON.parse(localStorage.getItem('seenAppStatuses') || '{}');
  const existing = JSON.parse(localStorage.getItem('notifications')   || '[]');
  let updated = [...existing];
  let changed = false;

  applications.forEach((app) => {
    const jobTitle = app.job?.title || 'Untitled Job';
    const status   = app.status?.toLowerCase();
    if (!status) return;
    const previousStatus = stored[app.id];
    if (previousStatus === status) return;
    const info = STATUS_NOTIFICATION[status];
    if (!info) return;
    const notif = {
      id:      `${app.id}-${status}`,
      title:   info.title,
      body:    info.body(jobTitle),
      role:    jobTitle,
      company: app.job?.company?.name || 'RIWAS',
      time:    'Just now',
      read:    false,
    };
    if (!updated.find(n => n.id === notif.id)) {
      updated = [notif, ...updated];
      changed = true;
    }
    stored[app.id] = status;
  });

  if (changed) {
    localStorage.setItem('notifications',    JSON.stringify(updated));
    localStorage.setItem('seenAppStatuses',  JSON.stringify(stored));
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MyApplication = () => {
  // NEW: dynamic stages from API (falls back to FALLBACK_STAGES if API fails)
  const stages = useWorkflowDefinitions();

  const [applications, setApplications]     = useState([]);
  const [workflows, setWorkflows]           = useState({});
  const [recruiterNames, setRecruiterNames] = useState({});
  const [recruiterAvatars, setRecruiterAvatars] = useState({});
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [emailModal, setEmailModal]         = useState(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
    catch { return null; }
  })();
  const candidateName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || 'Candidate'
    : 'Candidate';

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const res  = await getMyApplications({ limit: 50 });
        const apps = res.data || [];
        setApplications(apps);
        syncNotificationsFromApplications(apps);

        const [workflowEntries, recruiterEntries] = await Promise.all([
          Promise.all(
            apps.map(async (app) => {
              try {
                const steps = await getWorkflowByApplication(app.id);
                return [app.id, steps || []];
              } catch { return [app.id, []]; }
            })
          ),
          Promise.all(
            apps.map(async (app) => {
              try {
                const recruiterId = app.job?.postedBy;
                if (!recruiterId) return [app.id, { name: '', avatar: '' }];
                const profile = await getProfile(recruiterId);
                const u = profile?.user;
                const name = u
                  ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || ''
                  : '';
                return [app.id, { name, avatar: profile?.avatarUrl || '' }];
              } catch { return [app.id, { name: '', avatar: '' }]; }
            })
          ),
        ]);
        setWorkflows(Object.fromEntries(workflowEntries));
        setRecruiterNames(Object.fromEntries(recruiterEntries.map(([id, v]) => [id, v.name])));
        setRecruiterAvatars(Object.fromEntries(recruiterEntries.map(([id, v]) => [id, v.avatar])));
      } catch {
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />

      {emailModal && (
        <EmailModal
          jobTitle={emailModal.jobTitle}
          candidateName={emailModal.candidateName}
          hrName={emailModal.hrName}
          hrAvatar={emailModal.hrAvatar}
          status={emailModal.status}
          onClose={() => setEmailModal(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Application</h1>
          <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-sm">Loading applications...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 text-sm mb-6">You haven't applied for any jobs yet.</p>
            <Link to="/view-jobs" className="inline-block px-6 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">
              Browse Jobs
            </Link>
          </div>
        ) : (
          !loading && !error && (
            <div className="space-y-5">
              {applications.map((app) => {
                const jobTitle  = app.job?.title || 'Untitled Job';
                // NEW: pass dynamic `stages` into getStageIndex
                const activeIdx = getStageIndex(app.status, workflows[app.id] || [], stages);
                return (
                  <div key={app.id} className="bg-gray-100 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-0.5">{jobTitle}</h2>
                    <p className="text-sm text-gray-500 mb-5 capitalize">Stage: {app.status}</p>

                    {/* Progress bars — now rendered from dynamic `stages` */}
                    <div className="flex gap-3 mb-5">
                      {stages.map((stage, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div
                            className="w-full h-1.5 rounded-full"
                            style={{
                              background: i <= activeIdx ? stage.color : '#d1d5db',
                              opacity:    i <= activeIdx ? 1 : 0.5,
                            }}
                          />
                          <span className="text-xs text-gray-500 text-center leading-tight">{stage.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setEmailModal({
                        jobTitle,
                        candidateName,
                        hrName:   recruiterNames[app.id]   || '',
                        hrAvatar: recruiterAvatars[app.id] || '',
                        status:   app.status,
                      })}
                      className="px-5 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Email
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyApplication;