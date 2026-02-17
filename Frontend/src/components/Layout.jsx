import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaFileAlt, FaBell, FaClipboardList, FaSignOutAlt, FaBriefcase } from 'react-icons/fa';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/profile', icon: FaUser, label: 'Profile' },
    { path: '/cv', icon: FaFileAlt, label: 'Your CV' },
    { path: '/view-jobs', icon: FaBriefcase, label: 'View Jobs' },
    { path: '/application', icon: FaClipboardList, label: 'Application' },
    { path: '/notifications', icon: FaBell, label: 'Notifications' },
  ];

  const isActive = (path) => {
    if (path === '/view-jobs') {
      return location.pathname === path || 
             location.pathname.startsWith('/apply-job/') ||
             location.pathname.startsWith('/job-details/');
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Persistent across all routes */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-40">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            
            <div>
              <img src="/logo.png" alt="RIWAS" className="h-8" />
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-green-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`text-lg ${active ? 'text-white' : 'text-gray-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};

export default Layout;
