import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRecommendations } from '../../server/recommendationAPI';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../server/notificationAPI';

const getUserId = () => {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) { const u = JSON.parse(raw); if (u?.id) return u.id; }
  } catch { /* ignore */ }
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (!token) return null;
  try { const p = JSON.parse(atob(token.split('.')[1])); return p?.id || p?.userId || p?.sub || null; }
  catch { return null; }
};

// Map backend message_type to human-readable title
const TYPE_TITLE = {
  application_received:        'Application Received',
  application_status_changed:  'Application Status Updated',
  interview_scheduled:         'Interview Scheduled',
  interview_updated:           'Interview Updated',
  job_published:               'New Job Posted',
  job_closed:                  'Job Closed',
  new_message:                 'New Message',
};

const getTitle = (type) =>
  TYPE_TITLE[type] || (type ? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Notification');

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)           return `${diff}s ago`;
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30)   return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'new');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [, setTick] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  // Re-compute relative times every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyNotifications({ limit: 50 });
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  useEffect(() => {
    if (tab !== 'recommended') return;
    if (recommendations.length > 0) return;
    const userId = getUserId();
    if (!userId) { setRecoError('Please log in to see recommendations.'); return; }
    setRecoLoading(true);
    setRecoError('');
    getRecommendations(userId, 10)
      .then(data => setRecommendations(data.recommendations || []))
      .catch((err) => {
        const detail = err?.response?.data?.detail;
        const error = err?.response?.data?.error;
        const message = err?.response?.data?.message;
        setRecoError(
          detail ||
          error ||
          message ||
          'Could not load recommendations. Please try again.'
        );
      })
      .finally(() => setRecoLoading(false));
  }, [tab]);

  const toggleRead = async (notif) => {
    setMenuOpen(null);
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
      } catch { /* ignore */ }
    } else {
      // Already read — optimistic UI toggle (no backend unread endpoint needed)
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, is_read: false } : n)
      );
    }
  };

  const handleDelete = async (id) => {
    setMenuOpen(null);
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
    finally { setMarkingAll(false); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filtered = tab === 'new'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Title + green underline */}
      <div className="px-8 pt-8 pb-0">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Your Notifications</h1>
        <div className="mt-3 h-0.5 w-full bg-green-500" />
      </div>

      <div className="px-8 pt-6 max-w-7xl mx-auto">

        {/* Tabs + Mark all read */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {['new', 'jobs', 'recommended'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors border capitalize
                  ${tab === t
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                {t === 'new' ? `New${unreadCount > 0 ? ` (${unreadCount})` : ''}` : t === 'recommended' ? 'Recommended' : 'All'}
              </button>
            ))}
          </div>
          {tab !== 'recommended' && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
            >
              {markingAll ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* ── Recommended Jobs Section ── */}
        {tab === 'recommended' && (
          <div className="space-y-3">
            {recoLoading && (
              <p className="py-12 text-center text-gray-400 text-sm">Loading recommendations...</p>
            )}
            {!recoLoading && recoError && (
              <p className="py-12 text-center text-red-400 text-sm">{recoError}</p>
            )}
            {!recoLoading && !recoError && recommendations.length === 0 && (
              <p className="py-12 text-center text-gray-400 text-sm">No recommendations yet. Complete your profile to get started.</p>
            )}
            {!recoLoading && !recoError && recommendations.map((rec) => (
              <div
                key={rec.job_id}
                className="flex items-center justify-between px-4 py-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/job-details/${rec.job_id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                    <img src="/biglogo.png" alt="logo" className="w-10 h-10 object-contain"
                      onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span style="color:white;font-weight:700;font-size:18px;background:#22c55e;width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:50%">J</span>'; }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
                    {rec.skills && rec.skills !== "" && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{rec.skills}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">Match</span>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.round(rec.final_score * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-green-600">{Math.round(rec.final_score * 100)}%</span>
                    </div>
                    {rec.gemini_score > 0 && (
                      <p className="text-xs text-blue-500 mt-0.5">AI resume match: {Math.round(rec.gemini_score * 100)}%</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                  <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-medium">#{rec.rank}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification list */}
        {tab !== 'recommended' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading notifications…</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              {tab === 'new' ? 'No unread notifications' : 'No notifications'}
            </div>
          ) : (
            filtered.map((n) => {
              const avatarUrl = n.sender?.profilePicture;
              const jobTitle  = n.application?.job?.title || '';
              const company   = n.application?.job?.company_name || 'RIWAS';
              return (
                <div
                  key={n.id}
                  className={`flex items-center justify-between px-4 py-4 border rounded-xl transition-colors
                    ${n.is_read ? 'bg-white border-gray-200' : 'bg-green-50 border-green-200'}`}
                >
                  {/* Left: avatar + text */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="sender" className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src="/biglogo.png"
                          alt="logo"
                          className="w-10 h-10 object-contain"
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.background = '#22c55e';
                            e.target.parentElement.innerHTML = '<span style="color:white;font-weight:700;font-size:18px">R</span>';
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{getTitle(n.message_type)}</p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
                        )}
                      </div>
                      {n.content && <p className="text-xs text-gray-600 mt-0.5">{n.content}</p>}
                      {jobTitle  && <p className="text-xs text-gray-500 mt-0.5">{jobTitle}</p>}
                      <p className="text-xs text-gray-400">{company}</p>
                    </div>
                  </div>

                  {/* Right: time + 3-dot menu */}
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4 relative">
                    <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                    <button
                      onClick={() => setMenuOpen(menuOpen === n.id ? null : n.id)}
                      className="text-gray-400 hover:text-gray-600 text-lg tracking-widest leading-none px-1"
                    >
                      •••
                    </button>

                    {/* Dropdown menu */}
                    {menuOpen === n.id && (
                      <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                        <button
                          onClick={() => toggleRead(n)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {n.is_read ? 'Mark as unread' : 'Mark as read'}
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}
      </div>

      {/* Close menu on outside click */}
      {menuOpen !== null && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
};

export default Notifications;