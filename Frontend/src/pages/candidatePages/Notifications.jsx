import React, { useState, useEffect } from 'react';
import { getMyApplications } from '../../server/jobapplicationAPI';

// sendApplicationStatusEmail subjects in emailService.js
const STATUS_NOTIFICATION = {
  applied: {
    title: 'Application Received',
    body:  (job) => `Thank you for applying for ${job}. We have received your application.`,
  },
  review: {
    title: 'Application Under Review',
    body:  (job) => `Your application for ${job} is currently under review.`,
  },
  interview: {
    title: 'Interview Scheduled',
    body:  (job) => `Good news! You have been shortlisted for an interview for ${job}.`,
  },
  assessment: {
    title: 'Assessment Stage',
    body:  (job) => `Your application for ${job} has moved to the assessment stage.`,
  },
  offer: {
    title: 'Job Offer Extended',
    body:  (job) => `Congratulations! A job offer has been extended for ${job}.`,
  },
  hired: {
    title: "You've Been Hired!",
    body:  (job) => `Congratulations! You have been hired for ${job}.`,
  },
  rejected: {
    title: 'Application Decision',
    body:  (job) => `Your application for ${job} has been reviewed. Unfortunately it was not successful.`,
  },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)           return `${diff}s ago`;
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30)   return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// Sync application statuses → localStorage notifications, returns merged list
const buildNotifications = (applications) => {
  const seen    = JSON.parse(localStorage.getItem('seenAppStatuses') || '{}');
  const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
  let updated = [...existing];
  let changed = false;

  applications.forEach((app) => {
    const jobTitle = app.job?.title || 'Untitled Job';
    const status   = app.status?.toLowerCase();
    if (!status) return;

    const info = STATUS_NOTIFICATION[status];
    if (!info) return;

    const notifId = `${app.id}-${status}`;
    if (updated.find(n => n.id === notifId)) return; // already exists

    updated = [{
      id:      notifId,
      title:   info.title,
      body:    info.body(jobTitle),
      role:    jobTitle,
      company: app.job?.company?.name || 'RIWAS',
      createdAt: app.updatedAt || app.applied_at || new Date().toISOString(),
      read:    false,
    }, ...updated];

    seen[app.id] = status;
    changed = true;
  });

  if (changed) {
    localStorage.setItem('notifications', JSON.stringify(updated));
    localStorage.setItem('seenAppStatuses', JSON.stringify(seen));
  }

  return updated;
};

const Notifications = () => {
  const [tab, setTab] = useState('new');
  const [notifications, setNotifications] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [, setTick] = useState(0); // drives live time re-render

  // Re-compute relative times every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await getMyApplications({ limit: 50 });
        const apps = res.data || [];
        setNotifications(buildNotifications(apps));
      } catch {
        // fallback to whatever is already in localStorage
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        setNotifications(stored);
      }
    };
    load();
  }, []);

  const saveNotifications = (updated) => {
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const toggleRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    saveNotifications(updated);
    setMenuOpen(null);
  };

  const filtered = tab === 'new'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Title + green underline */}
      <div className="px-8 pt-8 pb-0">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Your Notification</h1>
        <div className="mt-3 h-0.5 w-full bg-green-500" />
      </div>

      <div className="px-8 pt-6 max-w-7xl mx-auto">

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setTab('new')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${tab === 'new'
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            New
          </button>
          <button
            onClick={() => setTab('jobs')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${tab === 'jobs'
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            Jobs
          </button>
        </div>

        {/* Notification list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No notifications</div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between px-4 py-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
              >
                {/* Left: avatar + text */}
                <div className="flex items-center gap-4">
                  {/* Logo avatar */}
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                    <img
                      src="/biglogo.png"
                      alt="logo"
                      className="w-10 h-10 object-contain"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = '#f97316';
                        e.target.parentElement.innerHTML = '<span style="color:white;font-weight:700;font-size:18px">A</span>';
                      }}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    {n.body && <p className="text-xs text-gray-600 mt-0.5">{n.body}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">{n.role}</p>
                    <p className="text-xs text-gray-400">{n.company}</p>
                  </div>
                </div>

                {/* Right: time + 3-dot menu */}
                <div className="flex flex-col items-end gap-1 shrink-0 ml-4 relative">
                  <span className="text-xs text-gray-400">{timeAgo(n.createdAt) || n.time || ''}</span>
                  <button
                    onClick={() => setMenuOpen(menuOpen === n.id ? null : n.id)}
                    className="text-gray-400 hover:text-gray-600 text-lg tracking-widest leading-none px-1"
                  >
                    •••
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen === n.id && (
                    <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                      <button
                        onClick={() => toggleRead(n.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {n.read ? 'Mark as unread' : 'Mark as read'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Close menu on outside click */}
      {menuOpen !== null && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
};

export default Notifications;