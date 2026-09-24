import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPage from "./NotificationsPage";
import { adminFetch, getImageUrl } from "../api/adminClient";

// ============================================================
// HELPERS — Enum & Format Mapping
// ============================================================

const formatCategory = (cat) => {
  if (!cat) return "";
  return cat
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatMode = (mode) => {
  if (!mode) return "";
  return mode
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatPrice = (num) => {
  if (num === null || num === undefined) return "—";
  return `RS. ${Number(num).toLocaleString()}`;
};

const formatReason = (r) => {
  if (!r) return "—";
  return r
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatStudentId = (id) => `STU-${id}`;

const getAvatarSrc = (url, name = "") => {
  if (url) return url;
  const initials = (name || "S T")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials,
  )}&background=E5E7EB&color=374151&bold=true`;
};

const mapStatusFilter = (status) => {
  if (status === "Active") return "ACTIVE";
  if (status === "Suspended") return "SUSPENDED";
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
// MAPPERS
// ============================================================

const mapListStudent = (dto) => ({
  id: formatStudentId(dto.id),
  rawId: dto.id,
  firstName: dto.firstName,
  lastName: dto.lastName,
  name: dto.name,
  title: dto.title,
  email: dto.email,
  avatar: getImageUrl(dto.avatar),
  status: dto.status,
  coursesEnrolled: dto.coursesEnrolled,
  enrolledCourseNames: dto.enrolledCourseNames || [],
  reports: String(dto.reports ?? 0),
  warnings: dto.warnings ?? 0,
  warningHistory: dto.warningHistory || [],
});

const mapDetailStudent = (dto) => ({
  id: formatStudentId(dto.id),
  rawId: dto.id,
  firstName: dto.firstName,
  lastName: dto.lastName,
  name: dto.name,
  title: dto.title,
  email: dto.email,
  avatar: getImageUrl(dto.avatar),
  gender: dto.gender,
  dateOfBirth: dto.dateOfBirth,
  phoneNumber: dto.phoneNumber,
  location: dto.location,
  school: dto.school,
  college: dto.college,
  education: dto.education,
  status: dto.status,
  totalCourses: dto.totalCourses,
  activeTutors: dto.activeTutors,

  reports: String(dto.reports ?? 0),
  warnings: dto.warnings ?? 0,
  warningHistory: (dto.warningHistory || []).map((w) => ({
    id: w.id,
    reason: w.reason,
    issuedAt: w.issuedAt,
    adminNotes: w.adminNotes,
    sourceReportId: w.sourceReportId,
  })),

  enrolledCourses: (dto.enrolledCourses || []).map((c) => ({
    courseId: c.courseId,
    name: c.name,
    category: formatCategory(c.category),
    mode: formatMode(c.mode),
    instructor: c.instructor,
    basePrice: c.basePrice,
    agreedPrice: c.agreedPrice,
    hasBid: c.agreedPrice != null && c.agreedPrice < c.basePrice,
  })),

  favoriteCourses: (dto.favoriteCourses || []).map((c) => ({
    courseId: c.courseId,
    name: c.name,
    category: formatCategory(c.category),
    mode: formatMode(c.mode),
    instructor: c.instructor,
    basePrice: c.basePrice,
  })),

  deals: (dto.deals || []).map((d) => ({
    connectionId: d.connectionId,
    course: d.course,
    category: formatCategory(d.category),
    mode: formatMode(d.mode),
    instructor: d.instructor,
    basePrice: d.basePrice,
    bidPrice: d.bidPrice,
    status: d.status,
  })),
});

// ============================================================
// SPINNER
// ============================================================
const Spinner = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={`${className} animate-spin`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

// ============================================================
// Custom Dropdown
// ============================================================
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {label && (
        <span className="text-[10px] uppercase font-bold text-gray-400">
          {label}:
        </span>
      )}
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
        of <span className="font-bold text-gray-800">{totalItems}</span>{" "}
        students
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
const StudentManagement = () => {
  const [viewState, setViewState] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("All Students");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [modeFilter, setModeFilter] = useState("All Modes");
  const [searchQuery, setSearchQuery] = useState("");

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Pagination
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [studentToSuspend, setStudentToSuspend] = useState(null);
  const [isProcessingStatus, setIsProcessingStatus] = useState(false);

  // ✅ Email Modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSelection, setEmailSelection] = useState([]);

  // ============================================================
  // FETCH STUDENTS LIST
  // ============================================================
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const payload = {
        status: mapStatusFilter(statusFilter),
        category: mapCategoryFilter(categoryFilter),
        mode: mapModeFilter(modeFilter),
        searchQuery: searchQuery.trim() || null,
      };

      const res = await adminFetch("/api/admin/students/filter", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.map(mapListStudent));
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, modeFilter, searchQuery]);

  // ============================================================
  // DERIVED — Pagination slice
  // ============================================================
  const totalStudents = students.length;
  const totalPages = Math.ceil(totalStudents / ITEMS_PER_PAGE);

  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ============================================================
  // FETCH STUDENT DETAILS
  // ============================================================
  const handleOpenStudent = async (student) => {
    setSelectedStudent(student);
    setStudentDetail(null);
    setIsLoadingDetail(true);
    try {
      const res = await adminFetch(`/api/admin/students/${student.rawId}`);
      if (!res.ok) throw new Error("Failed to fetch student details");
      const dto = await res.json();
      setStudentDetail(mapDetailStudent(dto));
    } catch (err) {
      console.error("Error fetching student details:", err);
      setStudentDetail({
        ...student,
        enrolledCourses: [],
        favoriteCourses: [],
        deals: [],
        totalCourses: student.coursesEnrolled,
        activeTutors: 0,
        reports: "0",
        warnings: 0,
        warningHistory: [],
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseStudent = () => {
    setSelectedStudent(null);
    setStudentDetail(null);
  };

  // ============================================================
  // SUSPEND / REACTIVATE STUDENT
  // ============================================================
  const confirmStatusChange = async () => {
    if (!studentToSuspend || isProcessingStatus) return;

    const isSuspend = studentToSuspend.status === "Active";
    const endpoint = isSuspend ? "suspend" : "reactivate";

    setIsProcessingStatus(true);
    try {
      const res = await adminFetch(
        `/api/admin/students/${studentToSuspend.rawId}/${endpoint}`,
        { method: "PUT" },
      );
      if (!res.ok) throw new Error(`${endpoint} failed`);

      await fetchStudents();
      handleCloseStudent();
      setStudentToSuspend(null);
    } catch (err) {
      console.error(`${endpoint} error:`, err);
      alert(
        `Failed to ${isSuspend ? "suspend" : "reactivate"} student. Please try again.`,
      );
    } finally {
      setIsProcessingStatus(false);
    }
  };

  // ============================================================
  // EMAIL MODAL HANDLERS
  // ============================================================
  const handleOpenEmailModal = () => {
    setEmailSelection([]);
    setIsEmailModalOpen(true);
  };

  const handleToggleEmailRecipient = (student) => {
    setEmailSelection((prev) =>
      prev.includes(student.id)
        ? prev.filter((id) => id !== student.id)
        : [...prev, student.id],
    );
  };

  const handleSelectAllEmailRecipients = () => {
    if (emailSelection.length === students.length) {
      setEmailSelection([]);
    } else {
      setEmailSelection(students.map((s) => s.id));
    }
  };

  const handleWriteEmail = () => {
    const selected = students.filter((s) => emailSelection.includes(s.id));
    if (selected.length === 0) return;

    const toField = selected.map((s) => s.email).join(",");
    const subject = encodeURIComponent("TUTR Admin Console — Message");
    const body = encodeURIComponent(
      `Hello,\n\n\n\nBest regards,\nTUTR Administration`,
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        toField,
      )}&su=${subject}&body=${body}`,
      "_blank",
    );

    setIsEmailModalOpen(false);
    setEmailSelection([]);
  };

  // ============================================================
  // PDF EXPORT — List
  // ============================================================
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TUTR - Student Management Report", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Status: ${statusFilter} | Category: ${categoryFilter} | Mode: ${modeFilter} | Date: ${new Date().toLocaleDateString()}`,
      14,
      22,
    );

    const tableHeaders = [
      ["ID", "Name", "Email", "Status", "Enrolled Courses"],
    ];
    const tableRows = students.map((s) => [
      s.id,
      s.name,
      s.email,
      s.status,
      `${s.coursesEnrolled} Courses (${s.enrolledCourseNames.join(", ")})`,
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    doc.save(`Student_Report_${statusFilter}_${categoryFilter}.pdf`);
  };

  // ============================================================
  // PDF EXPORT — Individual
  // ============================================================
  const handleExportIndividualPDF = () => {
    if (!studentDetail) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 15;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TUTR - Student Profile", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      margin,
      y,
    );
    doc.setTextColor(0, 0, 0);
    y += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(studentDetail.name || "—", margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${studentDetail.title || ""}  •  ${studentDetail.id || ""}`,
      margin,
      y,
    );
    doc.setTextColor(0, 0, 0);
    y += 8;

    const isActive = studentDetail.status === "Active";
    doc.setFillColor(
      isActive ? 220 : 254,
      isActive ? 252 : 226,
      isActive ? 231 : 226,
    );
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      isActive ? 22 : 185,
      isActive ? 163 : 28,
      isActive ? 74 : 28,
    );
    doc.text(
      `Account Status:  ${studentDetail.status || "—"}`,
      margin + 4,
      y + 6.5,
    );
    doc.setTextColor(0, 0, 0);
    y += 16;

    const personalRows = [
      ["First Name", studentDetail.firstName || "—"],
      ["Last Name", studentDetail.lastName || "—"],
      ["Email", studentDetail.email || "—"],
      ["Phone", studentDetail.phoneNumber || "—"],
      ["Gender", studentDetail.gender || "—"],
      ["Date of Birth", studentDetail.dateOfBirth || "—"],
      ["Location", studentDetail.location || "—"],
      ["School", studentDetail.school || "—"],
      ["College", studentDetail.college || "—"],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Personal Information", ""]],
      body: personalRows,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: pageWidth - margin * 2 - 50 },
      },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Total Courses", "Active Tutors", "Reports", "Warnings"]],
      body: [
        [
          String(studentDetail.totalCourses ?? 0),
          String(studentDetail.activeTutors ?? 0),
          String(studentDetail.reports ?? 0),
          String(studentDetail.warnings ?? 0),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (
      studentDetail.warningHistory &&
      studentDetail.warningHistory.length > 0
    ) {
      autoTable(doc, {
        startY: y,
        head: [["Warning Reason", "Issued On"]],
        body: studentDetail.warningHistory.map((w) => [
          formatReason(w.reason),
          new Date(w.issuedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        ]),
        theme: "grid",
        headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (
      studentDetail.enrolledCourses &&
      studentDetail.enrolledCourses.length > 0
    ) {
      autoTable(doc, {
        startY: y,
        head: [
          [
            "Enrolled Courses",
            "Category",
            "Mode",
            "Instructor",
            "Base Price",
            "Paid",
          ],
        ],
        body: studentDetail.enrolledCourses.map((c) => [
          c.name || "—",
          c.category || "—",
          c.mode || "—",
          c.instructor || "—",
          formatPrice(c.basePrice),
          c.hasBid ? formatPrice(c.agreedPrice) : formatPrice(c.basePrice),
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (
      studentDetail.favoriteCourses &&
      studentDetail.favoriteCourses.length > 0
    ) {
      autoTable(doc, {
        startY: y,
        head: [["Favorite Courses", "Category", "Mode", "Instructor", "Price"]],
        body: studentDetail.favoriteCourses.map((c) => [
          c.name || "—",
          c.category || "—",
          c.mode || "—",
          c.instructor || "—",
          formatPrice(c.basePrice),
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (studentDetail.deals && studentDetail.deals.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [
          [
            "Deals",
            "Category",
            "Mode",
            "Instructor",
            "Base Price",
            "Bid Price",
            "Status",
          ],
        ],
        body: studentDetail.deals.map((d) => [
          d.course || "—",
          d.category || "—",
          d.mode || "—",
          d.instructor || "—",
          formatPrice(d.basePrice),
          formatPrice(d.bidPrice),
          d.status || "—",
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("Deals: none active", margin, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `TUTR Admin Console  •  Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" },
      );
    }

    const safeName = (studentDetail.name || "Student").replace(/\s+/g, "_");
    doc.save(`Student_${safeName}_${studentDetail.id}.pdf`);
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
                  Student Management
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Oversee, manage, and monitor student academic participation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleOpenEmailModal}
                  className="bg-white border border-gray-300 hover:border-black text-gray-800 font-medium text-xs px-4 py-2.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Email
                </button>

                <button
                  onClick={handleExportPDF}
                  className="bg-black hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
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
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <CustomDropdown
                  label="STATUS"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={["All Students", "Active", "Suspended"]}
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

              <div className="text-gray-400 text-xs font-medium shrink-0 self-end lg:self-auto">
                Showing{" "}
                {totalStudents === 0
                  ? 0
                  : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                –{Math.min(currentPage * ITEMS_PER_PAGE, totalStudents)} of{" "}
                {totalStudents} students
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
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
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-8 text-center text-gray-400 text-xs font-medium"
                        >
                          Loading students...
                        </td>
                      </tr>
                    ) : paginatedStudents.length > 0 ? (
                      paginatedStudents.map((student) => (
                        <tr
                          key={student.id}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            selectedStudent?.id === student.id
                              ? "bg-gray-50/80"
                              : ""
                          }`}
                          onClick={() => handleOpenStudent(student)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={getAvatarSrc(student.avatar, student.name)}
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
                                student.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-gray-900 mr-1">
                                {student.coursesEnrolled} Courses:
                              </span>
                              {student.enrolledCourseNames.map((name, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleOpenStudent(student)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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

              {!isLoading && paginatedStudents.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalStudents}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* EMAIL RECIPIENT SELECTION MODAL */}
      {/* ============================================================ */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-gray-100 shadow-2xl space-y-4 my-8 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Select Email Recipients
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Choose one or more students to email.
                </p>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-black text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={
                    students.length > 0 &&
                    emailSelection.length === students.length
                  }
                  onChange={handleSelectAllEmailRecipients}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-800">
                  Select All ({students.length})
                </span>
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                {emailSelection.length} selected
              </span>
            </div>

            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
              {students.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  No students available.
                </div>
              ) : (
                students.map((student) => {
                  const isChecked = emailSelection.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isChecked ? "bg-gray-50" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEmailRecipient(student)}
                        className="w-4 h-4 accent-black cursor-pointer shrink-0"
                      />
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {student.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {student.email}
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        {student.status}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWriteEmail}
                disabled={emailSelection.length === 0}
                className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Write Email ({emailSelection.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Drawer */}
      {selectedStudent && (
        <aside className="w-full sm:w-96 bg-white border-l border-gray-200 h-screen overflow-y-auto flex flex-col justify-between p-6 pt-16 sm:pt-6 shadow-xl z-20 fixed sm:sticky top-0 right-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Student Details
              </h3>
              <button
                onClick={handleCloseStudent}
                className="text-gray-400 hover:text-black cursor-pointer text-sm p-1"
              >
                ✕
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-12 text-center text-gray-400 text-xs font-medium">
                Loading details...
              </div>
            ) : studentDetail ? (
              <>
                <div className="text-center space-y-2">
                  <img
                    src={getAvatarSrc(studentDetail.avatar, studentDetail.name)}
                    alt={studentDetail.name}
                    className="w-20 h-20 rounded-2xl object-cover mx-auto"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">
                      {studentDetail.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {studentDetail.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Email
                  </h5>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-gray-900 break-all">
                      {studentDetail.email}
                    </p>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        studentDetail.email,
                      )}&su=${encodeURIComponent(
                        `TUTR - Message for ${studentDetail.name}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Email Student
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <DetailField
                      label="First Name"
                      value={studentDetail.firstName}
                    />
                    <DetailField
                      label="Last Name"
                      value={studentDetail.lastName}
                    />
                    <DetailField label="Gender" value={studentDetail.gender} />
                    <DetailField
                      label="Date of Birth"
                      value={studentDetail.dateOfBirth}
                    />
                    <DetailField
                      label="Phone"
                      value={studentDetail.phoneNumber}
                    />
                    <DetailField
                      label="Location"
                      value={studentDetail.location}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Education
                  </h5>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
                    <div>
                      <p className="text-[8px] font-bold uppercase text-gray-400 tracking-wider">
                        School
                      </p>
                      <p className="text-[11px] font-semibold text-gray-900">
                        {studentDetail.school || "—"}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-[8px] font-bold uppercase text-gray-400 tracking-wider">
                        College
                      </p>
                      <p className="text-[11px] font-semibold text-gray-900">
                        {studentDetail.college || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] font-bold uppercase text-gray-400 block tracking-wider">
                      TOTAL COURSES
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {studentDetail.totalCourses}
                    </span>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] font-bold uppercase text-gray-400 block tracking-wider">
                      ACTIVE TUTORS
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {studentDetail.activeTutors}
                    </span>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] font-bold uppercase text-gray-400 block tracking-wider">
                      REPORTS
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {studentDetail.reports}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold uppercase text-amber-600 tracking-wider">
                      WARNINGS
                    </span>
                    {(studentDetail.warnings ?? 0) >= 3 && (
                      <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wide">
                        At Limit
                      </span>
                    )}
                  </div>

                  <span className="text-base font-bold text-amber-700 block">
                    {studentDetail.warnings ?? 0}
                  </span>

                  {studentDetail.warningHistory &&
                  studentDetail.warningHistory.length > 0 ? (
                    <div className="space-y-1.5 pt-2 border-t border-amber-200">
                      {studentDetail.warningHistory.map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between text-[10px]"
                        >
                          <span className="font-semibold text-amber-800 truncate pr-2">
                            {formatReason(w.reason)}
                          </span>
                          <span className="text-amber-600 shrink-0">
                            {new Date(w.issuedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-600/70 italic pt-2 border-t border-amber-200">
                      No prior warnings
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Enrolled Courses
                  </h5>
                  {studentDetail.enrolledCourses.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetail.enrolledCourses.map((course, index) => (
                        <CourseCard key={index} course={course} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      No enrolled courses.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Favorite Courses
                  </h5>
                  {studentDetail.favoriteCourses &&
                  studentDetail.favoriteCourses.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetail.favoriteCourses.map((course, index) => (
                        <CourseCard key={index} course={course} favorite />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      No favorite courses yet.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Deals
                  </h5>
                  {studentDetail.deals && studentDetail.deals.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetail.deals.map((deal, index) => (
                        <DealCard key={index} deal={deal} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      No active deals.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs font-medium">
                No details available.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-2">
            <button
              onClick={handleExportIndividualPDF}
              disabled={!studentDetail || isLoadingDetail}
              className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
              Export Student PDF
            </button>

            {selectedStudent?.status === "Suspended" ? (
              <button
                onClick={() => setStudentToSuspend(selectedStudent)}
                disabled={isProcessingStatus}
                className="w-full py-2.5 border border-green-300 text-green-700 text-xs font-bold rounded-xl hover:bg-green-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                REACTIVATE STUDENT
              </button>
            ) : (
              <button
                onClick={() => setStudentToSuspend(selectedStudent)}
                disabled={isProcessingStatus}
                className="w-full py-2.5 border border-red-300 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SUSPEND STUDENT
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Suspend / Reactivate Confirmation Modal */}
      {studentToSuspend &&
        (() => {
          const isSuspend = studentToSuspend.status === "Active";
          return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-xl space-y-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {isSuspend ? "Suspend Student" : "Reactivate Student"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {isSuspend ? (
                      <>
                        Are you sure you want to suspend{" "}
                        <span className="font-semibold text-gray-900">
                          {studentToSuspend.name}
                        </span>
                        ? Their account will be temporarily disabled, and they
                        will lose access to active sessions until reactivated.
                      </>
                    ) : (
                      <>
                        Are you sure you want to reactivate{" "}
                        <span className="font-semibold text-gray-900">
                          {studentToSuspend.name}
                        </span>
                        ? Their account will regain full access to TUTR
                        immediately.
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setStudentToSuspend(null)}
                    disabled={isProcessingStatus}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    disabled={isProcessingStatus}
                    className={`px-4 py-2 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                      isSuspend
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isProcessingStatus ? (
                      <>
                        <Spinner className="w-3.5 h-3.5" />
                        <span>
                          {isSuspend ? "Suspending..." : "Reactivating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        {isSuspend ? "Confirm Suspend" : "Confirm Reactivate"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

// ============================================================
// Small helpers
// ============================================================
const DetailField = ({ label, value }) => (
  <div className="bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2">
    <p className="text-[8px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">
      {label}
    </p>
    <p className="text-[11px] font-semibold text-gray-900 truncate">
      {value || "—"}
    </p>
  </div>
);

const CourseCard = ({ course, favorite = false }) => (
  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-bold text-gray-900 leading-snug">
        {course.name}
      </p>
      {favorite && (
        <svg
          className="w-3.5 h-3.5 text-amber-500 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      )}
    </div>

    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
        {course.category}
      </span>
      <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
        {course.mode}
      </span>
    </div>

    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span className="font-medium">{course.instructor}</span>
    </div>

    <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
      {favorite ? (
        <span className="text-[11px] font-bold text-gray-900">
          {formatPrice(course.basePrice)}
        </span>
      ) : course.hasBid ? (
        <>
          <span className="text-[10px] font-medium text-gray-400 line-through">
            {formatPrice(course.basePrice)}
          </span>
          <span className="text-[11px] font-bold text-gray-900">
            {formatPrice(course.agreedPrice)}
          </span>
        </>
      ) : (
        <span className="text-[11px] font-bold text-gray-900">
          {formatPrice(course.basePrice)}
        </span>
      )}
    </div>
  </div>
);

const DealCard = ({ deal }) => {
  const statusStyles =
    deal.status === "Negotiating"
      ? "bg-amber-100 text-amber-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-gray-900 leading-snug">
          {deal.course}
        </p>
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${statusStyles}`}
        >
          {deal.status}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
          {deal.category}
        </span>
        <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
          {deal.mode}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="font-medium">{deal.instructor}</span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
        <span className="text-[10px] font-medium text-gray-400 line-through">
          {formatPrice(deal.basePrice)}
        </span>
        <span className="text-[11px] font-bold text-green-600">
          {formatPrice(deal.bidPrice)}
        </span>
      </div>
    </div>
  );
};

export default StudentManagement;
