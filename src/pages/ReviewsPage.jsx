import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPage from "./NotificationsPage";
import { adminFetch, getImageUrl } from "../api/adminClient";

// ============================================================
// CUSTOM DROPDOWN
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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg px-3 py-1.5 text-xs outline-none cursor-pointer flex items-center justify-between gap-2 transition-colors"
      >
        <span>{value || label}</span>
        <svg
          className="w-3 h-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                value === option
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
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

// ============================================================
// HELPERS
// ============================================================
const formatCategory = (cat) => {
  if (!cat) return "—";
  return cat
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatMode = (mode) => {
  if (!mode) return "—";
  return mode
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const fallbackAvatar = (name = "") => {
  const initials = (name || "S T")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials,
  )}&background=E5E7EB&color=374151&bold=true&size=128`;
};

const getAvatarSrc = (url, name) => {
  if (url && typeof url === "string" && url.trim() !== "") return url;
  return fallbackAvatar(name);
};

// ============================================================
// MAPPER — Backend DTO → Frontend shape
// ============================================================
const mapReviewFromBackend = (dto) => ({
  id: dto.id,
  studentName: dto.studentName,
  avatar: getImageUrl(dto.studentImage) || fallbackAvatar(dto.studentName),
  course: dto.courseSubject,
  category: formatCategory(dto.category),
  mode: formatMode(dto.mode),
  tutor: dto.tutorName,
  date: formatDate(dto.createdAt),
  rating: dto.rating,
  comment: dto.review ? `"${dto.review}"` : "",
});

// ============================================================
// STARS
// ============================================================
const StarRating = ({ count }) => (
  <div className="flex items-center gap-0.5 text-black">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="text-xs">
        {star <= count ? "★" : "☆"}
      </span>
    ))}
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const ReviewsPage = () => {
  const [activePage] = useState("reviews");
  const [viewState, setViewState] = useState("reviews");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter States
  const [tutorFilter, setTutorFilter] = useState("All Tutors");
  const [modeFilter, setModeFilter] = useState("All Modes");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // Data
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Tutors list (only ACTIVE, INACTIVE, SUSPENDED)
  const [tutorList, setTutorList] = useState([]); // { id, name }

  // Stats
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    positiveRatio: 0,
    negativeRatio: 0,
    distribution: { five: 0, four: 0, three: 0, two: 0, one: 0 },
  });

  // Modal States
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionReview, setActionReview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================
  // FETCH TUTORS (only ACTIVE + INACTIVE + SUSPENDED)
  // ============================================================
  const fetchTutors = async () => {
    try {
      const [activeRes, inactiveRes, suspendedRes] = await Promise.all([
        adminFetch("/api/admin/tutors/filter", {
          method: "POST",
          body: JSON.stringify({ status: "ACTIVE" }),
        }),
        adminFetch("/api/admin/tutors/filter", {
          method: "POST",
          body: JSON.stringify({ status: "INACTIVE" }),
        }),
        adminFetch("/api/admin/tutors/filter", {
          method: "POST",
          body: JSON.stringify({ status: "SUSPENDED" }),
        }),
      ]);

      const [activeData, inactiveData, suspendedData] = await Promise.all([
        activeRes.ok ? activeRes.json() : [],
        inactiveRes.ok ? inactiveRes.json() : [],
        suspendedRes.ok ? suspendedRes.json() : [],
      ]);

      const all = [
        ...(Array.isArray(activeData) ? activeData : []),
        ...(Array.isArray(inactiveData) ? inactiveData : []),
        ...(Array.isArray(suspendedData) ? suspendedData : []),
      ];

      setTutorList(all.map((t) => ({ id: t.id, name: t.name })));
    } catch (err) {
      console.error("Failed to fetch tutors:", err);
      setTutorList([]);
    }
  };

  // ============================================================
  // FETCH REVIEWS
  // ============================================================
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // Resolve tutor name → ID
      let tutorId = null;
      if (tutorFilter !== "All Tutors") {
        const found = tutorList.find((t) => t.name === tutorFilter);
        if (found) tutorId = found.id;
      }

      const payload = {
        tutorId,
        category:
          categoryFilter === "All Categories"
            ? null
            : categoryFilter.replace(" ", "_").toUpperCase(),
        mode:
          modeFilter === "All Modes"
            ? null
            : modeFilter.replace("'", "").replace(" ", "_").toUpperCase(),
        rating:
          ratingFilter === "All Ratings" ? null : parseInt(ratingFilter, 10),
        searchQuery: searchQuery.trim() || null,
      };

      const res = await adminFetch("/api/admin/reviews/filter", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.map(mapReviewFromBackend));
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // FETCH STATS
  // ============================================================
  const fetchStats = async () => {
    try {
      const res = await adminFetch("/api/admin/reviews/stats");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Load tutors once on mount
  useEffect(() => {
    fetchTutors();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch reviews when filters/search change (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchReviews();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tutorFilter,
    modeFilter,
    ratingFilter,
    categoryFilter,
    searchQuery,
    tutorList,
  ]);

  // ============================================================
  // DELETE REVIEW
  // ============================================================
  const handleDeleteReview = async () => {
    if (!actionReview) return;
    setIsDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/reviews/${actionReview.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setActionReview(null);
      await fetchReviews();
      await fetchStats();
    } catch (err) {
      console.error("Delete review failed:", err);
      alert("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================
  // OPTIONS
  // ============================================================
  const tutorOptions = ["All Tutors", ...tutorList.map((t) => t.name)];
  const modeOptions = ["All Modes", "Online", "Student's Home", "Tutor's Home"];
  const ratingOptions = [
    "All Ratings",
    "5 Stars",
    "4 Stars",
    "3 Stars",
    "2 Stars",
    "1 Star",
  ];
  const categoryOptions = [
    "All Categories",
    "O Level",
    "A Level",
    "Entry Test",
    "Matric",
    "Intermediate",
  ];

  // ============================================================
  // PDF EXPORT
  // ============================================================
  const handleExportData = async () => {
    if (reviews.length === 0) {
      alert("No data available to export.");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Student Reviews Report", 14, 20);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
      doc.text(`Total Entries: ${reviews.length}`, 14, 31);

      const headers = [
        [
          "ID",
          "Student Name",
          "Course",
          "Category",
          "Mode",
          "Tutor",
          "Rating",
          "Date",
          "Comment",
        ],
      ];

      const rows = reviews.map((rev) => [
        rev.id,
        rev.studentName,
        rev.course,
        rev.category,
        rev.mode,
        rev.tutor,
        `${rev.rating} Stars`,
        rev.date,
        rev.comment.replace(/^"|"$/g, ""),
      ]);

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 38,
        theme: "striped",
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 20 },
          6: { cellWidth: 14 },
          7: { cellWidth: 18 },
          8: { cellWidth: "auto" },
        },
      });

      doc.save(`reviews_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to generate PDF export. Please try again.");
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden">
      <Sidebar activePage={activePage} onGenerateReport={handleExportData} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search students, tutors, or courses..."
        />

        {viewState === "notifications" ? (
          <NotificationsPage onBack={() => setViewState("reviews")} />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Student Reviews
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Manage community integrity and monitor instructional quality
                  across all active courses.
                </p>
              </div>

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
                Export Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Filter Bar */}
                <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <CustomDropdown
                      label="Select Tutor"
                      value={tutorFilter}
                      onChange={setTutorFilter}
                      options={tutorOptions}
                    />
                    <CustomDropdown
                      label="Select Mode"
                      value={modeFilter}
                      onChange={setModeFilter}
                      options={modeOptions}
                    />
                    <CustomDropdown
                      label="Select Category"
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                      options={categoryOptions}
                    />
                    <CustomDropdown
                      label="Select Rating"
                      value={ratingFilter}
                      onChange={setRatingFilter}
                      options={ratingOptions}
                    />
                  </div>
                  <span className="text-gray-400 text-[11px] font-medium">
                    Showing {reviews.length} entries
                  </span>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="bg-white rounded-2xl p-12 text-center text-xs text-gray-400 border border-gray-100">
                      Loading reviews...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center text-xs text-gray-400 border border-gray-100">
                      No reviews found matching the selected filters.
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={rev.avatar}
                              alt={rev.studentName}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackAvatar(rev.studentName);
                              }}
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">
                                {rev.studentName}
                              </h4>
                              <p className="text-[11px] text-gray-500">
                                Course:{" "}
                                <span className="font-medium text-gray-800">
                                  {rev.course}
                                </span>{" "}
                                • Category:{" "}
                                <span className="font-medium text-gray-800">
                                  {rev.category}
                                </span>{" "}
                                • Mode:{" "}
                                <span className="font-medium text-gray-800">
                                  {rev.mode}
                                </span>{" "}
                                • Tutor:{" "}
                                <span className="font-medium text-gray-800">
                                  {rev.tutor}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <StarRating count={rev.rating} />
                            <span className="text-[10px] text-gray-400 font-medium block mt-1">
                              {rev.date}
                            </span>
                          </div>
                        </div>

                        {rev.comment && (
                          <p className="text-xs text-gray-700 leading-relaxed italic">
                            {rev.comment}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase bg-gray-100 text-gray-500">
                              VERIFIED
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedReview(rev)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Analytics Sidebar */}
              <div className="space-y-5">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center space-y-3">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                    AVERAGE PLATFORM RATING
                  </span>
                  <div className="text-4xl font-extrabold text-gray-900">
                    {stats.averageRating}
                  </div>
                  <div className="flex justify-center">
                    <StarRating count={Math.round(stats.averageRating)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        TOTAL REVIEWS
                      </p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">
                        {stats.totalReviews.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        POS/NEG RATIO
                      </p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">
                        {stats.positiveRatio}% / {stats.negativeRatio}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900">
                    Rating Distribution
                  </h4>
                  <div className="space-y-2">
                    {[
                      { stars: 5, pct: stats.distribution.five },
                      { stars: 4, pct: stats.distribution.four },
                      { stars: 3, pct: stats.distribution.three },
                      { stars: 2, pct: stats.distribution.two },
                      { stars: 1, pct: stats.distribution.one },
                    ].map((row) => (
                      <div
                        key={row.stars}
                        className="flex items-center gap-3 text-[11px]"
                      >
                        <span className="w-2 font-bold text-gray-600">
                          {row.stars}
                        </span>
                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-black h-full rounded-full"
                            style={{ width: `${row.pct}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right text-gray-400 font-medium text-[10px]">
                          {row.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedReview.avatar}
                  alt={selectedReview.studentName}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackAvatar(selectedReview.studentName);
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {selectedReview.studentName}
                  </h4>
                  <p className="text-xs text-gray-500">{selectedReview.date}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <p>
                <strong className="text-gray-900">Course:</strong>{" "}
                {selectedReview.course}
              </p>
              <p>
                <strong className="text-gray-900">Category:</strong>{" "}
                {selectedReview.category}
              </p>
              <p>
                <strong className="text-gray-900">Mode:</strong>{" "}
                {selectedReview.mode}
              </p>
              <p>
                <strong className="text-gray-900">Tutor:</strong>{" "}
                {selectedReview.tutor}
              </p>
              <p>
                <strong className="text-gray-900">Rating:</strong>{" "}
                {selectedReview.rating} / 5
              </p>
              {selectedReview.comment && (
                <div className="pt-2">
                  <strong className="text-gray-900 block mb-1">
                    Feedback:
                  </strong>
                  <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 italic text-gray-800">
                    {selectedReview.comment}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setActionReview(selectedReview);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Remove Review
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {actionReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Remove Review
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to permanently remove the review from{" "}
                <span className="font-semibold text-gray-900">
                  {actionReview.studentName}
                </span>{" "}
                regarding tutor{" "}
                <span className="font-semibold text-gray-900">
                  {actionReview.tutor}
                </span>
                ? This cannot be undone.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDeleteReview}
                disabled={isDeleting}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Yes, Remove Review"}
              </button>
              <button
                onClick={() => setActionReview(null)}
                disabled={isDeleting}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ReviewsPage;
