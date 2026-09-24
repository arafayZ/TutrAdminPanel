import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import NotificationsPage from "./NotificationsPage";
import Navbar from "../components/Navbar";
import { adminFetch, getImageUrl } from "../api/adminClient";

// ============================================================
// HELPERS
// ============================================================

const timeAgo = (dt) => {
  if (!dt) return "";
  const seconds = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const statusLabel = (status) => {
  if (!status) return "Pending";
  const s = String(status).toUpperCase();
  if (s === "PENDING") return "Pending";
  if (s === "APPROVED") return "Approved";
  if (s === "REJECTED") return "Rejected";
  return status;
};

// ✅ Detect file type from URL
const getFileType = (url) => {
  if (!url) return "unknown";
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|bmp)$/.test(clean)) return "image";
  if (/\.pdf$/.test(clean)) return "pdf";
  if (/\.(doc|docx|ppt|pptx|xls|xlsx|txt|csv)$/.test(clean)) return "doc";
  return "unknown";
};

// ============================================================
// AVATAR FALLBACK
// ============================================================
const getAvatarSrc = (url, name = "") => {
  if (url && typeof url === "string" && url.trim() !== "") {
    return url;
  }
  const initials = (name || "T T")
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

const mapFromBackend = (dto) => {
  const isBanned = dto.accountStatus === "BANNED";
  const displayStatus = isBanned ? "Banned" : statusLabel(dto.status);

  const cnicUrl = dto.cnicImageUrl ? getImageUrl(dto.cnicImageUrl) : null;
  const certUrl = dto.certificateImageUrl
    ? getImageUrl(dto.certificateImageUrl)
    : null;

  return {
    id: dto.id,
    userId: dto.userId,
    name: dto.tutorName || "Tutor",
    email: dto.email || "",
    phone: dto.phone || "—",

    headline: dto.headline || "",
    bio: dto.headline || "",
    location: dto.location || "—",
    institution: dto.universityName || "—",
    highSchool: dto.collegeName || "—",
    experience: dto.workExperience || "—",
    gender: dto.gender || "—",
    dateOfBirth: dto.dateOfBirth || "—",
    subject: "",
    status: displayStatus,
    accountStatus: dto.accountStatus || null,
    isBanned,
    uploadedAt: dto.uploadedAt,
    verifiedAt: dto.verifiedAt,
    appliedTime: dto.uploadedAt
      ? `APPLIED ${timeAgo(dto.uploadedAt).toUpperCase()}`
      : "—",
    rejectionReason: dto.rejectionReason || null,
    resubmissionCount: dto.resubmissionCount ?? 0,
    avatar: getImageUrl(dto.profilePicture),
    documents: [
      cnicUrl && {
        id: 1,
        title: "CNIC",
        type: getFileType(cnicUrl),
        url: cnicUrl,
      },
      certUrl && {
        id: 2,
        title: "CERTIFICATE",
        type: getFileType(certUrl),
        url: certUrl,
      },
    ].filter(Boolean),
  };
};

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
// DOCUMENT THUMBNAIL (in card grid)
// ============================================================
const DocumentThumbnail = ({ doc, onClick }) => (
  <div
    onClick={onClick}
    className="relative group h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer"
  >
    {doc.type === "image" ? (
      <img
        src={doc.url}
        alt={doc.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    ) : doc.type === "pdf" ? (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
        <svg
          className="w-8 h-8 text-red-600 mb-1"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
        </svg>
        <span className="text-[9px] font-bold text-red-700 uppercase tracking-wider">
          PDF
        </span>
      </div>
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50">
        <svg
          className="w-8 h-8 text-blue-600 mb-1"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
        </svg>
        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">
          DOC
        </span>
      </div>
    )}

    {/* Overlay + label */}
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors pointer-events-none"></div>
    <span className="absolute bottom-2 left-2 right-2 text-[9px] font-bold text-white uppercase tracking-wider truncate drop-shadow-xs">
      {doc.title}
    </span>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const VerificationRequests = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewState, setViewState] = useState("dashboard");

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [counts, setCounts] = useState({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Banned: 0,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const [activeRejectId, setActiveRejectId] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [permanentBanFlags, setPermanentBanFlags] = useState({});

  const [viewingDocument, setViewingDocument] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [processingIds, setProcessingIds] = useState(new Set());

  // ============================================================
  // FETCH COUNTS
  // ============================================================
  const fetchCounts = async () => {
    try {
      const [pRes, aRes, rRes] = await Promise.all([
        adminFetch(`/api/admin/verifications?status=PENDING`),
        adminFetch(`/api/admin/verifications?status=APPROVED`),
        adminFetch(`/api/admin/verifications?status=REJECTED`),
      ]);

      const [p, a, r] = await Promise.all([
        pRes.ok ? pRes.json() : [],
        aRes.ok ? aRes.json() : [],
        rRes.ok ? rRes.json() : [],
      ]);

      const pendingList = Array.isArray(p) ? p : [];
      const approvedList = Array.isArray(a) ? a : [];
      const rejectedList = Array.isArray(r) ? r : [];

      const bannedCount = rejectedList.filter(
        (item) => item.accountStatus === "BANNED",
      ).length;
      const rejectedOnly = rejectedList.filter(
        (item) => item.accountStatus !== "BANNED",
      ).length;

      setCounts({
        Pending: pendingList.length,
        Approved: approvedList.length,
        Rejected: rejectedOnly,
        Banned: bannedCount,
      });
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  };

  // ============================================================
  // FETCH ACTIVE LIST
  // ============================================================
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const backendStatus =
        activeTab === "Banned" ? "REJECTED" : activeTab.toUpperCase();

      const res = await adminFetch(
        `/api/admin/verifications?status=${backendStatus}`,
      );
      if (!res.ok) throw new Error("Failed to fetch verifications");
      const data = await res.json();

      let mapped = data.map(mapFromBackend);

      if (activeTab === "Banned") {
        mapped = mapped.filter((item) => item.isBanned);
      } else if (activeTab === "Rejected") {
        mapped = mapped.filter((item) => !item.isBanned);
      }

      setRequests(mapped);
    } catch (err) {
      console.error("Error fetching verifications:", err);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    setActiveRejectId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // PROCESSING HELPERS
  // ============================================================
  const markProcessing = (id) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const unmarkProcessing = (id) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // ============================================================
  // APPROVE
  // ============================================================
  const handleApprove = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Tutor Application",
      message: `Are you sure you want to approve ${name} as a verified tutor on TUTR?`,
      action: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        markProcessing(id);
        try {
          const res = await adminFetch(
            `/api/admin/verifications/${id}/decide`,
            {
              method: "POST",
              body: JSON.stringify({ status: "APPROVED" }),
            },
          );
          if (!res.ok) throw new Error("Approve failed");
          await fetchRequests();
          await fetchCounts();
        } catch (err) {
          console.error("Approve failed:", err);
          alert("Failed to approve. Please try again.");
        } finally {
          unmarkProcessing(id);
        }
      },
    });
  };

  // ============================================================
  // REJECT
  // ============================================================
  const handleFinalRejectSubmit = (id, name) => {
    const reason = rejectionReasons[id];
    const ban = permanentBanFlags[id] === true;

    if (!reason || reason.trim().length < 10) {
      alert("Please provide at least 10 characters of rejection reason.");
      return;
    }

    const message = ban
      ? `You are about to PERMANENTLY BAN ${name} for fraudulent documents. This cannot be undone.`
      : `Are you sure you want to reject ${name}'s application? They can re-upload documents. Reason: "${reason}"`;

    setConfirmModal({
      isOpen: true,
      title: ban ? "Permanently Ban Tutor" : "Reject Tutor Application",
      message,
      action: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        markProcessing(id);
        try {
          const res = await adminFetch(
            `/api/admin/verifications/${id}/decide`,
            {
              method: "POST",
              body: JSON.stringify({
                status: "REJECTED",
                rejectionReason: reason.trim(),
                permanentBan: ban,
              }),
            },
          );
          if (!res.ok) throw new Error("Reject failed");
          setActiveRejectId(null);
          setRejectionReasons((prev) => ({ ...prev, [id]: "" }));
          setPermanentBanFlags((prev) => ({ ...prev, [id]: false }));
          await fetchRequests();
          await fetchCounts();
        } catch (err) {
          console.error("Reject failed:", err);
          alert("Failed to reject. Please try again.");
        } finally {
          unmarkProcessing(id);
        }
      },
    });
  };

  const handleReasonChange = (id, text) => {
    setRejectionReasons((prev) => ({ ...prev, [id]: text }));
  };

  const handleBanFlagChange = (id, value) => {
    setPermanentBanFlags((prev) => ({ ...prev, [id]: value }));
  };

  const handleCancelReject = (id) => {
    setActiveRejectId(null);
    setRejectionReasons((prev) => ({ ...prev, [id]: "" }));
    setPermanentBanFlags((prev) => ({ ...prev, [id]: false }));
  };

  // ============================================================
  // FILTERS
  // ============================================================
  const filteredRequests = requests.filter((req) => {
    const q = searchQuery.toLowerCase();
    return (
      req.name.toLowerCase().includes(q) ||
      req.email.toLowerCase().includes(q) ||
      req.phone.toLowerCase().includes(q)
    );
  });

  // ============================================================
  // PDF EXPORT
  // ============================================================
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TUTR - Verification Requests Report", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Status View: ${activeTab} | Generated: ${new Date().toLocaleDateString()}`,
      14,
      22,
    );

    const tableHeaders = [
      ["ID", "Name", "Email", "Phone", "Applied", "Status"],
    ];
    const tableRows = filteredRequests.map((r) => [
      r.id,
      r.name,
      r.email,
      r.phone,
      r.appliedTime,
      r.status,
    ]);

    autoTable(doc, {
      startY: 28,
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    doc.save(`Verification_Requests_${activeTab}.pdf`);
  };

  if (viewState === "notifications") {
    return <NotificationsPage onBack={() => setViewState("dashboard")} />;
  }

  const tabs = ["Pending", "Approved", "Rejected", "Banned"];

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden relative">
      <Sidebar onGenerateReport={handleExportPDF} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search tutors by name, email, or phone..."
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Verification Requests
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Review tutor credentials and identity documents for platform
                approval.
              </p>
            </div>

            <div className="bg-gray-200/70 p-1 rounded-2xl flex items-center text-xs font-semibold">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {tab} ({counts[tab]})
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-100">
              Loading verification requests...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((item) => {
                  const isProcessing = processingIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`relative bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between space-y-6 transition-all ${
                        item.isBanned ? "border-red-200" : "border-gray-100"
                      } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
                    >
                      {isProcessing && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs rounded-3xl">
                          <Spinner className="w-6 h-6 text-gray-900" />
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mt-2">
                            Processing...
                          </p>
                        </div>
                      )}

                      <div>
                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() =>
                              !isProcessing && setSelectedUser(item)
                            }
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <img
                              src={getAvatarSrc(item.avatar, item.name)}
                              alt={item.name}
                              className="w-12 h-12 rounded-2xl object-cover group-hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getAvatarSrc("", item.name);
                              }}
                            />
                            <div>
                              <h3 className="text-base font-bold text-gray-900 group-hover:underline flex items-center gap-1.5">
                                {item.name}
                              </h3>
                              <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                                {item.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {item.appliedTime}
                            </span>
                            {item.isBanned && (
                              <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                ⛔ Permanently Banned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                              VERIFICATION DOCUMENTS
                            </h4>
                            {item.resubmissionCount > 0 && (
                              <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                🔄 Re-submission #{item.resubmissionCount}
                              </span>
                            )}
                          </div>
                          {item.documents.length === 0 ? (
                            <div className="h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              No documents uploaded
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              {item.documents.map((doc) => (
                                <DocumentThumbnail
                                  key={doc.id}
                                  doc={doc}
                                  onClick={() => setViewingDocument(doc)}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Rejection / Ban reason */}
                        {(activeTab === "Rejected" || activeTab === "Banned") &&
                          item.rejectionReason && (
                            <div
                              className={`mt-5 p-3.5 border rounded-2xl ${
                                item.isBanned
                                  ? "bg-red-100 border-red-300"
                                  : "bg-red-50 border-red-100"
                              }`}
                            >
                              <p
                                className={`text-[10px] font-extrabold uppercase tracking-wider mb-1.5 ${
                                  item.isBanned
                                    ? "text-red-800"
                                    : "text-red-700"
                                }`}
                              >
                                {item.isBanned
                                  ? "Reason for Ban"
                                  : "Reason for Rejection"}
                              </p>
                              <p
                                className={`text-[11px] leading-relaxed ${
                                  item.isBanned
                                    ? "text-red-800"
                                    : "text-red-700"
                                }`}
                              >
                                {item.rejectionReason}
                              </p>
                            </div>
                          )}

                        {/* Reject form (pending tab only) */}
                        {activeTab === "Pending" &&
                          activeRejectId === item.id && (
                            <div className="mt-5 space-y-3 animate-in fade-in duration-200">
                              <textarea
                                rows="3"
                                placeholder="Add rejection reason (min 10 characters, required)..."
                                value={rejectionReasons[item.id] || ""}
                                onChange={(e) =>
                                  handleReasonChange(item.id, e.target.value)
                                }
                                className="w-full bg-[#F8F9FB] rounded-2xl p-4 text-xs border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none placeholder-gray-400 text-gray-800"
                                autoFocus
                              />

                              <label className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl p-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={permanentBanFlags[item.id] === true}
                                  onChange={(e) =>
                                    handleBanFlagChange(
                                      item.id,
                                      e.target.checked,
                                    )
                                  }
                                  className="mt-0.5 accent-red-600"
                                />
                                <div>
                                  <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                                    Permanently Ban This Tutor
                                  </p>
                                  <p className="text-[10px] text-red-600 mt-0.5 leading-relaxed">
                                    Use only for fraudulent or forged documents.
                                    The tutor will be permanently blocked from
                                    logging in and re-registering.
                                  </p>
                                </div>
                              </label>
                            </div>
                          )}
                      </div>

                      {/* Card Bottom Buttons */}
                      <div className="pt-2">
                        {activeTab === "Pending" ? (
                          activeRejectId === item.id ? (
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handleCancelReject(item.id)}
                                disabled={isProcessing}
                                className="py-3 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                CANCEL
                              </button>
                              <button
                                onClick={() =>
                                  handleFinalRejectSubmit(item.id, item.name)
                                }
                                disabled={isProcessing}
                                className={`py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer uppercase tracking-wider text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  permanentBanFlags[item.id]
                                    ? "bg-red-700 hover:bg-red-800"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                              >
                                {isProcessing ? (
                                  <>
                                    <Spinner className="w-3.5 h-3.5" />
                                    <span>Rejecting...</span>
                                  </>
                                ) : (
                                  <>
                                    {permanentBanFlags[item.id]
                                      ? "PERMANENTLY BAN"
                                      : "REJECT"}
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() =>
                                  handleApprove(item.id, item.name)
                                }
                                disabled={isProcessing}
                                className="py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isProcessing ? (
                                  <>
                                    <Spinner className="w-3.5 h-3.5" />
                                    <span>Approving...</span>
                                  </>
                                ) : (
                                  "APPROVE TUTOR"
                                )}
                              </button>
                              <button
                                onClick={() => setActiveRejectId(item.id)}
                                disabled={isProcessing}
                                className="py-3 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                REJECT APPLICATION
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-between text-xs px-2 py-1">
                            <span className="text-gray-400 font-semibold">
                              Status:
                            </span>
                            <span
                              className={`font-bold ${
                                activeTab === "Approved"
                                  ? "text-emerald-600"
                                  : activeTab === "Banned"
                                    ? "text-red-800"
                                    : "text-red-600"
                              }`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-100">
                  No verification requests found in state "{activeTab}".
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Tutor Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <img
                src={getAvatarSrc(selectedUser.avatar, selectedUser.name)}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getAvatarSrc("", selectedUser.name);
                }}
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedUser.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      selectedUser.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : selectedUser.isBanned
                          ? "bg-red-100 text-red-800"
                          : selectedUser.status === "Rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                  {selectedUser.isBanned && (
                    <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ⛔ Banned
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="py-5 space-y-4 text-xs">
              {selectedUser.bio && (
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    Headline
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    Email
                  </span>
                  <span className="font-semibold text-gray-800 break-all">
                    {selectedUser.email || "N/A"}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    Phone
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.phone || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    Gender
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.gender || "N/A"}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    Date of Birth
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.dateOfBirth || "N/A"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Education
                </span>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    University
                  </span>
                  <p className="font-semibold text-gray-800">
                    {selectedUser.institution || "N/A"}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    College
                  </span>
                  <p className="font-semibold text-gray-800">
                    {selectedUser.highSchool || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    Work Experience
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.experience || "N/A"}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                    Location
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.location || "N/A"}
                  </span>
                </div>
              </div>

              {selectedUser.rejectionReason && (
                <div
                  className={`p-3 rounded-2xl border ${
                    selectedUser.isBanned
                      ? "bg-red-100 border-red-300"
                      : "bg-red-50 border-red-100"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                      selectedUser.isBanned ? "text-red-800" : "text-red-700"
                    }`}
                  >
                    {selectedUser.isBanned
                      ? "Reason for Ban"
                      : "Reason for Rejection"}
                  </span>
                  <p
                    className={`leading-relaxed ${
                      selectedUser.isBanned ? "text-red-800" : "text-red-700"
                    }`}
                  >
                    {selectedUser.rejectionReason}
                  </p>
                </div>
              )}
            </div>

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

      {/* ✅ Document Viewer Modal — handles image, PDF, DOC */}
      {viewingDocument && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewingDocument(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl relative border border-gray-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  {viewingDocument.title}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {viewingDocument.type === "image" && "Image preview"}
                  {viewingDocument.type === "pdf" && "PDF preview"}
                  {viewingDocument.type === "doc" && "Document file"}
                  {viewingDocument.type === "unknown" && "File"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold rounded-lg transition-colors"
                >
                  ↗ Open in new tab
                </a>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {viewingDocument.type === "image" ? (
                <img
                  src={viewingDocument.url}
                  alt="Document"
                  className="w-full max-h-[70vh] object-contain rounded-2xl bg-white border border-gray-100"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/600x400?text=Image+Not+Available";
                  }}
                />
              ) : viewingDocument.type === "pdf" ? (
                <iframe
                  src={viewingDocument.url}
                  title="PDF Document"
                  className="w-full h-[70vh] rounded-2xl bg-white border border-gray-100"
                />
              ) : (
                <div className="w-full h-[60vh] rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    Preview Not Available
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mb-6">
                    Word and Office documents can't be previewed in the browser.
                    Please download the file to view its contents.
                  </p>
                  <a
                    href={viewingDocument.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    ⬇ Download Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    action: null,
                  })
                }
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
