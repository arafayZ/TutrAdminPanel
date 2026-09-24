import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPage from "./NotificationsPage";
import { adminFetch } from "../api/adminClient";
import appIcon from "../assets/app_icon1.png";

// Custom Dropdown Component (unchanged)
const CustomDropdown = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 relative w-full sm:w-auto"
      ref={dropdownRef}
    >
      {label && (
        <span className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">
          {label}:
        </span>
      )}
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
          <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden py-1 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  value === opt
                    ? "bg-black text-white font-semibold"
                    : "text-gray-700 hover:bg-black hover:text-white"
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

// ============================================================
// HELPER: Map Backend DTO → Frontend Shape
// ============================================================
const mapCourseFromBackend = (dto) => ({
  id: dto.id,
  title: dto.title,
  category: dto.category,
  thumbnail: appIcon,
  instructor: dto.instructorName,
  status: dto.status,
  mode: dto.mode,
  enrolledStudents: dto.enrolledStudents,
  rating: dto.rating,
  price: dto.price,
  description: dto.description,
  duration: dto.duration,
  totalModules: dto.totalModules,
  completionRate: dto.completionRate,
  features: [],
});

// ============================================================
// HELPER: Convert Status Filter → Backend value
// ============================================================
const mapStatusFilter = (status) => {
  if (status === "Available") return "Available";
  if (status === "Unavailable") return "Unavailable";
  return null;
};

const mapCategoryFilter = (cat) => {
  if (cat === "All Categories") return null;
  return cat.replace(" ", "_").toUpperCase();
};

const mapModeFilter = (mode) => {
  if (mode === "All Modes") return null;
  return mode.replace(" ", "_").toUpperCase();
};

