import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NotificationsPage from './NotificationsPage';

const ReportsPage = () => {
  // Navigation & View States
  const [activePage, setActivePage] = useState('reports');
  const [viewState, setViewState] = useState('reports'); // 'reports' | 'notifications' | 'dashboard'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tab state
  const [activeTab, setActiveTab] = useState('New'); // 'New' | 'Pending' | 'History'

  // Modal States (White Popups)
  const [modalAction, setModalAction] = useState(null); // 'block' | 'warning' | 'dismiss' | null

  // Reports Data
  const [reports, setReports] = useState([
    {
      id: '#TKT-8842',
      title: 'Inappropriate Content Report',
      description: 'Tutor was using offensive language during the session on...',
      reporter: 'Wali Ijaz ul Haq',
      timeAgo: '2m ago',
      submittedDate: 'Submitted Oct 24, 2023 at 14:22',
      status: 'New',
      category: 'Others',
      reportedUser: {
        name: 'Huma',
        role: 'Tutor',
        rating: '4.2',
      },
      previousOffenses: {
        warningsIssued: 2,
        atLimit: true,
      },
    },
    {
      id: '#TKT-8839',
      title: 'Double charge on subscription',
      description: 'The system charged me twice for the premium monthly tutoring...',
      reporter: 'Sarah',
      timeAgo: '14m ago',
      submittedDate: 'Submitted Oct 24, 2023 at 13:58',
      status: 'New',
      category: 'Billing',
      reportedUser: {
        name: 'System Support',
        role: 'Billing',
        rating: 'N/A',
      },
      previousOffenses: {
        warningsIssued: 0,
        atLimit: false,
      },
    },
    {
      id: '#TKT-8835',
      title: 'Video feed flickering issues',
      description: "The interactive whiteboard doesn't load during live sessions",
      reporter: 'Faraz Khan',
      timeAgo: '1h ago',
      submittedDate: 'Submitted Oct 24, 2023 at 13:10',
      status: 'New',
      category: 'Technical',
      reportedUser: {
        name: 'System Tech',
        role: 'Platform',
        rating: 'N/A',
      },
      previousOffenses: {
        warningsIssued: 0,
        atLimit: false,
      },
    },
  ]);

  // Selected ticket for detailed view
  const [selectedTicketId, setSelectedTicketId] = useState('#TKT-8842');

  const selectedTicket = reports.find((r) => r.id === selectedTicketId) || reports[0];

  // Search and Tab filtering
  const filteredReports = reports.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reporter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'New'
        ? item.status === 'New'
        : activeTab === 'Pending'
        ? item.status === 'Pending'
        : item.status === 'History';

    return matchesSearch && matchesTab;
  });

  const handleBlockUser = () => {
    alert(`User ${selectedTicket.reportedUser.name} blocked successfully.`);
    setModalAction(null);
  };

  const handleIssueWarning = () => {
    alert(`Official warning issued to ${selectedTicket.reportedUser.name}.`);
    setModalAction(null);
  };

  const handleDismissReport = () => {
    const remaining = reports.filter((r) => r.id !== selectedTicket.id);
    setReports(remaining);
    setModalAction(null);
    if (remaining.length > 0) {
      setSelectedTicketId(remaining[0].id);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        activePage={activePage}
        onGenerateReport={() => alert('Generating Complaints Summary Report...')}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Navbar */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search ticket ID or user..."
        />

        {/* Main Content Area */}
        {viewState === 'notifications' ? (
          <NotificationsPage onBack={() => setViewState('reports')} />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Reports & Moderation
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage platform-wide user complaints, system tickets, and moderation controls.
              </p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Active Reports
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">24</h3>
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <span>↗</span> 12% from yesterday
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Avg. Response
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">1.2h</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                  <span>⏱</span> Under SLA target
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Resolved Today
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">142</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                  <span>😊</span> 89% satisfaction
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Blocked Users
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">854</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                  <span>🌐</span> Platform integrity
                </p>
              </div>
            </div>

            {/* Main Section: Complaints List & Details View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Complaints Feed */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-gray-900">Complaints</h3>

                  {/* Status Filter Tabs */}
                  <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-500">
                    {['New', 'Pending', 'History'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          activeTab === tab
                            ? 'bg-white text-gray-900 shadow-xs'
                            : 'hover:text-gray-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Complaint Cards List */}
                <div className="space-y-3">
                  {filteredReports.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No complaints found in this view.
                    </div>
                  ) : (
                    filteredReports.map((item) => {
                      const isSelected = selectedTicketId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedTicketId(item.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? 'border-gray-900 bg-white shadow-xs'
                              : 'border-gray-100 hover:border-gray-200 bg-white'
                          }`}
                        >
                          <div className="text-[10px] font-semibold text-gray-400">
                            {item.id}
                          </div>
                          <h4 className="font-bold text-xs text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gray-200 font-bold text-[9px] flex items-center justify-center text-gray-700">
                                {item.reporter[0]}
                              </div>
                              <span className="font-medium text-gray-700">
                                {item.reporter}
                              </span>
                            </div>
                            <span>{item.timeAgo}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Ticket Detail View */}
              {selectedTicket ? (
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                  {/* Header Title & Ticket ID */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Ticket ID: {selectedTicket.id} • {selectedTicket.submittedDate}
                    </p>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Details & Timeline */}
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                          Report Details
                        </h4>
                        <p className="text-xs font-semibold text-gray-800">
                          Category: {selectedTicket.category}
                        </p>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          {selectedTicket.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">
                          Status Timeline
                        </h4>
                        <div className="flex items-start gap-3 text-xs">
                          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            P
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">
                              Report Received
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Oct 24, 2023 • 14:22 PM
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reported User & Actions */}
                    <div className="space-y-4 border-l border-gray-100 pl-4">
                      {/* Reported User Card */}
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                          Reported User
                        </h4>
                        <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-black inline-block"></span>
                              <h5 className="font-bold text-xs text-gray-900">
                                {selectedTicket.reportedUser.name}
                              </h5>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {selectedTicket.reportedUser.role} • Rating: {selectedTicket.reportedUser.rating}★
                            </p>
                          </div>
                          <button className="text-gray-400 hover:text-black text-xs cursor-pointer">
                            ↗
                          </button>
                        </div>
                      </div>

                      {/* Moderation Tools */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Moderation Tools
                        </h4>

                        <button
                          onClick={() => setModalAction('block')}
                          className="w-full bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Block User Permanently
                        </button>

                        <button
                          onClick={() => setModalAction('warning')}
                          className="w-full bg-white border border-red-500 hover:bg-red-50 text-red-600 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                        >
                          Issue Official Warning
                        </button>

                        <button
                          onClick={() => setModalAction('dismiss')}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer"
                        >
                          Dismiss Report
                        </button>
                      </div>

                      {/* Previous Offenses Widget */}
                      <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-gray-400">
                            Previous Offenses
                          </p>
                          <p className="font-bold text-gray-900 mt-0.5">
                            {selectedTicket.previousOffenses.warningsIssued} Warnings Issued
                          </p>
                        </div>
                        {selectedTicket.previousOffenses.atLimit && (
                          <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wide">
                            At Limit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-xs">
                  Select a complaint from the feed to view detailed information.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Block Confirmation Modal (White Background Overlay Box) */}
      {modalAction === 'block' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Confirm Block</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to permanently block <span className="font-semibold text-gray-900">{selectedTicket?.reportedUser.name}</span>? This action will revoke all marketplace access immediately.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleBlockUser}
                className="w-full py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Block Permanently
              </button>
              <button
                onClick={() => setModalAction(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Warning Confirmation Modal (White Background Overlay Box) */}
      {modalAction === 'warning' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Issue Official Warning</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                This will send a formal notice to <span className="font-semibold text-gray-900">{selectedTicket?.reportedUser.name}</span> regarding policy violations.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleIssueWarning}
                className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Send Warning
              </button>
              <button
                onClick={() => setModalAction(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Report Confirmation Modal (White Background Overlay Box) */}
      {modalAction === 'dismiss' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Dismiss Report</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to dismiss ticket <span className="font-semibold text-gray-900">{selectedTicket?.id}</span>?
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleDismissReport}
                className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Dismiss Ticket
              </button>
              <button
                onClick={() => setModalAction(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

export default ReportsPage;