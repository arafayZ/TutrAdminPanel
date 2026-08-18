import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NotificationsPage from './NotificationsPage';

const CustomDropdown = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg px-3 py-1.5 text-xs outline-none cursor-pointer flex items-center justify-between gap-2 transition-colors"
      >
        <span>{value || label}</span>
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                value === option
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const BlockedPage = () => {
  // Navigation & View States
  const [activePage, setActivePage] = useState('blocked');
  const [viewState, setViewState] = useState('blocked'); // 'blocked' | 'notifications' | 'dashboard'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [blockedByFilter, setBlockedByFilter] = useState('All');

  // Modal States (White Popups)
  const [selectedBlocked, setSelectedBlocked] = useState(null);
  const [unblockModalUser, setUnblockModalUser] = useState(null);

  // Blocked Users Data (Teachers blocked by Students & vice-versa)
  const [blockedUsers, setBlockedUsers] = useState([
    {
      id: 1,
      name: 'Mubashir',
      role: 'Student',
      userId: 'S-982',
      reason: 'Payment Fraud',
      date: 'Oct 22, 2023',
      blockedBy: 'RAFAY',
      blockedByType: 'tutor', // Blocked by Tutor
      details: 'Multiple chargebacks attempted on tutor booking fees.',
    },
    {
      id: 2,
      name: 'Abdul Rafay',
      role: 'Tutor',
      userId: 'T-120',
      reason: 'Repeated No-Shows',
      date: 'Oct 20, 2023',
      blockedBy: 'ADMIN',
      blockedByType: 'admin',
      details: 'Missed 3 scheduled sessions consecutively without prior notice.',
    },
    {
      id: 3,
      name: 'Dr. Hamza Ahmed',
      role: 'Tutor',
      userId: 'T-104',
      reason: 'Inappropriate Language',
      date: 'Aug 04, 2026',
      blockedBy: 'Ayesha Khan',
      blockedByType: 'student', // Blocked by Student
      details: 'Used unprofessional and rude language during a live chat.',
    },
    {
      id: 4,
      name: 'Usman Raza',
      role: 'Tutor',
      userId: 'T-211',
      reason: 'Unregistered Extra Charges',
      date: 'Jul 29, 2026',
      blockedBy: 'Muhammad Huzaifa',
      blockedByType: 'student',
      details: 'Requested cash payments outside the Tutr platform system.',
    },
    {
      id: 5,
      name: 'Saad Ahmed',
      role: 'Student',
      userId: 'S-402',
      reason: 'Abusive Behavior',
      date: 'Jul 15, 2026',
      blockedBy: 'Usama Khalid',
      blockedByType: 'tutor',
      details: 'Violated community guidelines during a scheduled trial class.',
    },
  ]);

  const filterOptions = ['All', 'By Students', 'By Tutors', 'By Admin'];

  // Filter logic
  const filteredBlockedUsers = blockedUsers.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.blockedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      blockedByFilter === 'All' ||
      (blockedByFilter === 'By Students' && item.blockedByType === 'student') ||
      (blockedByFilter === 'By Tutors' && item.blockedByType === 'tutor') ||
      (blockedByFilter === 'By Admin' && item.blockedByType === 'admin');

    return matchesSearch && matchesFilter;
  });

  // Helper to dynamically load jsPDF scripts if not available in window
  const loadPDFScripts = () => {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf);
        return;
      }

      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
        script2.onload = () => resolve(window.jspdf);
        script2.onerror = reject;
        document.body.appendChild(script2);
      };
      script1.onerror = reject;
      document.body.appendChild(script1);
    });
  };

  // Export PDF Functionality
  const handleExportData = async () => {
    if (filteredBlockedUsers.length === 0) {
      alert('No data available to export.');
      return;
    }

    try {
      await loadPDFScripts();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Blocked Users Report', 14, 20);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
      doc.text(`Total Entries: ${filteredBlockedUsers.length}`, 14, 31);

      // Define Table Columns
      const headers = [['User', 'Role & ID', 'Reason', 'Blocked Date', 'Done By']];

      // Map Data to Table Rows
      const rows = filteredBlockedUsers.map((item) => [
        item.name,
        `${item.role} • ID: ${item.userId}`,
        item.reason,
        item.date,
        item.blockedBy,
      ]);

      // Render AutoTable
      doc.autoTable({
        head: headers,
        body: rows,
        startY: 38,
        theme: 'striped',
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 4 },
      });

      // Save PDF File
      doc.save(`blocked_users_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to generate PDF export. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        activePage={activePage}
        onGenerateReport={() => alert('Generating Blocked Accounts Summary Report...')}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Navbar */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search courses, instructors, blocked users..."
        />

        {/* View Switcher */}
        {viewState === 'notifications' ? (
          <NotificationsPage onBack={() => setViewState('blocked')} />
        ) : (
          <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Blocked Users
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Management of platform-wide restrictions and student/tutor blocking actions.
                </p>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export PDF
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">
                  Filter By Initiator:
                </span>
                <CustomDropdown
                  label="Filter Initiator"
                  value={blockedByFilter}
                  onChange={setBlockedByFilter}
                  options={filterOptions}
                />
              </div>
              <span className="text-gray-400 text-[11px] font-medium">
                Showing {filteredBlockedUsers.length} entries
              </span>
            </div>

            {/* Blocked Users Table Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Recently Blocked Users</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Management of platform-wide restrictions
                  </p>
                </div>
                <button
                  onClick={() => setBlockedByFilter('All')}
                  className="text-xs font-semibold text-gray-500 hover:text-black cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider border-b border-gray-100">
                      <th className="py-3 px-6">User</th>
                      <th className="py-3 px-6">Reason</th>
                      <th className="py-3 px-6">Blocked Date</th>
                      <th className="py-3 px-6">Done By</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBlockedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-400">
                          No blocked records found.
                        </td>
                      </tr>
                    ) : (
                      filteredBlockedUsers.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* User Avatar & Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center uppercase tracking-wider shrink-0">
                                {item.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-xs">
                                  {item.name}
                                </h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {item.role} • ID: {item.userId}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-4 px-6">
                            <span className="font-medium text-gray-800">
                              {item.reason}
                            </span>
                          </td>

                          {/* Blocked Date */}
                          <td className="py-4 px-6 text-gray-500 font-medium">
                            {item.date}
                          </td>

                          {/* Done By Badge */}
                          <td className="py-4 px-6">
                            <span className="bg-gray-200/80 text-gray-900 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase inline-block">
                              {item.blockedBy}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => setSelectedBlocked(item)}
                              className="text-gray-500 hover:text-black font-semibold text-xs cursor-pointer px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => setUnblockModalUser(item)}
                              className="font-bold text-xs text-black hover:underline cursor-pointer"
                            >
                              Unblock
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Popup Modal (White Background) */}
      {selectedBlocked && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 font-bold text-sm flex items-center justify-center uppercase">
                  {selectedBlocked.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {selectedBlocked.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {selectedBlocked.role} (ID: {selectedBlocked.userId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlocked(null)}
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <p>
                <strong className="text-gray-900">Reason:</strong> {selectedBlocked.reason}
              </p>
              <p>
                <strong className="text-gray-900">Blocked Date:</strong> {selectedBlocked.date}
              </p>
              <p>
                <strong className="text-gray-900">Action Issued By:</strong> {selectedBlocked.blockedBy}
              </p>
              <div className="pt-2">
                <strong className="text-gray-900 block mb-1">Additional Context:</strong>
                <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 italic text-gray-800">
                  {selectedBlocked.details}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setSelectedBlocked(null)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Modal (White Background) */}
      {unblockModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Confirm Unblock</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to unblock <span className="font-semibold text-gray-900">{unblockModalUser.name}</span>? This will restore their full access to the Tutr marketplace.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setBlockedUsers((prev) => prev.filter((u) => u.id !== unblockModalUser.id));
                  setUnblockModalUser(null);
                }}
                className="w-full py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Unblock User
              </button>
              <button
                onClick={() => setUnblockModalUser(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedPage;