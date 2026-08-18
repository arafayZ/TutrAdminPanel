import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NotificationsPage from './NotificationsPage';

// Helper function to determine status based on last active date (>30 days = Inactive)
const computeStatus = (lastActiveDateStr) => {
  const currentDate = new Date('2026-08-08');
  const lastActiveDate = new Date(lastActiveDateStr);
  const diffInDays = Math.floor((currentDate - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  return diffInDays > 30 ? 'Inactive' : 'Active';
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

const StudentManagement = () => {
  // Navigation & View State
  const [viewState, setViewState] = useState('dashboard');

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All Students');
  const [categoryFilter, setCategoryFilter] = useState('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Student Drawer State & Modal Confirmation State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToBlock, setStudentToBlock] = useState(null);

  // Initial Student Data
  const [students, setStudents] = useState([
    {
      id: "STU-101",
      name: "Sumaika Asif",
      title: "BS Computer Science Student",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      subjects: ["COMPUTER SCIENCE", "PROGRAMMING"],
      rating: 4.8,
      coursesEnrolled: 4,
      engagement: 92,
      lastActiveDate: "2026-08-07",
      totalCourses: 4,
      completedCourses: 2,
      activeTutors: 2,
      reports: "0",
      recentActivity: [
        { title: "Programming Session", detail: "Completed • JavaScript • Aug 07, 2026" },
        { title: "New Course Enrolled", detail: "Enrolled in Data Structures • Aug 05, 2026" }
      ],
    },
    {
      id: "STU-102",
      name: "Hamza Ahmed",
      title: "Intermediate Student",
      avatar: "https://randomuser.me/api/portraits/men/14.jpg",
      subjects: ["MATHEMATICS", "CALCULUS"],
      rating: 4.6,
      coursesEnrolled: 3,
      engagement: 87,
      lastActiveDate: "2026-08-06",
      totalCourses: 3,
      completedCourses: 1,
      activeTutors: 1,
      reports: "1",
      recentActivity: [
        { title: "Calculus Class", detail: "Completed • 2 Hours • Aug 06, 2026" }
      ],
    },
    {
      id: "STU-103",
      name: "Areeba Khan",
      title: "F.Sc. Pre-Engineering Student",
      avatar: "https://randomuser.me/api/portraits/women/25.jpg",
      subjects: ["PHYSICS", "MATHEMATICS"],
      rating: 4.9,
      coursesEnrolled: 5,
      engagement: 95,
      lastActiveDate: "2026-08-07",
      totalCourses: 5,
      completedCourses: 3,
      activeTutors: 2,
      reports: "0",
      recentActivity: [
        { title: "Physics Lecture", detail: "Completed • Mechanics • Aug 07, 2026" }
      ],
    },
    {
      id: "STU-104",
      name: "Muhammad Abdullah",
      title: "IELTS Candidate",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      subjects: ["ENGLISH", "IELTS"],
      rating: 4.7,
      coursesEnrolled: 2,
      engagement: 84,
      lastActiveDate: "2026-08-06",
      totalCourses: 2,
      completedCourses: 0,
      activeTutors: 1,
      reports: "0",
      recentActivity: [
        { title: "IELTS Speaking Practice", detail: "Completed • 1 Hour • Aug 06, 2026" }
      ],
    },
    {
      id: "STU-105",
      name: "Mahnoor Fatima",
      title: "Web Development Student",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      subjects: ["WEB DEVELOPMENT", "JAVASCRIPT"],
      rating: 4.8,
      coursesEnrolled: 3,
      engagement: 90,
      lastActiveDate: "2026-08-07",
      totalCourses: 3,
      completedCourses: 1,
      activeTutors: 2,
      reports: "0",
      recentActivity: [
        { title: "JavaScript Class", detail: "Completed • React Basics • Aug 07, 2026" }
      ],
    },
    {
      id: "STU-106",
      name: "Ali Raza",
      title: "M.Sc. Chemistry Student",
      avatar: "https://randomuser.me/api/portraits/men/36.jpg",
      subjects: ["CHEMISTRY", "ORGANIC CHEMISTRY"],
      rating: 4.5,
      coursesEnrolled: 4,
      engagement: 78,
      lastActiveDate: "2026-06-15",
      totalCourses: 4,
      completedCourses: 2,
      activeTutors: 1,
      reports: "2",
      recentActivity: [
        { title: "Organic Chemistry Class", detail: "Completed • Hydrocarbons • Jun 15, 2026" }
      ],
    },
    {
      id: "STU-107",
      name: "Hira Shah",
      title: "Economics Student",
      avatar: "https://randomuser.me/api/portraits/women/41.jpg",
      subjects: ["ECONOMICS", "ACCOUNTING"],
      rating: 4.6,
      coursesEnrolled: 3,
      engagement: 81,
      lastActiveDate: "2026-05-10",
      totalCourses: 3,
      completedCourses: 1,
      activeTutors: 0,
      reports: "1",
      recentActivity: [
        { title: "Last Course Activity", detail: "Accounting Class • May 10, 2026" }
      ],
    },
    {
      id: "STU-108",
      name: "Usama Tariq",
      title: "Biology Student",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      subjects: ["BIOLOGY", "GENERAL SCIENCE"],
      rating: 4.8,
      coursesEnrolled: 4,
      engagement: 93,
      lastActiveDate: "2026-08-07",
      totalCourses: 4,
      completedCourses: 2,
      activeTutors: 2,
      reports: "0",
      recentActivity: [
        { title: "Biology Class", detail: "Completed • Cell Biology • Aug 07, 2026" }
      ],
    },
    {
      id: "STU-109",
      name: "Laiba Noor",
      title: "Engineering Student",
      avatar: "https://randomuser.me/api/portraits/women/52.jpg",
      subjects: ["ENGINEERING", "MATHEMATICS"],
      rating: 4.7,
      coursesEnrolled: 5,
      engagement: 88,
      lastActiveDate: "2026-08-06",
      totalCourses: 5,
      completedCourses: 2,
      activeTutors: 2,
      reports: "0",
      recentActivity: [
        { title: "Engineering Mathematics", detail: "Completed • Aug 06, 2026" }
      ],
    },
    {
      id: "STU-110",
      name: "Ahmed Hassan",
      title: "Psychology Student",
      avatar: "https://randomuser.me/api/portraits/men/56.jpg",
      subjects: ["PSYCHOLOGY", "SOCIAL SCIENCE"],
      rating: 4.6,
      coursesEnrolled: 2,
      engagement: 80,
      lastActiveDate: "2026-04-20",
      totalCourses: 2,
      completedCourses: 0,
      activeTutors: 1,
      reports: "0",
      recentActivity: [
        { title: "Student Registration", detail: "Account created • Apr 20, 2026" }
      ],
    },
  ]);

  // Handle Confirmed Blocking
  const confirmBlockStudent = () => {
    if (!studentToBlock) return;
    setStudents((prev) => prev.filter((s) => s.id !== studentToBlock.id));
    if (selectedStudent?.id === studentToBlock.id) {
      setSelectedStudent(null);
    }
    setStudentToBlock(null);
  };

  // Filter Logic
  const filteredStudents = students.filter((student) => {
    const studentStatus = computeStatus(student.lastActiveDate);
    const matchesStatus =
      statusFilter === 'All Students' ? true : studentStatus === statusFilter;

    const matchesCategory =
      categoryFilter === 'All Subjects'
        ? true
        : student.subjects.some(
            (sub) => sub.toLowerCase() === categoryFilter.toLowerCase()
          );

    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Export Data PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TUTR - Student Management Report', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status Filter: ${statusFilter} | Category: ${categoryFilter} | Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`, 14, 22);

    const tableHeaders = [
      ['ID', 'Name', 'Status', 'Enrolled Courses'],
    ];
    const tableRows = filteredStudents.map((s) => [
      s.id,
      s.name,
      computeStatus(s.lastActiveDate),
      `${s.coursesEnrolled} Courses (${s.subjects.join(', ')})`,
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    doc.save(`Student_Report_${statusFilter}_${categoryFilter}.pdf`);
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
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Student Management
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Oversee, manage, and monitor student academic participation.
                </p>
              </div>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5"
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
                  options={['All Students', 'Active', 'Inactive']}
                />

                <CustomDropdown
                  label="CATEGORY"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    'All Subjects',
                    'Computer Science',
                    'Programming',
                    'Mathematics',
                    'Calculus',
                    'Physics',
                    'English',
                    'IELTS',
                    'Web Development',
                    'JavaScript',
                    'Chemistry',
                    'Organic Chemistry',
                    'Economics',
                    'Accounting',
                    'Biology',
                    'General Science',
                    'Engineering',
                    'Psychology',
                    'Social Science',
                  ]}
                />
              </div>

              <div className="text-gray-400 text-xs font-medium">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-x-auto">
              <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                    <th className="py-4 px-6">STUDENTS</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6">ENROLLED COURSES</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const currentStatus = computeStatus(student.lastActiveDate);
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            selectedStudent?.id === student.id
                              ? 'bg-gray-50/80'
                              : ''
                          }`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-9 h-9 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-bold text-gray-900 text-xs hover:underline">
                                  {student.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {student.title}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                currentStatus === 'Active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {currentStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-gray-900 mr-1">
                                {student.coursesEnrolled} Courses:
                              </span>
                              {student.subjects.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 text-center text-gray-400 text-xs font-medium"
                      >
                        No students found matching the selected filters.
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
      {selectedStudent && (
        <aside className="w-96 bg-white border-l border-gray-200 h-screen overflow-y-auto flex flex-col justify-between p-6 shadow-xl z-20 sticky top-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Student Details
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-2">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-base">
                  {selectedStudent.name}
                </h4>
                <p className="text-xs text-gray-400">{selectedStudent.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">
                  TOTAL COURSES
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedStudent.totalCourses}
                </span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">
                  COMPLETED
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedStudent.completedCourses}
                </span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">
                  ACTIVE TUTORS
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedStudent.activeTutors}
                </span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">
                  REPORTS
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedStudent.reports}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-900">
                Recent Activity
              </h5>
              <div className="space-y-3 text-xs">
                {selectedStudent.recentActivity?.map((act, index) => (
                  <div key={index} className="flex gap-2.5">
                    <span className="text-black font-bold text-base leading-none">
                      •
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{act.title}</p>
                      <p className="text-[10px] text-gray-400">{act.detail}</p>
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
            <button
              onClick={() => setStudentToBlock(selectedStudent)}
              className="w-full py-2.5 border border-red-300 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            >
              BLOCK STUDENT
            </button>
          </div>
        </aside>
      )}

      {/* Block Confirmation Modal Overlay */}
      {studentToBlock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Block Student</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to block <span className="font-semibold text-gray-900">{studentToBlock.name}</span>? They will no longer be able to access platforms or active sessions.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStudentToBlock(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockStudent}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;