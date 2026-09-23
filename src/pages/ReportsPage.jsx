import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPage from "./NotificationsPage";
import { adminFetch, getImageUrl } from "../api/adminClient";

// ============================================================
// HELPERS
// ============================================================

const formatReason = (r) => {
  if (!r) return "—";
  return r
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeAgo = (dt) => {
  if (!dt) return "";
  const seconds = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Reasons vary by report type
const getSeverity = (reason) => {
  const high = [
    "HARASSMENT",
    "ABUSIVE_LANGUAGE",
    "FRAUD_OR_SCAM",
    "FAKE_CREDENTIALS",
    "NON_PAYMENT",
    "FALSE_REPORT_ABUSE",
  ];
  const medium = [
    "NO_SHOW",
    "POOR_TEACHING",
    "UNPROFESSIONAL_CONDUCT",
    "DISRESPECTFUL_CONDUCT",
    "UNREALISTIC_DEMANDS",
  ];
  if (high.includes(reason))
    return { label: "High", color: "bg-red-100 text-red-700" };
  if (medium.includes(reason))
    return { label: "Medium", color: "bg-amber-100 text-amber-700" };
  return { label: "Low", color: "bg-blue-100 text-blue-700" };
};

const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-red-100 text-red-700";
    case "UNDER_REVIEW":
      return "bg-amber-100 text-amber-700";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "DISMISSED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "PENDING":
      return "New";
    case "UNDER_REVIEW":
      return "Under Review";
    case "RESOLVED":
      return "Resolved";
    case "DISMISSED":
      return "Dismissed";
    default:
      return status;
  }
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const ReportsPage = () => {
  const [viewState, setViewState] = useState("reports");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ NEW — toggle between report types
  // "tutor" = student reports tutor (default)
  // "student" = tutor reports student
  const [reportType, setReportType] = useState("tutor");

  // Filter tab: which status we're viewing
  const [activeTab, setActiveTab] = useState("PENDING");

  // Data
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Detail
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Admin notes buffer (before submitting action)
  const [adminNotes, setAdminNotes] = useState("");

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    resolvedToday: 0,
    totalWarnings: 0,
  });

  // Action modal
  const [modalAction, setModalAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evidence lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // ✅ NEW — base URL switches based on report type
  const baseUrl =
    reportType === "tutor"
      ? "/api/admin/reports"
      : "/api/admin/student-reports";

  // ============================================================
  // FETCH REPORTS LIST
  // ============================================================
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const payload = {
        status: activeTab,
        searchQuery: searchQuery.trim() || null,
      };

      const res = await adminFetch(`${baseUrl}/filter`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);

      if (data.length > 0) {
        const stillExists = data.find((r) => r.id === selectedReportId);
        handleOpenReport(stillExists || data[0]);
      } else {
        setSelectedReportId(null);
        setReportDetail(null);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
      setSelectedReportId(null);
      setReportDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchReports, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchQuery, reportType]);

  // ============================================================
  // FETCH STATS
  // ============================================================
  const fetchStats = async () => {
    try {
      const res = await adminFetch(`${baseUrl}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  // ============================================================
  // FETCH DETAIL
  // ============================================================
  const handleOpenReport = async (report) => {
    setSelectedReportId(report.id);
    setReportDetail(null);
    setIsLoadingDetail(true);
    setAdminNotes("");

    try {
      const res = await adminFetch(`${baseUrl}/${report.id}`);
      if (!res.ok) throw new Error("Failed to fetch report details");
      const data = await res.json();
      setReportDetail(data);
      setAdminNotes(data.adminNotes || "");
    } catch (err) {
      console.error("Error fetching report detail:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ============================================================
  // MARK UNDER REVIEW
  // ============================================================
  const handleMarkUnderReview = async () => {
    if (!reportDetail) return;
    setIsSubmitting(true);
    try {
      const res = await adminFetch(
        `${baseUrl}/${reportDetail.id}/mark-under-review`,
        { method: "PATCH" },
      );
      if (!res.ok) throw new Error("Failed");

      await fetchReports();
      await fetchStats();

      const detailRes = await adminFetch(`${baseUrl}/${reportDetail.id}`);
      if (detailRes.ok) setReportDetail(await detailRes.json());
    } catch (err) {
      console.error("Mark under review failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // RESOLVE REPORT
  // ============================================================
  const handleResolve = async (action) => {
    if (!reportDetail) return;

    if (adminNotes.trim().length < 10) {
      alert("Please add at least 10 characters of admin notes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminFetch(`${baseUrl}/${reportDetail.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({
          action,
          adminNotes: adminNotes.trim(),
        }),
      });
      if (!res.ok) throw new Error("Resolve failed");

      setModalAction(null);
      await fetchReports();
      await fetchStats();
    } catch (err) {
      console.error("Resolve failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  const isTutorReport = reportType === "tutor";

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden">
      <Sidebar
        onGenerateReport={() => alert("Generating Complaints Report...")}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search by name..."
        />

        {viewState === "notifications" ? (
          <NotificationsPage onBack={() => setViewState("reports")} />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Reports & Moderation
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isTutorReport
                    ? "Review student reports against tutors and take moderation action."
                    : "Review tutor reports against students and take moderation action."}
                </p>
              </div>

              {/* ✅ TYPE TOGGLE */}
              <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setReportType("tutor")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    reportType === "tutor"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Student → Tutor
                </button>
                <button
                  onClick={() => setReportType("student")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    reportType === "student"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Tutor → Student
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Pending"
                value={stats.pending}
                sub="Awaiting review"
                subColor="text-red-500"
              />
              <StatCard
                label="Under Review"
                value={stats.underReview}
                sub="Being investigated"
                subColor="text-amber-500"
              />
              <StatCard
                label="Resolved Today"
                value={stats.resolvedToday}
                sub="Action taken"
                subColor="text-green-500"
              />
              <StatCard
                label="Warnings Issued"
                value={stats.totalWarnings}
                sub="Total active warnings"
                subColor="text-gray-500"
              />
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: LIST */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-gray-900">
                    Complaints
                  </h3>
                </div>

                {/* TABS */}
                <div className="flex bg-gray-100 p-1 rounded-xl text-[11px] font-semibold text-gray-500">
                  {[
                    { key: "PENDING", label: "New" },
                    { key: "UNDER_REVIEW", label: "Review" },
                    { key: "RESOLVED", label: "Resolved" },
                    { key: "DISMISSED", label: "Dismissed" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        activeTab === tab.key
                          ? "bg-white text-gray-900 shadow-xs"
                          : "hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* LIST */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {isLoading ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      Loading reports...
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No reports in this view.
                    </div>
                  ) : (
                    reports.map((item) => {
                      const isSelected = selectedReportId === item.id;
                      const sev = getSeverity(item.reason);

                      // ✅ Show names in correct order based on report type
                      const fromName = isTutorReport
                        ? item.studentName
                        : item.tutorName;
                      const toName = isTutorReport
                        ? item.tutorName
                        : item.studentName;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenReport(item)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? "border-gray-900 bg-white shadow-xs"
                              : "border-gray-100 hover:border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-gray-400">
                              #RPT-{item.id}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sev.color}`}
                            >
                              {sev.label}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-gray-900">
                            {formatReason(item.reason)}
                          </h4>

                          <p className="text-[11px] text-gray-500 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-600">
                                {fromName}
                              </span>
                              <span>→</span>
                              <span className="font-medium text-gray-600">
                                {toName}
                              </span>
                            </div>
                            <span>{timeAgo(item.reportedAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT: DETAIL */}
              <div className="lg:col-span-7">
                {isLoadingDetail ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-xs">
                    Loading...
                  </div>
                ) : reportDetail ? (
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                    {/* HEADER */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900">
                            {formatReason(reportDetail.reason)}
                          </h2>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(
                              reportDetail.status,
                            )}`}
                          >
                            {getStatusLabel(reportDetail.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Ticket #RPT-{reportDetail.id} •{" "}
                          {formatDate(reportDetail.reportedAt)}
                        </p>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* MAIN COLUMN */}
                      <div className="md:col-span-2 space-y-6">
                        {/* DESCRIPTION */}
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                            Report Details
                          </h4>
                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {reportDetail.description}
                          </p>
                        </div>

                        {/* EVIDENCE */}
                        {reportDetail.evidenceUrls?.length > 0 && (
                          <div>
                            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                              Evidence ({reportDetail.evidenceUrls.length})
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {reportDetail.evidenceUrls.map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() =>
                                    setLightboxUrl(getImageUrl(url))
                                  }
                                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-black cursor-pointer transition-colors"
                                >
                                  <img
                                    src={getImageUrl(url)}
                                    alt={`Evidence ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* RELATED CONNECTION */}
                        {reportDetail.connectionCourseName && (
                          <div>
                            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                              Related Connection
                            </h4>
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs space-y-1">
                              <p className="font-bold text-gray-900">
                                {reportDetail.connectionCourseName}
                              </p>
                              <p className="text-gray-500">
                                Agreed Price: RS.{" "}
                                {Number(
                                  reportDetail.connectionAgreedPrice || 0,
                                ).toLocaleString()}
                              </p>
                              <p className="text-gray-500">
                                Status: {reportDetail.connectionStatus || "—"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ADMIN NOTES */}
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                            Admin Notes
                          </h4>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            disabled={
                              reportDetail.status === "RESOLVED" ||
                              reportDetail.status === "DISMISSED"
                            }
                            placeholder="Add internal notes (min 10 characters)..."
                            rows={3}
                            className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        {/* TIMELINE */}
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">
                            Status Timeline
                          </h4>
                          <div className="space-y-3">
                            <TimelineItem
                              label="Report Received"
                              date={reportDetail.reportedAt}
                              active
                            />
                            {reportDetail.status !== "PENDING" && (
                              <TimelineItem
                                label={
                                  reportDetail.status === "UNDER_REVIEW"
                                    ? "Marked Under Review"
                                    : "Report Resolved"
                                }
                                date={reportDetail.reviewedAt}
                                active
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SIDE COLUMN */}
                      <div className="space-y-4 border-l border-gray-100 pl-4">
                        {/* REPORTER */}
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                            Reporter ({isTutorReport ? "Student" : "Tutor"})
                          </h4>
                          <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[10px]">
                                {(isTutorReport
                                  ? reportDetail.studentName
                                  : reportDetail.tutorName)?.[0] || "?"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs text-gray-900 truncate">
                                  {isTutorReport
                                    ? reportDetail.studentName
                                    : reportDetail.tutorName}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {isTutorReport ? "Student" : "Tutor"}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                (isTutorReport
                                  ? reportDetail.studentEmail
                                  : reportDetail.tutorEmail) || "",
                              )}&su=${encodeURIComponent(
                                `TUTR - Message for ${
                                  isTutorReport
                                    ? reportDetail.studentName
                                    : reportDetail.tutorName
                                }`,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-center w-full py-1.5 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-zinc-800"
                            >
                              Email {isTutorReport ? "Student" : "Tutor"}
                            </a>
                          </div>
                        </div>

                        {/* REPORTED */}
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                            Reported {isTutorReport ? "Tutor" : "Student"}
                          </h4>
                          <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[10px]">
                                {(isTutorReport
                                  ? reportDetail.tutorName
                                  : reportDetail.studentName)?.[0] || "?"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs text-gray-900 truncate">
                                  {isTutorReport
                                    ? reportDetail.tutorName
                                    : reportDetail.studentName}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {isTutorReport
                                    ? reportDetail.tutorStatus || "Tutor"
                                    : reportDetail.studentStatus || "Student"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PREVIOUS OFFENSES */}
                        <div className="bg-white border border-gray-100 rounded-xl p-3">
                          <p className="text-[9px] uppercase font-bold text-gray-400">
                            Previous Offenses
                          </p>
                          <p className="font-bold text-sm text-gray-900 mt-1">
                            {isTutorReport
                              ? (reportDetail.tutorWarningCount ?? 0)
                              : (reportDetail.studentWarningCount ?? 0)}{" "}
                            Warnings
                          </p>
                          {((isTutorReport
                            ? reportDetail.tutorWarningCount
                            : reportDetail.studentWarningCount) ?? 0) >= 3 && (
                            <span className="inline-block mt-1 text-[9px] font-extrabold text-red-500 uppercase tracking-wide">
                              At Limit
                            </span>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            Moderation Actions
                          </h4>

                          {reportDetail.status === "PENDING" && (
                            <button
                              onClick={handleMarkUnderReview}
                              disabled={isSubmitting}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Mark Under Review
                            </button>
                          )}

                          {reportDetail.status === "UNDER_REVIEW" && (
                            <>
                              <button
                                onClick={() => setModalAction("warning")}
                                className="w-full bg-white border border-red-500 hover:bg-red-50 text-red-600 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                              >
                                Issue Official Warning
                              </button>

                              <button
                                onClick={() => setModalAction("suspend")}
                                className="w-full bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                              >
                                Suspend {isTutorReport ? "Tutor" : "Student"}
                              </button>

                              <button
                                onClick={() => setModalAction("dismiss")}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2 rounded-xl transition-colors cursor-pointer"
                              >
                                Dismiss Report
                              </button>
                            </>
                          )}

                          {(reportDetail.status === "RESOLVED" ||
                            reportDetail.status === "DISMISSED") && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                              <p className="text-[10px] text-gray-500">
                                Action Taken
                              </p>
                              <p className="font-bold text-xs text-gray-900 mt-0.5">
                                {reportDetail.actionTaken
                                  ?.replace(/_/g, " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-xs">
                    Select a report to view details.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* WARNING MODAL */}
      {modalAction === "warning" && reportDetail && (
        <ConfirmModal
          title="Issue Official Warning"
          description={
            <>
              This will send a formal warning to{" "}
              <span className="font-semibold text-gray-900">
                {isTutorReport
                  ? reportDetail.tutorName
                  : reportDetail.studentName}
              </span>{" "}
              and increment their warning count.
            </>
          }
          confirmText="Send Warning"
          confirmClass="bg-black hover:bg-zinc-800"
          onConfirm={() => handleResolve("WARNING_ISSUED")}
          onCancel={() => setModalAction(null)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* SUSPEND MODAL */}
      {modalAction === "suspend" && reportDetail && (
        <ConfirmModal
          title={`Suspend ${isTutorReport ? "Tutor" : "Student"}`}
          description={
            <>
              Are you sure you want to suspend{" "}
              <span className="font-semibold text-gray-900">
                {isTutorReport
                  ? reportDetail.tutorName
                  : reportDetail.studentName}
              </span>
              ? This will disable their account and cancel all active
              connections.
            </>
          }
          confirmText={`Suspend ${isTutorReport ? "Tutor" : "Student"}`}
          confirmClass="bg-[#D32F2F] hover:bg-red-700"
          onConfirm={() => handleResolve("SUSPENDED")}
          onCancel={() => setModalAction(null)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* DISMISS MODAL */}
      {modalAction === "dismiss" && reportDetail && (
        <ConfirmModal
          title="Dismiss Report"
          description={
            <>
              Are you sure you want to dismiss report{" "}
              <span className="font-semibold text-gray-900">
                #RPT-{reportDetail.id}
              </span>
              ? The reporter will be notified.
            </>
          }
          confirmText="Dismiss Report"
          confirmClass="bg-black hover:bg-zinc-800"
          onConfirm={() => handleResolve("DISMISSED")}
          onCancel={() => setModalAction(null)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* LIGHTBOX */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 cursor-pointer"
        >
          <img
            src={lightboxUrl}
            alt="Evidence"
            className="max-w-full max-h-full rounded-lg"
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

const StatCard = ({ label, value, sub, subColor }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
      {label}
    </p>
    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    <p className={`text-[11px] font-medium mt-1 ${subColor}`}>{sub}</p>
  </div>
);

const TimelineItem = ({ label, date, active }) => (
  <div className="flex items-start gap-3 text-xs">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
        active ? "bg-black text-white" : "bg-gray-200 text-gray-400"
      }`}
    >
      ✓
    </div>
    <div>
      <p className="font-bold text-gray-900 text-xs">{label}</p>
      <p className="text-[10px] text-gray-400">{formatDate(date)}</p>
    </div>
  </div>
);

const ConfirmModal = ({
  title,
  description,
  confirmText,
  confirmClass,
  onConfirm,
  onCancel,
  isSubmitting,
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
      <div>
        <h4 className="text-base font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="space-y-2 pt-2">
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`w-full py-2.5 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${confirmClass}`}
        >
          {isSubmitting ? "Processing..." : confirmText}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default ReportsPage;
