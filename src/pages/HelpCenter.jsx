import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'tutors', label: 'TUTORS', icon: 'M12 14l9-5-9-5-9 5 9 5z' },
    { id: 'students', label: 'STUDENTS', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'verifications', label: 'VERIFICATIONS', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'courses', label: 'COURSES', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'reports', label: 'REPORTS', icon: 'M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'blocked', label: 'BLOCKED', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
    { id: 'settings', label: 'SETTINGS', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const categoryCards = [
    {
      title: 'Verifications & KYC',
      desc: 'Guidelines on evaluating tutor documents, ID checks, and background approvals.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      route: '/verifications'
    },
    {
      title: 'User Management',
      desc: 'Learn how to suspend accounts, handle blocked lists, and update user roles.',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      route: '/students'
    },
    {
      title: 'System Reports',
      desc: 'How to read registration analytics, export CSV data, and track weekly metrics.',
      icon: 'M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      route: '/reports'
    }
  ];

  const faqs = [
    {
      q: 'How do I verify a new tutor application?',
      a: 'Navigate to the Verifications tab from the sidebar. Review the uploaded ID documents, degree certificates, and background credentials, then click Approve or Reject.'
    },
    {
      q: 'What happens when a user is blocked?',
      a: 'Blocking a user immediately revokes their active sessions, disconnects WebSocket real-time feeds, and moves their profile into the Blocked registry.'
    },
    {
      q: 'How do I generate and export system performance reports?',
      a: 'Click the "Generate Report" button on the sidebar or navigate to the Reports tab. You can export data in CSV or PDF format.'
    },
    {
      q: 'How do I assign or edit course categories?',
      a: 'Go to the Courses section to create, update, or reassign level categories such as Matric, Intermediate, O Level, and A Level.'
    },
    {
      q: 'What should I do if a student reports an issue with a tutor?',
      a: 'Review the incident from the Reports queue. If necessary, suspend the tutor profile temporarily while technical or operational support investigates.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCards = categoryCards.filter(
    (card) =>
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden relative">
      
      {/* ---------------- SIDEBAR COMPONENT ---------------- */}
      <Sidebar onGenerateReport={() => setModalConfig({ isOpen: true, type: 'Report', message: 'Generating summary report...' })} />

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <main className="flex-1 flex flex-col overflow-y-auto">

        {/* Hero Header Section */}
        <section className="text-black py-12 px-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            How can we help you, Admin?
          </h2>
          <p className="text-xs text-gray-400 mt-2 max-w-md">
            Search documentation, learn system workflows, or reach out to technical support.
          </p>

          <div className="relative w-full max-w-lg mt-6">
            <svg 
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics, tutorials, or error codes..."
              className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-zinc-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            />
          </div>
        </section>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCards.length > 0 ? (
              filteredCards.map((card, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(card.route)}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                      </svg>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900">{card.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center text-[11px] font-bold text-black gap-1">
                    <span>Explore Section</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-white p-6 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
                No matching topics found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* FAQ Accordion Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 mb-2">Frequently Asked Questions</h3>

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="flex items-center justify-between w-full text-left py-2 font-semibold text-xs text-gray-800 hover:text-black transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {isOpen && (
                      <p className="text-xs text-gray-500 mt-1 pl-1 pr-6 leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 py-2">No matching FAQs found.</p>
            )}
          </div>

          {/* Contact Support Banner */}
          <div className="bg-black text-white p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Need developer or technical assistance?</h4>
              <p className="text-xs text-gray-400 mt-0.5">If you are encountering server bugs or WebSocket connection errors.</p>
            </div>
            <button 
              onClick={() => setShowSupportModal(true)}
              className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors shadow-sm cursor-pointer shrink-0"
            >
              Contact Tech Support
            </button>
          </div>

        </div>
      </main>

      {/* ---------------- MODALS / POPUPS ---------------- */}

      {/* Tech Support Popup Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Technical Support Ticket</h3>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. WebSocket connection drops" 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  rows="4" 
                  placeholder="Detail the technical issue or system error..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black resize-none"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowSupportModal(false);
                  alert('Support ticket successfully dispatched to engineering team.');
                }}
                className="px-4 py-2 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-1">Generate System Report</h3>
            <p className="text-xs text-gray-500 mb-4">Choose the format to compile platform metrics.</p>
            <div className="space-y-2 mb-6">
              <button 
                onClick={() => { setShowReportModal(false); alert('Exporting PDF Report...'); }}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 hover:border-black rounded-xl text-xs font-semibold text-gray-800 flex items-center justify-between transition-all"
              >
                <span>Full System Report (.PDF)</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </button>
              <button 
                onClick={() => { setShowReportModal(false); alert('Exporting CSV Data...'); }}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 hover:border-black rounded-xl text-xs font-semibold text-gray-800 flex items-center justify-between transition-all"
              >
                <span>Raw User Data (.CSV)</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </button>
            </div>
            <button 
              onClick={() => setShowReportModal(false)}
              className="w-full py-2 bg-gray-100 text-gray-600 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HelpCenter;