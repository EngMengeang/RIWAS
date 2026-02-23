import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaRegBell } from 'react-icons/fa';

const sampleNotifications = [
  {
    id: 1,
    title: "We've receive your application",
    role: 'Backend Developer',
    company: 'CADT',
    time: '1 min',
    read: false,
  },
  {
    id: 2,
    title: 'Interview scheduled',
    role: 'Frontend Developer',
    company: 'RIWAS',
    time: '2 days',
    read: true,
  },
];

const Notifications = () => {
  const [tab, setTab] = useState('new');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('notifications') || 'null');
    if (stored && Array.isArray(stored)) {
      setNotifications(stored);
    } else {
      setNotifications(sampleNotifications);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const toggleRead = (id) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const filtered = notifications.filter(n => (tab === 'new' ? !n.read : true));

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Notification</h1>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setTab('new')}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${tab === 'new' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
          >
            New
          </button>

          <button
            onClick={() => setTab('jobs')}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${tab === 'jobs' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
          >
            Jobs
          </button>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            filtered.map((n) => (
              <div key={n.id} className="bg-white rounded-xl shadow-sm border-t-4 border-green-200 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 ${n.read ? 'opacity-60' : ''}`}>
                      <FaRegBell className="text-xl text-green-600" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{n.title}</h3>
                      <p className="text-sm text-gray-600">{n.role}</p>
                      <p className="text-xs text-gray-400">{n.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{n.time}</span>
                    <button onClick={() => toggleRead(n.id)} className="p-2 text-gray-500 hover:text-gray-700">
                      <FaEllipsisV />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
