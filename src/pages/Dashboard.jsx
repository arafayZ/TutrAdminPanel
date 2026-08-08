import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NotificationsPage from './NotificationsPage'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState('dashboard'); // Handles view switching
  const [viewMode, setViewMode] = useState('monthly');
  const [showAllRegistrations, setShowAllRegistrations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state for popup messages with white background styling
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', message: '' });

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Full dataset for Recent Registrations
  const allRegistrations = [
    { initials: 'HM', name: 'Hassan Malik', email: 'hassan.malik@gmail.com', role: 'Tutor', subject: 'Computer Science', status: 'ACTIVE' },
    { initials: 'AN', name: 'Ayesha Noor', email: 'ayesha.noor@edu.com', role: 'Student', subject: 'Mathematics', status: 'ACTIVE' },
    { initials: 'RK', name: 'Rafay Khan', email: 'rafay.khan@outlook.com', role: 'Tutor', subject: 'Physics', status: 'PENDING' },
    { initials: 'SM', name: 'Sana Mir', email: 'sana.mir@gmail.com', role: 'Student', subject: 'Chemistry', status: 'ACTIVE' },
    { initials: 'IB', name: 'Ibrahim Butt', email: 'ibrahim.butt@domain.com', role: 'Tutor', subject: 'Biology', status: 'ACTIVE' },
    { initials: 'HK', name: 'Hira Khan', email: 'hira.khan@edu.com', role: 'Student', subject: 'English', status: 'PENDING' },
    { initials: 'WA', name: 'Waqas Ali', email: 'waqas.ali@gmail.com', role: 'Tutor', subject: 'Statistics', status: 'ACTIVE' },
    { initials: 'NM', name: 'Nimra Malik', email: 'nimra.malik@outlook.com', role: 'Student', subject: 'Economics', status: 'ACTIVE' },
    { initials: 'FA', name: 'Fahad Ahmed', email: 'fahad.ahmed@tech.io', role: 'Tutor', subject: 'Programming', status: 'PENDING' },
    { initials: 'MS', name: 'Maryam Siddiqui', email: 'maryam.s@edu.com', role: 'Student', subject: 'History', status: 'ACTIVE' },
    { initials: 'OA', name: 'Omer Aslam', email: 'omer.aslam@gmail.com', role: 'Tutor', subject: 'Artificial Intelligence', status: 'ACTIVE' },
    { initials: 'LA', name: 'Laiba Anwar', email: 'laiba.anwar@domain.com', role: 'Student', subject: 'Graphic Design', status: 'PENDING' },
    { initials: 'SJ', name: 'Saad Javed', email: 'saad.javed@edu.com', role: 'Tutor', subject: 'Data Science', status: 'ACTIVE' },
    { initials: 'ER', name: 'Eman Riaz', email: 'eman.riaz@gmail.com', role: 'Student', subject: 'Psychology', status: 'ACTIVE' },
    { initials: 'TM', name: 'Talha Mehmood', email: 'talha.m@tech.io', role: 'Tutor', subject: 'Software Engineering', status: 'PENDING' },
  ];

  // Filter registrations based on search input
  const filteredRegistrations = allRegistrations.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Control visible rows based on toggle state
  const visibleRegistrations = showAllRegistrations 
    ? filteredRegistrations 
    : filteredRegistrations.slice(0, 3);

  // Sample chart data
  const monthlyData = [
    { label: 'JAN', val: 40 },
    { label: 'FEB', val: 65 },
    { label: 'MAR', val: 50 },
    { label: 'APR', val: 75 },
    { label: 'MAY', val: 60 },
    { label: 'JUN', val: 95, active: true },
    { label: 'JUL', val: 80 },
    { label: 'AUG', val: 70 },
    { label: 'SEP', val: 60 },
    { label: 'OCT', val: 75 },
  ];

  const weeklyData = [
    { label: 'MON', val: 30 },
    { label: 'TUE', val: 50 },
    { label: 'WED', val: 70 },
    { label: 'THU', val: 90, active: true },
    { label: 'FRI', val: 60 },
    { label: 'SAT', val: 40 },
    { label: 'SUN', val: 25 },
  ];

  const chartData = viewMode === 'monthly' ? monthlyData : weeklyData;

  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden">
      
      {/* ---------------- SIDEBAR COMPONENT ---------------- */}
      <Sidebar onGenerateReport={() => setModalConfig({ isOpen: true, type: 'Report', message: 'Generating summary report...' })} />

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Reusable Navbar Component */}
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search tutors or applications..."
        />

        {/* Dynamic Main Body Content */}
        {viewState === 'notifications' ? (
          <NotificationsPage />
        ) : (
          <div className="p-8 space-y-8">
            
            {/* Dynamic Greeting Heading */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {getGreeting()}, Admin.
              </h2>
              <p className="text-xs text-gray-500 mt-1">Here's what's happening across the TUTR network today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-semibold rounded-md">+12%</span>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL USERS</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">24,592</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-semibold rounded-md">+5%</span>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL TUTORS</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">1,204</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-semibold rounded-md">+18%</span>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL STUDENTS</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">23,388</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <span className="px-2.5 py-1 bg-red-50 text-red-500 text-[11px] font-semibold rounded-md">High Priority</span>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PENDING VERIFICATIONS</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">42</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-8">
                
                {/* Registrations Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        {viewMode === 'monthly' ? 'Monthly Registrations' : 'Weekly Registrations'}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {viewMode === 'monthly' 
                          ? 'Growth trends for the current fiscal year' 
                          : 'Growth trends for the current week'}
                      </p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl text-[10px] font-bold">
                      <button 
                        onClick={() => setViewMode('weekly')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          viewMode === 'weekly' 
                            ? 'bg-black text-white shadow-xs' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        WEEKLY
                      </button>
                      <button 
                        onClick={() => setViewMode('monthly')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          viewMode === 'monthly' 
                            ? 'bg-black text-white shadow-xs' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        MONTHLY
                      </button>
                    </div>
                  </div>

                  <div className="h-44 flex items-end justify-between pt-6 px-2 gap-3 border-b border-gray-100 pb-2">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div 
                          style={{ height: `${item.val}%` }} 
                          className={`w-full rounded-t-md ${item.active ? 'bg-black' : 'bg-gray-200'} transition-all duration-300`}
                        ></div>
                        <span className="text-[10px] font-bold text-gray-400">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Registrations Table Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-gray-900">Recent Registrations</h3>
                    
                    <button 
                      onClick={() => setShowAllRegistrations(!showAllRegistrations)}
                      className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showAllRegistrations ? 'Show Less' : 'View All'}
                      <svg className={`w-3.5 h-3.5 transition-transform ${showAllRegistrations ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400">
                          <th className="py-3 px-2">USER</th>
                          <th className="py-3 px-2">ROLE</th>
                          <th className="py-3 px-2">SUBJECT</th>
                          <th className="py-3 px-2">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs">
                        {visibleRegistrations.length > 0 ? (
                          visibleRegistrations.map((user, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3.5 px-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
                                  {user.initials}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{user.name}</p>
                                  <p className="text-[10px] text-gray-400">{user.email}</p>
                                </div>
                              </td>
                              <td className="py-3.5 px-2 text-gray-600 font-medium">{user.role}</td>
                              <td className="py-3.5 px-2">
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">
                                  {user.subject}
                                </span>
                              </td>
                              <td className="py-3.5 px-2">
                                <span className={`flex items-center gap-1.5 text-[10px] font-bold ${
                                  user.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    user.status === 'PENDING' ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}></span>
                                  {user.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-4 text-center text-xs text-gray-400">
                              No records matching "{searchQuery}"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column Progress Bars */}
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
                  <h3 className="font-bold text-sm text-gray-900">Teaching Mode</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'MATHEMATICS', val: '42%' },
                      { label: 'LANGUAGES', val: '28%' },
                      { label: 'HUMANITIES', val: '15%' },
                      { label: 'SCIENCES', val: '15%' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[10px] font-bold text-gray-700 uppercase mb-1.5">
                          <span>{item.label}</span>
                          <span>{item.val}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="bg-black h-full" style={{ width: item.val }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
                  <h3 className="font-bold text-sm text-gray-900">Course Categories</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'ENTRY TEST', val: '42%' },
                      { label: 'INTERMEDIATE', val: '28%' },
                      { label: 'MATRIC', val: '15%' },
                      { label: 'O LEVEL', val: '15%' },
                      { label: 'A LEVEL', val: '15%' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[10px] font-bold text-gray-700 uppercase mb-1.5">
                          <span>{item.label}</span>
                          <span>{item.val}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="bg-black h-full" style={{ width: item.val }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}
      </main>

      {/* White Background Popup Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">{modalConfig.type}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">{modalConfig.message}</p>
            <button 
              onClick={() => setModalConfig({ isOpen: false, type: '', message: '' })}
              className="w-full py-2.5 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;