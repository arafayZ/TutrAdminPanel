import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateFullAppPDF } from '../utils/generateReport';

const Sidebar = ({ activePage = '', onNavigateDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Retrieve logged-in admin details from local storage or context
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInUserName = storedUser.name || 'Abdul Rafay';

  const handleNavigation = (item) => {
    if (item.id === 'dashboard' && onNavigateDashboard) {
      onNavigateDashboard();
    }
    navigate(item.path);
    setMobileOpen(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    navigate('/login');
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const initialRoute = location.pathname;

    try {
      // Calls generator with navigation, progress setter, and logged-in admin name
      await generateFullAppPDF(navigate, setProgressText, loggedInUserName);
    } catch (error) {
      console.error('Failed to generate full console PDF report:', error);
    } finally {
      // Restore user to their original active route
      navigate(initialRoute);
      setIsGenerating(false);
      setProgressText('');
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      path: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
      ),
    },
    {
      id: 'tutors',
      label: 'TUTORS',
      path: '/tutors',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
        </svg>
      ),
    },
    {
      id: 'students',
      label: 'STUDENTS',
      path: '/students',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
      ),
    },
    {
      id: 'verifications',
      label: 'VERIFICATIONS',
      path: '/verifications',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
    },
    {
      id: 'courses',
      label: 'COURSES',
      path: '/courses',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'REPORTS',
      path: '/reports',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      ),
    },
    {
      id: 'reviews',
      label: 'REVIEWS',
      path: '/reviews',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ),
    },
    {
      id: 'blocked',
      label: 'BLOCKED',
      path: '/blocked',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
        </svg>
      ),
    },
    {
      id: 'chat',
      label: 'MESSAGES',
      path: '/chat',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8M8 14h5m-1 7a9 9 0 10-8.485-6.1L3 21l6.1-.515A8.96 8.96 0 0012 21z"/>
        </svg>
      ),
    },
    {
      id: 'team',
      label: 'TEAM & ACCESS CONTROL',
      path: '/team',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      path: '/settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 p-2 bg-black text-white rounded-lg shadow-lg cursor-pointer"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`w-64 bg-black text-white flex flex-col justify-between p-6 shrink-0 h-screen fixed md:static inset-y-0 left-0 z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-widest uppercase">TUTR</h1>
              <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase">Admin Console</p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-white cursor-pointer"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                activePage.toLowerCase() === item.id.toLowerCase();

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#1F1F1F] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-zinc-800">
          {/* Generate Report Button */}
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full py-3 bg-white text-black font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Compiling PDF...' : 'Generate Report'}
          </button>

          {/* Help Center & Logout */}
          <div className="space-y-1 text-xs">
            <button
              onClick={() => { navigate('/help'); setMobileOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer ${
                location.pathname === '/help' || activePage.toLowerCase() === 'help'
                  ? 'bg-[#1F1F1F] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              HELP CENTER
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-zinc-900 rounded-xl font-semibold text-xs transition-colors w-full text-left cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              LOGOUT
            </button>
          </div>
        </div>
      </aside>

      {/* Generation Progress Modal (White Background) */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin" />
            <h4 className="text-sm font-bold text-gray-900">Generating Full Console Report</h4>
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              {progressText || 'Capturing screen layouts across all admin pages...'}
            </p>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal (White Background) */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Confirm Logout</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Are you sure you want to log out of your admin session?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;