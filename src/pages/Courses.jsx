import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NotificationsPage from './NotificationsPage';

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
    <div className="flex items-center gap-2 relative w-full sm:w-auto" ref={dropdownRef}>
      {label && <span className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">{label}:</span>}
      
      <div className="relative flex-1 sm:flex-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg px-3 py-1.5 text-xs flex items-center justify-between sm:justify-start gap-2 cursor-pointer transition-colors"
        >
          <span className="truncate">{value}</span>
          <span className="text-[10px] flex-shrink-0">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden py-1 max-h-60 overflow-y-auto">
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

const CourseManagement = () => {
  const [viewState, setViewState] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [courses, setCourses] = useState([
    {
      id: "CRS-201",
      title: "Advanced Physics & Mechanics",
      category: "Physics",
      thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=150&auto=format&fit=crop&q=80",
      instructor: "Dr. Hamza Malik",
      status: "Active",
      enrolledStudents: 142,
      rating: 4.9,
      duration: "12 Weeks",
      totalModules: 10,
      completionRate: "88%",
      description: "Comprehensive study covering core principles of modern mechanics, energy dynamics, fluid dynamics, and quantum physics fundamentals tailored for academic excellence.",
      features: [
        { label: "24 Classes per month", iconType: "book" },
        { label: "5:00 P.M - 7:00 P.M", iconType: "clock" },
        { label: "Monday to Thursday", iconType: "calendar" },
        { label: "Online", iconType: "mode" },
        { label: "Gulshan-e-Iqbal, Karachi", iconType: "location" },
        { label: "RS. 12,000", iconType: "price" }
      ]
    },
    {
      id: "CRS-202",
      title: "Full-Stack Web Development",
      category: "Web Development",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80",
      instructor: "Sara Ahmed",
      status: "Active",
      enrolledStudents: 230,
      rating: 4.8,
      duration: "16 Weeks",
      totalModules: 14,
      completionRate: "92%",
      description: "Master real-world application engineering from dynamic front-end UI frameworks like React to production-grade Java Spring Boot and Node.js microservices.",
      features: [
        { label: "32 Classes total", iconType: "book" },
        { label: "8:00 P.M - 10:00 P.M", iconType: "clock" },
        { label: "Tuesday, Thursday & Saturday", iconType: "calendar" },
        { label: "Tutor's Home", iconType: "mode" },
        { label: "Shadman Town, Lahore", iconType: "location" },
        { label: "RS. 18,000", iconType: "price" }
      ]
    },
    {
      id: "CRS-203",
      title: "IELTS Academic Masterclass",
      category: "English",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&auto=format&fit=crop&q=80",
      instructor: "Bilal Farooq",
      status: "Active",
      enrolledStudents: 98,
      rating: 4.7,
      duration: "6 Weeks",
      totalModules: 6,
      completionRate: "80%",
      description: "Intensive training program focused on IELTS Academic reading, listening, essay writing, and interactive mock speaking assessments.",
      features: [
        { label: "12 Mock Tests & Exercises", iconType: "book" },
        { label: "4:00 P.M - 6:00 P.M", iconType: "clock" },
        { label: "Saturday & Sunday", iconType: "calendar" },
        { label: "Student's Home", iconType: "mode" },
        { label: "Nazimabad, Karachi", iconType: "location" },
        { label: "RS. 15,000", iconType: "price" }
      ]
    },
    {
      id: "CRS-204",
      title: "Organic Chemistry Fundamentals",
      category: "Chemistry",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150&auto=format&fit=crop&q=80",
      instructor: "Prof. Nida Zain",
      status: "Archived",
      enrolledStudents: 64,
      rating: 4.5,
      duration: "8 Weeks",
      totalModules: 8,
      completionRate: "75%",
      description: "In-depth overview of chemical structures, stereochemistry, reaction mechanisms, and foundational lab safety procedures.",
      features: [
        { label: "16 Interactive Lectures", iconType: "book" },
        { label: "3:00 P.M - 5:00 P.M", iconType: "clock" },
        { label: "Monday & Wednesday", iconType: "calendar" },
        { label: "Tutor's Home", iconType: "mode" },
        { label: "Clifton, Karachi", iconType: "location" },
        { label: "RS. 10,000", iconType: "price" }
      ]
    },
    {
      id: "CRS-205",
      title: "Calculus & Linear Algebra",
      category: "Mathematics",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&auto=format&fit=crop&q=80",
      instructor: "Tariq Mahmood",
      status: "Draft",
      enrolledStudents: 0,
      rating: 0,
      duration: "10 Weeks",
      totalModules: 8,
      completionRate: "0%",
      description: "Analytical breakdown of differential equations, matrix operations, vector spaces, and mathematical modeling techniques.",
      features: [
        { label: "20 Problem Solving Workshops", iconType: "book" },
        { label: "6:00 P.M - 8:00 P.M", iconType: "clock" },
        { label: "Friday & Sunday", iconType: "calendar" },
        { label: "Online", iconType: "mode" },
        { label: "Remote", iconType: "location" },
        { label: "RS. 11,000", iconType: "price" }
      ]
    },
  ]);

  const renderFeatureIcon = (type, label = '') => {
    const modeText = (label || '').toLowerCase();

    if (modeText.includes('online') || (type === 'mode' && modeText.includes('online'))) {
      return (
        <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="7" y="2" width="10" height="20" rx="2" ry="2" strokeWidth="1.8" />
          <line x1="11" y1="18" x2="13" y2="18" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (modeText.includes("tutor's home") || modeText.includes("tutor home")) {
      return (
        <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    }

    if (modeText.includes("student's home") || modeText.includes("student home")) {
      return (
        <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }

    switch (type) {
      case 'book':
        return (
          <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'location':
        return (
          <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'price':
      default:
        return (
          <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.8"/>
            <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
            <path strokeLinecap="round" strokeWidth="1.8" d="M6 9v0M18 15v0"/>
          </svg>
        );
    }
  };

  const confirmDeleteCourse = () => {
    if (!courseToDelete) return;
    setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
    if (selectedCourse?.id === courseToDelete.id) {
      setSelectedCourse(null);
    }
    setCourseToDelete(null);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesStatus =
      statusFilter === 'All Statuses' ? true : course.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'All Categories'
        ? true
        : course.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TUTR - Course Management Report', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status Filter: ${statusFilter} | Category: ${categoryFilter} | Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`, 14, 22);

    const tableHeaders = [
      ['ID', 'Course Title', 'Category', 'Instructor', 'Status', 'Enrolled'],
    ];
    const tableRows = filteredCourses.map((c) => [
      c.id,
      c.title,
      c.category,
      c.instructor,
      c.status,
      `${c.enrolledStudents} Students`,
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    doc.save(`Course_Report_${statusFilter}_${categoryFilter}.pdf`);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Course Management
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Create, audit, and organize educational modules and active curricula.
                </p>
              </div>
              <div className="flex items-center gap-3">
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
            </div>

            {/* Responsive Filter Container */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <CustomDropdown
                  label="STATUS"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={['All Statuses', 'Active', 'Archived', 'Draft']}
                />

                <CustomDropdown
                  label="CATEGORY"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    'All Categories',
                    'Physics',
                    'Web Development',
                    'English',
                    'Chemistry',
                    'Mathematics',
                    'Economics',
                    'Biology',
                  ]}
                />
              </div>

              <div className="text-gray-400 text-xs font-medium self-end sm:self-auto pt-1 sm:pt-0">
                Showing {filteredCourses.length} of {courses.length} courses
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-x-auto">
              <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                    <th className="py-4 px-6">COURSE</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6">INSTRUCTOR</th>
                    <th className="py-4 px-6">ENROLLED</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => {
                      return (
                        <tr
                          key={course.id}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            selectedCourse?.id === course.id
                              ? 'bg-gray-50/80'
                              : ''
                          }`}
                          onClick={() => setSelectedCourse(course)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-12 h-9 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-bold text-gray-900 text-xs hover:underline">
                                  {course.title}
                                </p>
                                <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                                  {course.category}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                course.status === 'Active'
                                  ? 'bg-green-100 text-green-700'
                                  : course.status === 'Draft'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {course.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-700 font-medium">
                            {course.instructor}
                          </td>
                          <td className="py-4 px-6 font-bold text-gray-900">
                            {course.enrolledStudents} Students
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedCourse(course)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Manage
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-400 text-xs font-medium"
                      >
                        No courses found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedCourse && (
        <aside className="w-96 bg-white border-l border-gray-200 h-screen overflow-y-auto flex flex-col justify-between p-6 shadow-xl z-20 sticky top-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Course Details
              </h3>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-2">
              <img
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                className="w-full h-32 rounded-2xl object-cover mx-auto"
              />
              <div className="pt-2">
                <h4 className="font-bold text-gray-900 text-base">
                  {selectedCourse.title}
                </h4>
                <p className="text-xs text-gray-400">Instructor: {selectedCourse.instructor}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">
                  ENROLLED
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedCourse.enrolledStudents}
                </span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">
                  RATING
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedCourse.rating > 0 ? `★ ${selectedCourse.rating}` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-gray-900">
                About Course
              </h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedCourse.description || "Comprehensive educational module designed for practical learning, combining live sessions, interactive assessments, and expert guidance."}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-900">
                What this course provide
              </h5>
              <div className="space-y-3 text-xs text-gray-700 font-medium">
                {selectedCourse.features && selectedCourse.features.length > 0 ? (
                  selectedCourse.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {renderFeatureIcon(feature.iconType, feature.label)}
                      <span>{feature.label}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {renderFeatureIcon('book')}
                      <span>20 Classes per month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderFeatureIcon('clock')}
                      <span>6:00 P.M - 8:00 P.M</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderFeatureIcon('calendar')}
                      <span>Monday to Friday</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderFeatureIcon('mode', 'Online')}
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderFeatureIcon('location')}
                      <span>Nazimabad, Karachi</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderFeatureIcon('price')}
                      <span>RS. 9,000</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-2">
            <button
              onClick={() => setCourseToDelete(selectedCourse)}
              className="w-full py-2.5 border border-red-300 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            >
              DELETE COURSE
            </button>
          </div>
        </aside>
      )}

      {courseToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Delete Course</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-gray-900">{courseToDelete.title}</span>? Enrolled students will lose access to associated modules.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;