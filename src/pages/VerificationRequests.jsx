import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import AppIcon from '../assets/tutr_icon.png';
import NotificationsPage from './NotificationsPage'; 

const VerificationRequests = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Approved', 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');

  // View State (dashboard / notifications) — FIX: this was missing before
  const [viewState, setViewState] = useState('dashboard');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });

  // Track which card is currently showing the rejection input
  const [activeRejectId, setActiveRejectId] = useState(null);
  
  // Rejection reason input tracking per card ID
  const [rejectionReasons, setRejectionReasons] = useState({});

  // Document Viewer Modal State
  const [viewingDocument, setViewingDocument] = useState(null);

  // Profile Details Modal State (New Feature)
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock Verification Data (3 Pending, 4 Approved, 1 Rejected)
  const [requests, setRequests] = useState([
  // --- 3 PENDING REQUESTS ---
  {
    id: "VER-101",
    name: "Ayesha Khan",
    email: "ayesha.khan@gmail.com",
    phone: "+92 300 4567891",
    subject: "MATHEMATICS",
    degree: "MS Mathematics",
    institution: "University of Karachi",
    experience: "5 Years",
    hourlyRate: "$18/hr",
    bio: "Experienced mathematics tutor specializing in calculus, algebra, trigonometry, and O/A Level mathematics.",
    appliedTime: "APPLIED 2H AGO",
    status: "Pending",
    avatar:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC FRONT",
        type: "image",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "MS DEGREE",
        type: "image",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 3,
        title: "TRANSCRIPT",
        type: "image",
        url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&auto=format&fit=crop&q=80"
      }
    ]
  },

  {
    id: "VER-102",
    name: "Muhammad Hamza",
    email: "hamza.ahmed@gmail.com",
    phone: "+92 321 6789045",
    subject: "COMPUTER SCIENCE",
    degree: "BS Computer Science",
    institution: "FAST NUCES Karachi",
    experience: "3 Years",
    hourlyRate: "$20/hr",
    bio: "Software developer and computer science tutor specializing in programming, data structures, databases, and web development.",
    appliedTime: "APPLIED 5H AGO",
    status: "Pending",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC FRONT",
        type: "image",
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "BSCS DEGREE.PDF",
        type: "pdf",
        fileName: "BSCS_DEGREE.PDF"
      },
      {
        id: 3,
        title: "HEC VERIFICATION",
        type: "missing"
      }
    ]
  },

  {
    id: "VER-103",
    name: "Sana Ahmed",
    email: "sana.ahmed@gmail.com",
    phone: "+92 333 7812456",
    subject: "PHYSICS",
    degree: "MPhil Physics",
    institution: "University of the Punjab",
    experience: "6 Years",
    hourlyRate: "$17/hr",
    bio: "Physics lecturer with experience teaching mechanics, electromagnetism, thermodynamics, and intermediate-level physics.",
    appliedTime: "APPLIED YESTERDAY",
    status: "Pending",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC",
        type: "image",
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "MPHIL DEGREE",
        type: "image",
        url: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 3,
        title: "EXPERIENCE CERTIFICATE",
        type: "image",
        url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&auto=format&fit=crop&q=80"
      }
    ]
  },

  // --- 4 APPROVED REQUESTS ---
  {
    id: "VER-104",
    name: "Bilal Hassan",
    email: "bilal.hassan@gmail.com",
    phone: "+92 301 2345678",
    subject: "CHEMISTRY",
    degree: "MPhil Chemistry",
    institution: "University of Karachi",
    experience: "8 Years",
    hourlyRate: "$22/hr",
    bio: "Experienced chemistry teacher specializing in organic chemistry, physical chemistry, and preparation for board and O/A Level examinations.",
    appliedTime: "APPROVED 3 DAYS AGO",
    status: "Approved",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC",
        type: "image",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "MPHIL DEGREE",
        type: "image",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=80"
      }
    ]
  },

  {
    id: "VER-105",
    name: "Hira Fatima",
    email: "hira.fatima@gmail.com",
    phone: "+92 322 4567812",
    subject: "BIOLOGY",
    degree: "MS Biotechnology",
    institution: "University of Karachi",
    experience: "4 Years",
    hourlyRate: "$16/hr",
    bio: "Biology and biotechnology tutor focusing on genetics, cell biology, molecular biology, and intermediate-level science.",
    appliedTime: "APPROVED 4 DAYS AGO",
    status: "Approved",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC FRONT",
        type: "image",
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "MS DEGREE.PDF",
        type: "pdf",
        fileName: "MS_BIOTECHNOLOGY_DEGREE.PDF"
      }
    ]
  },

  {
    id: "VER-106",
    name: "Usman Raza",
    email: "usman.raza@gmail.com",
    phone: "+92 312 5678934",
    subject: "ENGLISH",
    degree: "MA English Literature",
    institution: "University of Karachi",
    experience: "7 Years",
    hourlyRate: "$15/hr",
    bio: "English language and literature tutor specializing in grammar, academic writing, essay writing, and examination preparation.",
    appliedTime: "APPROVED 1 WEEK AGO",
    status: "Approved",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC",
        type: "image",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "MA DEGREE",
        type: "image",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=80"
      }
    ]
  },

  {
    id: "VER-107",
    name: "Maham Tariq",
    email: "maham.tariq@gmail.com",
    phone: "+92 315 3456789",
    subject: "STATISTICS",
    degree: "MS Statistics",
    institution: "University of the Punjab",
    experience: "5 Years",
    hourlyRate: "$19/hr",
    bio: "Statistics instructor teaching probability, statistical analysis, research methods, SPSS, and introductory data analysis.",
    appliedTime: "APPROVED 1 WEEK AGO",
    status: "Approved",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC",
        type: "image",
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "MS TRANSCRIPT.PDF",
        type: "pdf",
        fileName: "MS_STATISTICS_TRANSCRIPT.PDF"
      }
    ]
  },

  // --- 1 REJECTED REQUEST ---
  {
    id: "VER-108",
    name: "Ahmed Saad",
    email: "ahmed.saad@gmail.com",
    phone: "+92 300 8923456",
    subject: "ECONOMICS",
    degree: "BS Economics",
    institution: "Institute of Business Administration",
    experience: "2 Years",
    hourlyRate: "$14/hr",
    bio: "Economics graduate with experience teaching microeconomics, macroeconomics, business mathematics, and introductory finance.",
    appliedTime: "REJECTED 2 DAYS AGO",
    status: "Rejected",
    rejectionReason:
      "Degree certificate could not be verified. The submitted document was incomplete and unreadable.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    documents: [
      {
        id: 1,
        title: "CNIC",
        type: "image",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: 2,
        title: "UNCLEAR DEGREE CERTIFICATE",
        type: "image",
        url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&auto=format&fit=crop&q=80"
      }
    ]
  }
]);

  // Actions Handling
  const handleApprove = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Tutor Application",
      message: `Are you sure you want to approve ${name} as a verified tutor on TUTR?`,
      action: () => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
        setActiveRejectId(null);
        setConfirmModal({ isOpen: false, title: '', message: '', action: null });
      }
    });
  };

  const handleFinalRejectSubmit = (id, name) => {
    const reason = rejectionReasons[id];
    if (!reason || reason.trim() === '') {
      alert("Please provide a rejection reason before confirming.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Reject Tutor Application",
      message: `Are you sure you want to reject ${name}'s application? Reason: "${reason}"`,
      action: () => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Rejected', rejectionReason: reason } : req));
        setActiveRejectId(null);
        setConfirmModal({ isOpen: false, title: '', message: '', action: null });
      }
    });
  };

  const handleReasonChange = (id, text) => {
    setRejectionReasons(prev => ({ ...prev, [id]: text }));
  };

  const handleCancelReject = (id) => {
    setActiveRejectId(null);
    setRejectionReasons(prev => ({ ...prev, [id]: '' }));
  };

  // Filtered lists
  const filteredRequests = requests.filter(req => {
    const matchesTab = req.status === activeTab;
    const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.degree.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  // Generate PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TUTR - Verification Requests Report', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status View: ${activeTab} | Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableHeaders = [["ID", "Name", "Subject", "Degree", "Applied Time", "Status"]];
    const tableRows = filteredRequests.map(r => [
      r.id,
      r.name,
      r.subject,
      r.degree,
      r.appliedTime,
      r.status
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });

    doc.save(`Verification_Requests_${activeTab}.pdf`);
  };

  // If notifications view is active, render that page instead of the main dashboard
  if (viewState === 'notifications') {
    return <NotificationsPage onBack={() => setViewState('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden relative">
      
      {/* Sidebar */}
      <Sidebar onGenerateReport={handleExportPDF} />

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-y-auto">

        {/* Top Navbar */}
                <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                  <div className="w-48 flex items-center">
                    <img 
                      src={AppIcon} 
                      alt="TUTR Logo" 
                      className="h-9 w-auto object-contain cursor-pointer" 
                      onClick={() => setViewState('dashboard')}
                    />
                  </div>
        
                  <div className="flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                      <svg 
                        className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" 
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
                        placeholder="Search tutors or applications..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all placeholder-gray-400"
                      />
                    </div>
                  </div>
        
                  <div className="flex items-center justify-end gap-4">
                    {/* Notification Icon Button switches active view */}
                    <button 
                      onClick={() => setViewState('notifications')}
                      className={`p-2 rounded-full transition-colors cursor-pointer relative ${
                        viewState === 'notifications' 
                          ? 'bg-black text-white' 
                          : 'text-gray-500 hover:text-black hover:bg-gray-100'
                      }`}
                      title="View Notifications"
                    >
                      <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5 border border-white"></span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                    </button>
        
                    <button className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
        
                    <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
                      <div className="text-right">
                        <p className="text-xs font-bold leading-tight">Emaz Ali Khan</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">ADMIN</p>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                        alt="Admin Avatar" 
                        className="w-8 h-8 rounded-full object-cover border border-gray-200" 
                      />
                    </div>
                  </div>
                </header>

        {/* Content Body */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Section Header & Tab Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Verification Requests</h2>
              <p className="text-xs text-gray-500 mt-1">Review tutor credentials and identity documents for platform approval.</p>
            </div>

            {/* Filter Pill Tabs */}
            <div className="bg-gray-200/70 p-1 rounded-2xl flex items-center text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveTab('Pending');
                  setActiveRejectId(null);
                }}
                className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'Pending'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Pending ({counts.Pending})
              </button>
              <button
                onClick={() => {
                  setActiveTab('Approved');
                  setActiveRejectId(null);
                }}
                className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'Approved'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Approved ({counts.Approved})
              </button>
              <button
                onClick={() => {
                  setActiveTab('Rejected');
                  setActiveRejectId(null);
                }}
                className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'Rejected'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Rejected ({counts.Rejected})
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-6 transition-all"
                >
                  {/* Card Top Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      {/* Clicking Name/Avatar triggers user modal */}
                      <div 
                        onClick={() => setSelectedUser(item)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-2xl object-cover group-hover:opacity-90 transition-opacity" />
                        <div>
                          <h3 className="text-base font-bold text-gray-900 group-hover:underline transition-all flex items-center gap-1.5">
                            {item.name}
                            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                              {item.subject}
                            </span>
                            <span className="text-[11px] text-gray-400">• {item.degree}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {item.appliedTime}
                      </span>
                    </div>

                    {/* Document Previews Container */}
                    <div className="mt-6">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                        VERIFICATION DOCUMENTS
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {item.documents.map((doc) => {
                          if (doc.type === 'image') {
                            return (
                              <div
                                key={doc.id}
                                onClick={() => setViewingDocument(doc)}
                                className="relative group h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer"
                              >
                                <img src={doc.url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                                <span className="absolute bottom-2 left-2 right-2 text-[9px] font-bold text-white uppercase tracking-wider truncate drop-shadow-xs">
                                  {doc.title}
                                </span>
                              </div>
                            );
                          }

                          if (doc.type === 'pdf') {
                            return (
                              <div
                                key={doc.id}
                                onClick={() => setViewingDocument(doc)}
                                className="h-24 rounded-2xl bg-gray-100 border border-gray-200 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-200/70 transition-colors"
                              >
                                <div className="w-7 h-7 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center mb-1 text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 1H7a2 2 0 00-2 2v16a2 2 0 002 2z"/></svg>
                                </div>
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider truncate w-full">
                                  {doc.fileName}
                                </span>
                              </div>
                            );
                          }

                          // Missing Certificate Slot
                          return (
                            <div 
                              key={doc.id}
                              className="h-24 rounded-2xl border-2 border-dashed border-gray-200 p-3 flex flex-col items-center justify-center text-center bg-gray-50/50"
                            >
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-relaxed px-1">
                                {doc.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* DYNAMIC REJECTION TEXTAREA: Reveals when REJECT APPLICATION is clicked */}
                    {activeTab === 'Pending' && activeRejectId === item.id && (
                      <div className="mt-5 animate-in fade-in duration-200">
                        <textarea
                          rows="3"
                          placeholder="Add rejection reason (required for rejection)..."
                          value={rejectionReasons[item.id] || ''}
                          onChange={(e) => handleReasonChange(item.id, e.target.value)}
                          className="w-full bg-[#F8F9FB] rounded-2xl p-4 text-xs border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none placeholder-gray-400 text-gray-800"
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Rejection reason display for already Rejected cards */}
                    {activeTab === 'Rejected' && item.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700">
                        <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Reason for Rejection:</p>
                        <p>{item.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Buttons */}
                  <div className="pt-2">
                    {activeTab === 'Pending' ? (
                      activeRejectId === item.id ? (
                        /* Buttons when Rejection Mode is Active for this card */
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleCancelReject(item.id)}
                            className="py-3 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            CANCEL
                          </button>
                          <button 
                            onClick={() => handleFinalRejectSubmit(item.id, item.name)}
                            className="py-3 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            REJECT
                          </button>
                        </div>
                      ) : (
                        /* Default Action Buttons */
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleApprove(item.id, item.name)}
                            className="py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            APPROVE TUTOR
                          </button>
                          <button 
                            onClick={() => setActiveRejectId(item.id)}
                            className="py-3 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            REJECT APPLICATION
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-between text-xs px-2 py-1">
                        <span className="text-gray-400 font-semibold">Status:</span>
                        <span className={`font-bold ${activeTab === 'Approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-100">
                No verification requests found in state "{activeTab}".
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ---------------- TUTOR DETAILS MODAL ---------------- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            {/* Profile Summary Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-100" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{selectedUser.degree}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {selectedUser.subject}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    selectedUser.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                    selectedUser.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Email</span>
                  <span className="font-semibold text-gray-800 break-all">{selectedUser.email || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Phone</span>
                  <span className="font-semibold text-gray-800">{selectedUser.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Experience</span>
                  <span className="font-semibold text-gray-800">{selectedUser.experience || '3+ Years'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Hourly Rate</span>
                  <span className="font-semibold text-gray-800">{selectedUser.hourlyRate || '$40/hr'}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Biography</span>
                <p className="text-gray-600 leading-relaxed">{selectedUser.bio || 'No bio provided.'}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-black text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DOCUMENT VIEWER MODAL ---------------- */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-gray-100">
            <button 
              onClick={() => setViewingDocument(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              {viewingDocument.title || viewingDocument.fileName}
            </h3>
            {viewingDocument.type === 'image' ? (
              <img src={viewingDocument.url} alt="Document" className="w-full h-80 object-contain rounded-2xl bg-gray-50 border border-gray-100" />
            ) : (
              <div className="w-full h-80 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center p-6 text-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p className="text-xs font-bold text-gray-700">{viewingDocument.fileName}</p>
                <p className="text-[10px] text-gray-400 mt-1">PDF document preview ready for validation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- WHITE BACKGROUND ALERT / CONFIRM MODAL ---------------- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">{confirmModal.title}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', action: null })}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.action}
                className="flex-1 py-2 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VerificationRequests;