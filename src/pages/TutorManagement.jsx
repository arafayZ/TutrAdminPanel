import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPage from "./NotificationsPage";
import { adminFetch, getImageUrl } from "../api/adminClient";

// ============================================================
// HELPERS — Formatting
// ============================================================
const formatCourseName = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatPrice = (num) => {
  if (num === null || num === undefined) return "—";
  return `RS. ${Number(num).toLocaleString()}`;
};

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

const formatReason = (r) => {
  if (!r) return "—";
  return r
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatTutorId = (id) => `TTR-${id}`;

const getAvatarSrc = (url, name = "") => {
  if (url) return url;
  const initials = (name || "T T")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials,
  )}&background=E5E7EB&color=374151&bold=true`;
};

// ============================================================
// FILTER MAPPERS
// ============================================================
const mapStatusFilter = (status) => {
  if (status === "Active") return "ACTIVE";
  if (status === "Inactive") return "INACTIVE";
  if (status === "Suspended") return "SUSPENDED";
  return null; // All Tutors
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
// STATUS NORMALIZER
// Backend enum → Display label
// ACTIVE      → "Active"
// INACTIVE    → "Inactive"
// SUSPENDED   → "Suspended"
// PENDING     → "Pending"
// REJECTED    → "Rejected"
// DELETED     → "Deleted"
// ============================================================
const normalizeStatus = (status) => {
  if (!status) return "Unknown";
  const s = String(status).toUpperCase().trim();

  switch (s) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    case "SUSPENDED":
      return "Suspended";
    case "PENDING":
      return "Pending";
    case "REJECTED":
      return "Rejected";
    case "DELETED":
      return "Deleted";
    default:
      // Unknown → capitalize first letter only
      return s.charAt(0) + s.slice(1).toLowerCase();
  }
};

// ============================================================
// MAPPERS — Backend DTO → Frontend shape
// ============================================================
const mapListTutor = (dto) => ({
  id: formatTutorId(dto.id),
  rawId: dto.id,
  firstName: dto.firstName,
  lastName: dto.lastName,
  name: dto.name,
  title: dto.title,
  email: dto.email,
  avatar: getImageUrl(dto.avatar),
  status: normalizeStatus(dto.status),
  credentialVerified: dto.credentialVerified,
  subjects: (dto.subjects || []).map(formatCourseName),
  rating: dto.rating,
  reviewsCount: dto.reviewsCount,
  bio: "",
  totalCourses: 0,
  avgRating: dto.rating,
  activeStudents: 0,
  reports: "0",
  warnings: 0,
  warningHistory: [],
  offeredCourses: [],
  currentStudents: [],
  deals: [],
});

const mapDetailTutor = (dto) => ({
  id: formatTutorId(dto.id),
  rawId: dto.id,
  firstName: dto.firstName,
  lastName: dto.lastName,
  name: dto.name,
  title: dto.title,
  email: dto.email,
  avatar: getImageUrl(dto.avatar),
  status: normalizeStatus(dto.status),
  credentialVerified: dto.credentialVerified,
  bio: dto.bio || "",
  gender: dto.gender,
  dateOfBirth: dto.dateOfBirth,
  phoneNumber: dto.phoneNumber,
  location: dto.location,
  university: dto.university,
  highSchool: dto.highSchool,
  workExperience: dto.workExperience,
  totalCourses: dto.totalCourses,
  avgRating: dto.avgRating,
  activeStudents: dto.activeStudents,
  reports: String(dto.reports ?? 0),
  warnings: dto.warnings ?? 0,

  // ✅ Warning history from backend
  warningHistory: (dto.warningHistory || []).map((w) => ({
    id: w.id,
    reason: w.reason,
    issuedAt: w.issuedAt,
    adminNotes: w.adminNotes,
    sourceReportId: w.sourceReportId,
  })),

  subjects: (dto.offeredCourses || [])
    .map((c) => formatCourseName(c.name))
    .filter((v, i, a) => a.indexOf(v) === i),

  offeredCourses: (dto.offeredCourses || []).map((c) => ({
    courseId: c.courseId,
    name: c.name,
    category: formatCategory(c.category),
    mode: formatMode(c.mode),
    basePrice: c.basePrice,
    agreedPrice: c.agreedPrice,
  })),

  currentStudents: (dto.currentStudents || []).map((s) => ({
    studentId: s.studentId,
    name: s.name,
    subject: s.subject,
    basePrice: s.basePrice,
    agreedPrice: s.agreedPrice,
  })),

  deals: (dto.deals || []).map((d) => ({
    connectionId: d.connectionId,
    course: d.course,
    category: formatCategory(d.category),
    mode: formatMode(d.mode),
    student: d.student,
    basePrice: d.basePrice,
    bidPrice: d.bidPrice,
    status: d.status,
  })),
});

// ============================================================
// Custom Dropdown Component
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
    <div
      className="flex items-center gap-1.5 sm:gap-2 relative w-full sm:w-auto"
      ref={dropdownRef}
    >
      {label && (
        <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">
          {label}:
        </span>
      )}
      <div className="relative flex-1 sm:flex-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg px-2.5 py-1.5 text-xs flex items-center justify-between sm:justify-start gap-2 cursor-pointer transition-colors"
        >
          <span className="truncate max-w-[110px] sm:max-w-none">{value}</span>
          <span className="text-[9px] text-gray-500">▼</span>
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
// MAIN COMPONENT
// ============================================================
const TutorManagement = () => {
  const [viewState, setViewState] = useState("dashboard");

  const [statusFilter, setStatusFilter] = useState("All Tutors");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [modeFilter, setModeFilter] = useState("All Modes");
  const [searchQuery, setSearchQuery] = useState("");

  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorDetail, setTutorDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [tutorToSuspend, setTutorToSuspend] = useState(null);

  // ============================================================
  // FETCH TUTORS LIST
  // ============================================================
  const fetchTutors = async () => {
    setIsLoading(true);
    try {
      const payload = {
        status: mapStatusFilter(statusFilter),
        category: mapCategoryFilter(categoryFilter),
        mode: mapModeFilter(modeFilter),
        searchQuery: searchQuery.trim() || null,
      };

      const res = await adminFetch("/api/admin/tutors/filter", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch tutors");
      const data = await res.json();
      setTutors(data.map(mapListTutor));
    } catch (err) {
      console.error("Error fetching tutors:", err);
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchTutors, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, modeFilter, searchQuery]);

  // ============================================================
  // FETCH TUTOR DETAILS
  // ============================================================
  const handleOpenTutor = async (tutor) => {
    setSelectedTutor(tutor);
    setTutorDetail(null);
    setIsLoadingDetail(true);
    try {
      const res = await adminFetch(`/api/admin/tutors/${tutor.rawId}`);
      if (!res.ok) throw new Error("Failed to fetch tutor details");
      const dto = await res.json();
      setTutorDetail(mapDetailTutor(dto));
    } catch (err) {
      console.error("Error fetching tutor details:", err);
      setTutorDetail({
        ...tutor,
        offeredCourses: [],
        currentStudents: [],
        deals: [],
        warningHistory: [],
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseTutor = () => {
    setSelectedTutor(null);
    setTutorDetail(null);
  };

  // ============================================================
  // SUSPEND / REACTIVATE
  // ============================================================
  const confirmStatusChange = async () => {
    if (!tutorToSuspend) return;

    const isSuspend = tutorToSuspend.status === "Active";
    const endpoint = isSuspend ? "suspend" : "reactivate";

    try {
      const res = await adminFetch(
        `/api/admin/tutors/${tutorToSuspend.rawId}/${endpoint}`,
        { method: "PUT" },
      );
      if (!res.ok) throw new Error(`${endpoint} failed`);

      await fetchTutors();

      if (selectedTutor?.rawId === tutorToSuspend.rawId) {
        const detailRes = await adminFetch(
          `/api/admin/tutors/${tutorToSuspend.rawId}`,
        );
        if (detailRes.ok) {
          const dto = await detailRes.json();
          setTutorDetail(mapDetailTutor(dto));
          setSelectedTutor((prev) =>
            prev ? { ...prev, status: normalizeStatus(dto.status) } : prev,
          );
        }
      }
    } catch (err) {
      console.error(`${endpoint} error:`, err);
    } finally {
      setTutorToSuspend(null);
    }
  };

  // ============================================================
  // PDF — LIST
  // ============================================================
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TUTR - Tutor Management Report", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Status: ${statusFilter} | Category: ${categoryFilter} | Mode: ${modeFilter} | Date: ${new Date().toLocaleDateString()}`,
      14,
      22,
    );

    const tableHeaders = [
      ["ID", "Name", "Title", "Subjects", "Rating", "Status"],
    ];
    const tableRows = tutors.map((t) => [
      t.id,
      t.name,
      t.title,
      t.subjects.join(", "),
      `${t.rating.toFixed(1)} (${t.reviewsCount})`,
      t.status,
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    doc.save(`Tutor_Report_${statusFilter}_${categoryFilter}.pdf`);
  };

  // ============================================================
  // PDF — INDIVIDUAL TUTOR
  // ============================================================
  const handleExportIndividualPDF = () => {
    if (!tutorDetail) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 15;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TUTR - Tutor Profile", margin, y);
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
    doc.text(tutorDetail.name || "—", margin, y);
    y += 5;

    if (tutorDetail.bio) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(90, 90, 90);
      const bioLines = doc.splitTextToSize(
        tutorDetail.bio,
        pageWidth - margin * 2,
      );
      doc.text(bioLines, margin, y);
      doc.setTextColor(0, 0, 0);
      y += bioLines.length * 4 + 4;
    }

    const rawStatus = (tutorDetail.status || "UNKNOWN").toString();
    const isActive = rawStatus.toUpperCase() === "ACTIVE";
    const isInactive = rawStatus.toUpperCase() === "INACTIVE";

    let fillR = 254,
      fillG = 226,
      fillB = 226;
    let textR = 185,
      textG = 28,
      textB = 28;
    if (isActive) {
      fillR = 220;
      fillG = 252;
      fillB = 231;
      textR = 22;
      textG = 163;
      textB = 74;
    } else if (isInactive) {
      fillR = 243;
      fillG = 244;
      fillB = 246;
      textR = 107;
      textG = 114;
      textB = 128;
    }

    doc.setFillColor(fillR, fillG, fillB);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textR, textG, textB);
    doc.text(`Account Status:  ${rawStatus}`, margin + 4, y + 6.5);
    doc.setTextColor(0, 0, 0);
    y += 16;

    autoTable(doc, {
      startY: y,
      head: [["Personal Information", ""]],
      body: [
        ["Title", tutorDetail.title || "—"],
        ["Email", tutorDetail.email || "—"],
        ["Gender", tutorDetail.gender || "—"],
        ["Date of Birth", tutorDetail.dateOfBirth || "—"],
        ["Phone", tutorDetail.phoneNumber || "—"],
        ["Location", tutorDetail.location || "—"],
        ["University", tutorDetail.university || "—"],
        ["High School", tutorDetail.highSchool || "—"],
        ["Work Experience", tutorDetail.workExperience || "—"],
      ],
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
      head: [
        [
          "Total Courses",
          "Avg. Rating",
          "Active Students",
          "Reports",
          "Warnings",
        ],
      ],
      body: [
        [
          String(tutorDetail.totalCourses ?? 0),
          String(tutorDetail.avgRating ?? 0),
          String(tutorDetail.activeStudents ?? 0),
          String(tutorDetail.reports ?? 0),
          String(tutorDetail.warnings ?? 0),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ✅ Warning history table in PDF
    if (tutorDetail.warningHistory?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Warning Reason", "Issued On"]],
        body: tutorDetail.warningHistory.map((w) => [
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

    if (tutorDetail.offeredCourses?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Offered Courses", "Category", "Mode", "Base Price"]],
        body: tutorDetail.offeredCourses.map((c) => [
          c.name || "—",
          c.category || "—",
          c.mode || "—",
          formatPrice(c.basePrice),
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (tutorDetail.currentStudents?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Current Students", "Subject", "Base Price", "Accepted"]],
        body: tutorDetail.currentStudents.map((s) => [
          s.name || "—",
          s.subject || "—",
          formatPrice(s.basePrice),
          formatPrice(s.agreedPrice),
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (tutorDetail.deals?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [
          [
            "Deals",
            "Category",
            "Mode",
            "Student",
            "Base Price",
            "Bid Price",
            "Status",
          ],
        ],
        body: tutorDetail.deals.map((d) => [
          d.course || "—",
          d.category || "—",
          d.mode || "—",
          d.student || "—",
          formatPrice(d.basePrice),
          formatPrice(d.bidPrice),
          d.status || "—",
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
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

    const safeName = (tutorDetail.name || "Tutor").replace(/\s+/g, "_");
    doc.save(`Tutor_${safeName}_${tutorDetail.id}.pdf`);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-gray-200 text-gray-700";
      case "Suspended":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-blue-100 text-blue-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Deleted":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Tutor Management
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                  Oversee, verify, and monitor educational professional
                  performance.
                </p>
              </div>
              <button
                onClick={handleExportPDF}
                className="self-start sm:self-auto px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
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

            {/* Filters */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <CustomDropdown
                  label="STATUS"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={["All Tutors", "Active", "Inactive", "Suspended"]}
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
              <div className="text-gray-400 text-[11px] sm:text-xs font-medium shrink-0">
                Showing {tutors.length} tutors
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                    <th className="py-4 px-6">TUTOR</th>
                    <th className="py-4 px-6">SUBJECTS OFFERED</th>
                    <th className="py-4 px-6">RATING</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-400 text-xs font-medium"
                      >
                        Loading tutors...
                      </td>
                    </tr>
                  ) : tutors.length > 0 ? (
                    tutors.map((tutor) => (
                      <tr
                        key={tutor.id}
                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                          selectedTutor?.id === tutor.id ? "bg-gray-50/80" : ""
                        }`}
                        onClick={() => handleOpenTutor(tutor)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={getAvatarSrc(tutor.avatar, tutor.name)}
                              alt={tutor.name}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-xs hover:underline">
                                {tutor.name}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                                {tutor.title}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {tutor.subjects.slice(0, 3).map((sub, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide"
                              >
                                {sub}
                              </span>
                            ))}
                            {tutor.subjects.length > 3 && (
                              <span className="text-[9px] text-gray-400 font-bold">
                                +{tutor.subjects.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 font-bold text-gray-900">
                            <span>★</span>
                            <span>{tutor.rating.toFixed(1)}</span>
                            <span className="text-gray-400 font-normal text-[10px]">
                              ({tutor.reviewsCount})
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeStyle(
                              tutor.status,
                            )}`}
                          >
                            {tutor.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTutor(tutor);
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-400 text-xs font-medium"
                      >
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

      {/* Tutor Details Drawer */}
      {selectedTutor && (
        <aside className="w-full sm:w-96 bg-white border-l border-gray-200 h-screen overflow-y-auto flex flex-col justify-between p-6 pt-16 sm:pt-6 shadow-xl z-20 fixed sm:sticky right-0 top-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900">Tutor Details</h3>
              <button
                onClick={handleCloseTutor}
                className="text-gray-400 hover:text-black cursor-pointer text-sm p-1"
              >
                ✕
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-12 text-center text-gray-400 text-xs font-medium">
                Loading details...
              </div>
            ) : tutorDetail ? (
              <>
                <div className="text-center space-y-2">
                  <img
                    src={getAvatarSrc(tutorDetail.avatar, tutorDetail.name)}
                    alt={tutorDetail.name}
                    className="w-20 h-20 rounded-2xl object-cover mx-auto"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">
                      {tutorDetail.name}
                    </h4>
                    {tutorDetail.bio && (
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5 px-2">
                        {tutorDetail.bio}
                      </p>
                    )}
                  </div>
                  {tutorDetail.credentialVerified && (
                    <div className="inline-flex items-center gap-1 text-green-600 font-semibold text-[11px] pt-1">
                      <span>✔</span>
                      <span>Credential Verified</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Email
                  </h5>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-gray-900 break-all">
                      {tutorDetail.email}
                    </p>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        tutorDetail.email,
                      )}&su=${encodeURIComponent(
                        `TUTR - Message for ${tutorDetail.name}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Email Tutor
                    </a>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <DetailField label="Gender" value={tutorDetail.gender} />
                    <DetailField
                      label="Date of Birth"
                      value={tutorDetail.dateOfBirth}
                    />
                    <DetailField
                      label="Phone"
                      value={tutorDetail.phoneNumber}
                    />
                    <DetailField
                      label="Location"
                      value={tutorDetail.location}
                    />
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Education
                  </h5>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
                    <div>
                      <p className="text-[8px] font-bold uppercase text-gray-400 tracking-wider">
                        University
                      </p>
                      <p className="text-[11px] font-semibold text-gray-900">
                        {tutorDetail.university || "—"}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-[8px] font-bold uppercase text-gray-400 tracking-wider">
                        High School
                      </p>
                      <p className="text-[11px] font-semibold text-gray-900">
                        {tutorDetail.highSchool || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Work Experience
                  </h5>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-gray-900">
                      {tutorDetail.workExperience || "—"}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] font-bold uppercase text-gray-400 block tracking-wider">
                      TOTAL COURSES
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {tutorDetail.totalCourses}
                    </span>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] font-bold uppercase text-gray-400 block tracking-wider">
                      AVG. RATING
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {tutorDetail.avgRating}
                    </span>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] font-bold uppercase text-gray-400 block tracking-wider">
                      ACTIVE STUDENTS
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {tutorDetail.activeStudents}
                    </span>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] font-bold uppercase text-gray-400 block tracking-wider">
                      REPORTS
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {tutorDetail.reports}
                    </span>
                  </div>
                </div>

                {/* Warnings with reasons */}
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold uppercase text-amber-600 tracking-wider">
                      WARNINGS
                    </span>
                    {(tutorDetail.warnings ?? 0) >= 3 && (
                      <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wide">
                        At Limit
                      </span>
                    )}
                  </div>

                  <span className="text-base font-bold text-amber-700 block">
                    {tutorDetail.warnings ?? 0}
                  </span>

                  {tutorDetail.warningHistory &&
                  tutorDetail.warningHistory.length > 0 ? (
                    <div className="space-y-1.5 pt-2 border-t border-amber-200">
                      {tutorDetail.warningHistory.map((w) => (
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

                {/* Offered Courses */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Offered Courses
                  </h5>
                  {tutorDetail.offeredCourses.length > 0 ? (
                    <div className="space-y-2">
                      {tutorDetail.offeredCourses.map((course, index) => (
                        <TutorCourseCard key={index} course={course} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      No courses offered yet.
                    </p>
                  )}
                </div>

                {/* Current Students */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Current Students
                  </h5>
                  {tutorDetail.currentStudents.length > 0 ? (
                    <div className="space-y-2">
                      {tutorDetail.currentStudents.map((s, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-1.5"
                        >
                          <p className="text-xs font-bold text-gray-900">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {s.subject}
                          </p>
                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                            {s.agreedPrice < s.basePrice ? (
                              <>
                                <span className="text-[10px] font-medium text-gray-400 line-through">
                                  {formatPrice(s.basePrice)}
                                </span>
                                <span className="text-[11px] font-bold text-gray-900">
                                  {formatPrice(s.agreedPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-900">
                                {formatPrice(s.basePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      No current students.
                    </p>
                  )}
                </div>

                {/* Deals */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Deals
                  </h5>
                  {tutorDetail.deals.length > 0 ? (
                    <div className="space-y-2">
                      {tutorDetail.deals.map((deal, idx) => (
                        <TutorDealCard key={idx} deal={deal} />
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

          {/* Footer */}
          <div className="pt-6 border-t border-gray-100 space-y-2">
            <button
              onClick={handleExportIndividualPDF}
              disabled={!tutorDetail || isLoadingDetail}
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
              Export Tutor PDF
            </button>

            {selectedTutor.status === "Suspended" ? (
              <button
                onClick={() => setTutorToSuspend(selectedTutor)}
                className="w-full py-2.5 border border-green-300 text-green-700 text-xs font-bold rounded-xl hover:bg-green-50 transition-colors cursor-pointer"
              >
                REACTIVATE TUTOR
              </button>
            ) : (
              <button
                onClick={() => setTutorToSuspend(selectedTutor)}
                className="w-full py-2.5 border border-red-300 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              >
                SUSPEND TUTOR
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Suspend / Reactivate Confirmation Modal */}
      {tutorToSuspend &&
        (() => {
          const isSuspend = tutorToSuspend.status === "Active";
          return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-xl space-y-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {isSuspend ? "Suspend Tutor" : "Reactivate Tutor"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {isSuspend ? (
                      <>
                        Are you sure you want to suspend{" "}
                        <span className="font-semibold text-gray-900">
                          {tutorToSuspend.name}
                        </span>
                        ? Their account will be temporarily disabled, and all
                        their active connections with students will be
                        cancelled.
                      </>
                    ) : (
                      <>
                        Are you sure you want to reactivate{" "}
                        <span className="font-semibold text-gray-900">
                          {tutorToSuspend.name}
                        </span>
                        ? Their account will regain full access to TUTR
                        immediately.
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setTutorToSuspend(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    className={`px-4 py-2 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isSuspend
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isSuspend ? "Confirm Suspend" : "Confirm Reactivate"}
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

const TutorCourseCard = ({ course }) => (
  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
    <p className="text-xs font-bold text-gray-900 leading-snug">
      {course.name}
    </p>
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
        {course.category}
      </span>
      <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
        {course.mode}
      </span>
    </div>
    <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
      <span className="text-[11px] font-bold text-gray-900">
        {formatPrice(course.basePrice)}
      </span>
    </div>
  </div>
);

const TutorDealCard = ({ deal }) => {
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
        <span className="font-medium">{deal.student}</span>
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

export default TutorManagement;