// ============================================================
// PAGINATION CONTROLS
// ============================================================
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
      <span className="text-[11px] text-gray-500 font-medium">
        Showing{" "}
        <span className="font-bold text-gray-800">
          {startItem}–{endItem}
        </span>{" "}
        of <span className="font-bold text-gray-800">{totalItems}</span> courses
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Prev
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 text-xs font-bold rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              1
            </button>
            {start > 2 && <span className="text-gray-400 px-1 text-xs">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              p === currentPage
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="text-gray-400 px-1 text-xs">…</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 text-xs font-bold rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const CourseManagement = () => {
  const [viewState, setViewState] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [modeFilter, setModeFilter] = useState("All Modes");
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Pagination state
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentsCourse, setStudentsCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // ============================================================
  // FETCH COURSES (triggered by filters/search)
  // ============================================================
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const filterPayload = {
        status: mapStatusFilter(statusFilter),
        category: mapCategoryFilter(categoryFilter),
        mode: mapModeFilter(modeFilter),
        searchQuery: searchQuery.trim() || null,
      };

      const response = await adminFetch("/api/admin/courses/filter", {
        method: "POST",
        body: JSON.stringify(filterPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data.map(mapCourseFromBackend));
      setCurrentPage(1); // reset to page 1 whenever filters change
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced fetch on filter/search change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, modeFilter, searchQuery]);

  // ============================================================
  // DERIVED — Pagination slice
  // ============================================================
  const totalCourses = courses.length;
  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE);

  const paginatedCourses = courses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ============================================================
  // FETCH COURSE DETAILS (for sidebar)
  // ============================================================
  const handleOpenDetails = async (course) => {
    try {
      const response = await adminFetch(`/api/admin/courses/${course.id}`);
      if (!response.ok) throw new Error("Failed to fetch details");
      const detail = await response.json();

      setSelectedCourse({
        ...course,
        description: detail.description,
        rating: detail.rating,
        enrolledStudents: detail.enrolledStudents,
        features: [
          {
            label: `${detail.classesPerMonth} Classes per month`,
            iconType: "book",
          },
          {
            label: `${detail.startTime} - ${detail.endTime}`,
            iconType: "clock",
          },
          {
            label: `${detail.fromDay} to ${detail.toDay}`,
            iconType: "calendar",
          },
          { label: detail.mode, iconType: "mode" },
          { label: detail.location, iconType: "location" },
          {
            label: `RS. ${detail.price?.toLocaleString() || "N/A"}`,
            iconType: "price",
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching course details:", err);
      setSelectedCourse(course);
    }
  };

  // ============================================================
  // FETCH ENROLLED STUDENTS (for modal)
  // ============================================================
  const handleOpenStudents = async (course) => {
    setStudentsCourse(course);
    setIsLoadingStudents(true);
    try {
      const response = await adminFetch(
        `/api/admin/courses/${course.id}/students`,
      );
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();

      const mapped = data.map((s) => ({
        id: s.studentId,
        name: s.name,
        email: s.email,
        paidPrice: s.paidPrice,
        bidPrice: s.bidPrice,
      }));
      setEnrolledStudents(mapped);
    } catch (err) {
      console.error("Error fetching enrolled students:", err);
      setEnrolledStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleCloseStudents = () => {
    setStudentsCourse(null);
    setEnrolledStudents([]);
  };

  // ============================================================
  // FEATURE ICONS
  // ============================================================
  const renderFeatureIcon = (type, label = "") => {
    const modeText = (label || "").toLowerCase();
    if (modeText.includes("online"))
      return (
        <svg
          className="w-5 h-5 text-gray-700 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect
            x="7"
            y="2"
            width="10"
            height="20"
            rx="2"
            ry="2"
            strokeWidth="1.8"
          />
          <line
            x1="11"
            y1="18"
            x2="13"
            y2="18"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    if (modeText.includes("tutor"))
      return (
        <svg
          className="w-5 h-5 text-gray-700 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      );
    if (modeText.includes("student"))
      return (
        <svg
          className="w-5 h-5 text-gray-700 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );

    switch (type) {
      case "book":
        return (
          <svg
            className="w-5 h-5 text-gray-700 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "clock":
        return (
          <svg
            className="w-5 h-5 text-gray-700 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "calendar":
        return (
          <svg
            className="w-5 h-5 text-gray-700 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "location":
        return (
          <svg
            className="w-5 h-5 text-gray-700 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "price":
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-700 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
            <path strokeLinecap="round" strokeWidth="1.8" d="M6 9v0M18 15v0" />
          </svg>
        );
    }
  };

  // ============================================================
  // PDF EXPORT — exports ALL filtered courses (not just the page)
  // ============================================================
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TUTR - Course Management Report", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Status: ${statusFilter} | Category: ${categoryFilter} | Mode: ${modeFilter} | Date: ${new Date().toLocaleDateString()}`,
      14,
      22,
    );

    const tableHeaders = [
      [
        "ID",
        "Course Title",
        "Category",
        "Instructor",
        "Status",
        "Mode",
        "Enrolled",
      ],
    ];
    const tableRows = courses.map((c) => [
      c.id,
      c.title,
      c.category,
      c.instructor,
      c.status,
      c.mode,
      `${c.enrolledStudents} Students`,
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    doc.save(`Course_Report_${statusFilter}_${categoryFilter}.pdf`);
  };

  // ============================================================
  // RENDER
  // ============================================================
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

        {viewState === "notifications" ? (
          <NotificationsPage onBack={() => setViewState("dashboard")} />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Course Management
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Create, audit, and organize educational modules and active
                  curricula.
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

            {/* Filters */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <CustomDropdown
                  label="STATUS"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={["All Statuses", "Available", "Unavailable"]}
                />
                <CustomDropdown
                  label="CATEGORY"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    "All Categories",
                    "O Level",
                    "A Level",
                    "Entry Test",
                    "Matric",
                    "Intermediate",
                  ]}
                />
                <CustomDropdown
                  label="MODE"
                  value={modeFilter}
                  onChange={setModeFilter}
                  options={[
                    "All Modes",
                    "Online",
                    "Student Home",
                    "Tutor Home",
                  ]}
                />
              </div>
              <div className="text-gray-400 text-xs font-medium self-end sm:self-auto pt-1 sm:pt-0">
                Showing{" "}
                {totalCourses === 0
                  ? 0
                  : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                –{Math.min(currentPage * ITEMS_PER_PAGE, totalCourses)} of{" "}
                {totalCourses} courses
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                      <th className="py-4 px-6">COURSE</th>
                      <th className="py-4 px-6">STATUS</th>
                      <th className="py-4 px-6">MODE</th>
                      <th className="py-4 px-6">INSTRUCTOR</th>
                      <th className="py-4 px-6">ENROLLED</th>
                      <th className="py-4 px-6 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-8 text-center text-gray-400 text-xs font-medium"
                        >
                          Loading courses...
                        </td>
                      </tr>
                    ) : paginatedCourses.length > 0 ? (
                      paginatedCourses.map((course) => (
                        <tr
                          key={course.id}
                          className={`hover:bg-gray-50/50 transition-colors ${
                            selectedCourse?.id === course.id
                              ? "bg-gray-50/80"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-xs">
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
                                course.status === "Available"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {course.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-700 font-medium">
                            {course.mode}
                          </td>
                          <td className="py-4 px-6 text-gray-700 font-medium">
                            {course.instructor}
                          </td>
                          <td className="py-4 px-6 font-bold text-gray-900">
                            {course.enrolledStudents} Students
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenStudents(course)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                View Students
                              </button>
                              <button
                                onClick={() => handleOpenDetails(course)}
                                className="px-3 py-1 bg-black hover:bg-zinc-800 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-8 text-center text-gray-400 text-xs font-medium"
                        >
                          No courses found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!isLoading && paginatedCourses.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalCourses}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Course Details Sidebar */}
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
              <div className="w-full h-32 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-full h-32 rounded-2xl object-contain bg-white border border-gray-100 p-4 mx-auto"
                />
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-gray-900 text-base">
                  {selectedCourse.title}
                </h4>
                <p className="text-xs text-gray-400">
                  Instructor: {selectedCourse.instructor}
                </p>
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
                  {selectedCourse.rating > 0
                    ? `★ ${selectedCourse.rating}`
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-gray-900">About Course</h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedCourse.description ||
                  "Comprehensive educational module designed for practical learning."}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-900">
                What this course provides
              </h5>
              <div className="space-y-3 text-xs text-gray-700 font-medium">
                {selectedCourse.features &&
                selectedCourse.features.length > 0 ? (
                  selectedCourse.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {renderFeatureIcon(feature.iconType, feature.label)}
                      <span>{feature.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Loading features...</p>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* View Students Modal */}
      {studentsCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Enrolled Students
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {studentsCourse.title} · Course price:{" "}
                  <span className="font-bold text-gray-800">
                    RS. {studentsCourse.price?.toLocaleString() || "N/A"}
                  </span>
                </p>
              </div>
              <button
                onClick={handleCloseStudents}
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto">
              {isLoadingStudents ? (
                <div className="py-12 text-center text-gray-400 text-xs font-medium">
                  Loading students...
                </div>
              ) : enrolledStudents.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                      <th className="py-3 px-6">STUDENT</th>
                      <th className="py-3 px-6">EMAIL</th>
                      <th className="py-3 px-6 text-right">PAID PRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrolledStudents.map((s) => {
                      const hasBid =
                        s.bidPrice != null && s.bidPrice < studentsCourse.price;
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {s.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <p className="font-bold text-gray-900">
                                {s.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-gray-500">{s.email}</td>
                          <td className="py-3 px-6 text-right font-bold">
                            {hasBid ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-gray-400 line-through font-medium">
                                  RS. {studentsCourse.price?.toLocaleString()}
                                </span>
                                <span className="text-green-600">
                                  RS. {s.bidPrice.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-900">
                                RS.{" "}
                                {studentsCourse.price?.toLocaleString() ||
                                  "N/A"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs font-medium">
                  No students enrolled in this course yet.
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">
                {enrolledStudents.length} students enrolled
              </span>
              <button
                onClick={handleCloseStudents}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
