import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NotificationsPage from './NotificationsPage';

// Helper function to format uppercase string to Capital Case
const formatCourseName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Custom Dropdown Component
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
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {label && <span className="text-[10px] uppercase font-bold text-gray-400">{label}:</span>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>{value}</span>
          <span className="text-[10px]">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden py-1 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  value === opt 
                    ? 'bg-black text-white font-semibold' 
                    : 'text-gray-700 hover:bg-black hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TutorManagement = () => {
  // Navigation & View State
  const [viewState, setViewState] = useState('dashboard');

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All Tutors');
  const [categoryFilter, setCategoryFilter] = useState('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Tutor Drawer State
  const [selectedTutor, setSelectedTutor] = useState(null);

  // Mock Tutor Data
  const [tutors, setTutors] = useState([
    {
      id: "TTR-101",
      name: "Dr. Bilal Hassan",
      title: "Ph.D. Computer Science",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      subjects: ["COMPUTER SCIENCE", "PROGRAMMING"],
      rating: 4.8,
      reviewsCount: 126,
      status: "Active",
      credentialVerified: true,
      totalCourses: 12,
      avgRating: 4.82,
      activeStudents: 28,
      reports: "3",
    },
    {
      id: "TTR-102",
      name: "Ayesha Khan",
      title: "M.Sc. Mathematics",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      subjects: ["MATHEMATICS", "CALCULUS"],
      rating: 4.9,
      reviewsCount: 214,
      status: "Active",
      credentialVerified: true,
      totalCourses: 9,
      avgRating: 4.91,
      activeStudents: 32,
      reports: "1",
    },
    {
      id: "TTR-103",
      name: "Muhammad Hamza",
      title: "M.Phil. Physics",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      subjects: ["PHYSICS", "QUANTUM PHYSICS"],
      rating: 4.7,
      reviewsCount: 98,
      status: "Active",
      credentialVerified: true,
      totalCourses: 7,
      avgRating: 4.76,
      activeStudents: 19,
      reports: "2",
    },
    {
      id: "TTR-104",
      name: "Sana Ahmed",
      title: "English Language Specialist",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      subjects: ["ENGLISH", "IELTS"],
      rating: 4.8,
      reviewsCount: 176,
      status: "Active",
      credentialVerified: true,
      totalCourses: 11,
      avgRating: 4.84,
      activeStudents: 25,
      reports: "0",
    },
    {
      id: "TTR-105",
      name: "Usman Ali",
      title: "BS Computer Science",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
      subjects: ["WEB DEVELOPMENT", "JAVASCRIPT"],
      rating: 4.6,
      reviewsCount: 73,
      status: "Pending",
      credentialVerified: false,
      totalCourses: 5,
      avgRating: 4.65,
      activeStudents: 14,
      reports: "1",
    },
    {
      id: "TTR-106",
      name: "Fatima Zahra",
      title: "M.Sc. Chemistry",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      subjects: ["CHEMISTRY", "ORGANIC CHEMISTRY", "INORGANIC CHEMISTRY", "PHYSICS", "URDU"],
      rating: 4.9,
      reviewsCount: 189,
      status: "Active",
      credentialVerified: true,
      totalCourses: 10,
      avgRating: 4.89,
      activeStudents: 27,
      reports: "1",
    },
    {
      id: "TTR-107",
      name: "Hassan Raza",
      title: "M.A. Economics",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      subjects: ["ECONOMICS", "ACCOUNTING"],
      rating: 4.5,
      reviewsCount: 64,
      status: "Blocked",
      credentialVerified: true,
      totalCourses: 6,
      avgRating: 4.57,
      activeStudents: 0,
      reports: "4",
    },
    {
      id: "TTR-108",
      name: "Maryam Siddiqui",
      title: "M.Ed. Education",
      avatar: "https://randomuser.me/api/portraits/women/49.jpg",
      subjects: ["BIOLOGY", "GENERAL SCIENCE"],
      rating: 4.7,
      reviewsCount: 112,
      status: "Active",
      credentialVerified: true,
      totalCourses: 8,
      avgRating: 4.74,
      activeStudents: 21,
      reports: "0",
    },
    {
      id: "TTR-109",
      name: "Ahmed Saeed",
      title: "BS Electrical Engineering",
      avatar: "https://randomuser.me/api/portraits/men/71.jpg",
      subjects: ["MATHEMATICS", "ENGINEERING"],
      rating: 4.6,
      reviewsCount: 87,
      status: "Pending",
      credentialVerified: false,
      totalCourses: 4,
      avgRating: 4.62,
      activeStudents: 9,
      reports: "0",
    },
    {
      id: "TTR-110",
      name: "Iqra Noor",
      title: "M.Sc. Psychology",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      subjects: ["PSYCHOLOGY", "SOCIAL SCIENCE"],
      rating: 4.8,
      reviewsCount: 143,
      status: "Active",
      credentialVerified: true,
      totalCourses: 9,
      avgRating: 4.81,
      activeStudents: 23,
      reports: "2",
    },
  ]);

  // Handle Actions - Automatically verifies credentials when activated
  const handleToggleStatus = (tutorId, newStatus) => {
    setTutors(prev => prev.map(t => {
      if (t.id === tutorId) {
        return { 
          ...t, 
          status: newStatus,
          credentialVerified: newStatus === 'Active' ? true : t.credentialVerified 
        };
      }
      return t;
    }));

    if (selectedTutor?.id === tutorId) {
      setSelectedTutor(prev => ({ 
        ...prev, 
        status: newStatus,
        credentialVerified: newStatus === 'Active' ? true : prev.credentialVerified
      }));
    }
  };

  const handleRemoveTutor = (tutorId) => {
    setTutors(prev => prev.filter(t => t.id !== tutorId));
    if (selectedTutor?.id === tutorId) {
      setSelectedTutor(null);
    }
  };

  // Filter Logic
  const filteredTutors = tutors.filter(tutor => {
    const matchesStatus = statusFilter === 'All Tutors' 
      ? true 
      : tutor.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesCategory = categoryFilter === 'All Subjects' 
      ? true 
      : tutor.subjects.some(sub => sub.toLowerCase() === categoryFilter.toLowerCase());

    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Export Data PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TUTR - Tutor Management Report', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${statusFilter} | Category: ${categoryFilter} | Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`, 14, 22);

    const tableHeaders = [["ID", "Name", "Title", "Subjects", "Rating", "Status"]];
    const tableRows = filteredTutors.map(t => [
      t.id, t.name, t.title, t.subjects.map(formatCourseName).join(', '), `${t.rating} (${t.reviewsCount})`, t.status
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });

    doc.save(`Tutor_Report_${statusFilter}_${categoryFilter}.pdf`);
  };

  // Helper function to handle status badge styles dynamically
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-blue-100 text-blue-700';
      case 'Blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden relative">
      <Sidebar onGenerateReport={handleExportPDF} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar 
          viewState={viewState} 
          setViewState={setViewState} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        {viewState === 'notifications' ? (
          <NotificationsPage onBack={() => setViewState('dashboard')} />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tutor Management</h2>
                <p className="text-xs text-gray-500 mt-1">Oversee, verify, and monitor educational professional performance.</p>
              </div>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Export Data
              </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <CustomDropdown
                  label="STATUS"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={['All Tutors', 'Active', 'Pending', 'Blocked']}
                />

                <CustomDropdown
                  label="CATEGORY"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    'All Subjects', 'Computer Science', 'Programming', 'Mathematics', 
                    'Calculus', 'Physics', 'Quantum Physics', 'English', 'IELTS', 
                    'Web Development', 'JavaScript', 'Chemistry', 'Organic Chemistry', 
                    'Economics', 'Accounting', 'Biology', 'General Science', 
                    'Engineering', 'Psychology', 'Social Science'
                  ]}
                />
              </div>

              <div className="text-gray-400 text-xs font-medium">
                Showing {filteredTutors.length} of {tutors.length} tutors
              </div>
            </div>

            {/* Tutors Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-x-auto">
              <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                    <th className="py-4 px-6">TUTOR</th>
                    <th className="py-4 px-6">SUBJECTS OFFERED</th>
                    <th className="py-4 px-6">RATING</th>
                    <th className="py-4 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTutors.length > 0 ? (
                    filteredTutors.map((tutor) => (
                      <tr 
                        key={tutor.id} 
                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                          selectedTutor?.id === tutor.id ? 'bg-gray-50/80' : ''
                        }`}
                        onClick={() => setSelectedTutor(tutor)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img src={tutor.avatar} alt={tutor.name} className="w-9 h-9 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-gray-900 text-xs hover:underline">{tutor.name}</p>
                              <p className="text-[10px] text-gray-400">{tutor.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {tutor.subjects.map((sub, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide">
                                {formatCourseName(sub)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 font-bold text-gray-900">
                            <span>★</span>
                            <span>{tutor.rating.toFixed(1)}</span>
                            <span className="text-gray-400 font-normal text-[10px]">({tutor.reviewsCount})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeStyle(tutor.status)}`}>
                            {tutor.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 text-xs font-medium">
                        No tutors found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Slide-over Right Drawer */}
      {selectedTutor && (
        <aside className="w-96 bg-white border-l border-gray-200 h-screen overflow-y-auto flex flex-col justify-between p-6 shadow-xl z-20 sticky top-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900">Tutor Details</h3>
              <button 
                onClick={() => setSelectedTutor(null)} 
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-2">
              <img src={selectedTutor.avatar} alt={selectedTutor.name} className="w-20 h-20 rounded-2xl object-cover mx-auto" />
              <div>
                <h4 className="font-bold text-gray-900 text-base">{selectedTutor.name}</h4>
                <p className="text-xs text-gray-400">{selectedTutor.title}</p>
              </div>

              {selectedTutor.credentialVerified && (
                <div className="inline-flex items-center gap-1 text-green-600 font-semibold text-[11px] pt-1">
                  <span>✔</span>
                  <span>Credential Verified</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">TOTAL COURSES</span>
                <span className="text-lg font-bold text-gray-900">{selectedTutor.totalCourses}</span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">AVG. RATING</span>
                <span className="text-lg font-bold text-gray-900">{selectedTutor.avgRating}</span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">ACTIVE STUDENTS</span>
                <span className="text-lg font-bold text-gray-900">{selectedTutor.activeStudents}</span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">REPORTS</span>
                <span className="text-lg font-bold text-gray-900">{selectedTutor.reports}</span>
              </div>
            </div>

            {/* Offered Courses Section */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Offered Courses 
              </h5>
              <div className="space-y-2">
                {selectedTutor.subjects.map((subject, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50/80 border border-gray-100 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="text-xs font-bold text-gray-900">
                        {formatCourseName(subject)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-2">
            <button className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer">
              Send Direct Message
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleToggleStatus(selectedTutor.id, selectedTutor.status === 'Active' ? 'Blocked' : 'Active')}
                className="py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {selectedTutor.status === 'Active' ? 'BLOCK' : 'ACTIVATE'}
              </button>
              <button 
                onClick={() => handleRemoveTutor(selectedTutor.id)}
                className="py-2 border border-red-300 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              >
                REMOVE
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default TutorManagement;