import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPage from "./NotificationsPage";
import { adminFetch, getImageUrl } from "../api/adminClient";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarSrc = (url, name) => {
  if (url && typeof url === "string" && url.trim() !== "") return url;
  const initials = getInitials(name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials,
  )}&background=E5E7EB&color=374151&bold=true&size=128`;
};

// ============================================================
// MAPPER
// ============================================================
const mapBlockFromBackend = (dto) => ({
  id: dto.id,
  // Blocked user (tutor)
  name: dto.tutorName,
  role: "Tutor",
  userId: dto.tutorDisplayId,
  avatar: getImageUrl(dto.tutorImage),
  // Blocker
  blockedBy: dto.studentName,
  blockedByType: "student",
  blockedByImage: getImageUrl(dto.studentImage),
  // When
  date: formatDate(dto.blockedAt),
  rawDate: dto.blockedAt,
});

// ============================================================
// MAIN COMPONENT
// ============================================================
const BlockedPage = () => {
  const [activePage] = useState("blocked");
  const [viewState, setViewState] = useState("blocked");
  const [searchQuery, setSearchQuery] = useState("");

  // Data
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [selectedBlocked, setSelectedBlocked] = useState(null);
  const [unblockModalUser, setUnblockModalUser] = useState(null);
  const [isUnblocking, setIsUnblocking] = useState(false);

  // ============================================================
  // FETCH BLOCKS
  // ============================================================
  const fetchBlocks = async () => {
    setIsLoading(true);
    try {
      const payload = {
        searchQuery: searchQuery.trim() || null,
        page,
        size: pageSize,
      };

      const res = await adminFetch("/api/admin/blocks/filter", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch blocks");
      const data = await res.json();

      setBlockedUsers((data.content || []).map(mapBlockFromBackend));
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      console.error("Error fetching blocks:", err);
      setBlockedUsers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced fetch when search or page changes
  useEffect(() => {
    const t = setTimeout(fetchBlocks, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page]);

  // Reset to page 0 when search changes
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ============================================================
  // UNBLOCK
  // ============================================================
  const handleUnblock = async () => {
    if (!unblockModalUser) return;
    setIsUnblocking(true);

    try {
      const res = await adminFetch(`/api/admin/blocks/${unblockModalUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Unblock failed");

      setUnblockModalUser(null);

      // If we just removed the last item on a page > 0, go back one page
      if (blockedUsers.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await fetchBlocks();
      }
    } catch (err) {
      console.error("Unblock error:", err);
      alert("Failed to unblock. Please try again.");
    } finally {
      setIsUnblocking(false);
    }
  };

  // ============================================================
  // PDF EXPORT
  // ============================================================
  const handleExportData = async () => {
    if (blockedUsers.length === 0) {
      alert("No data available to export on this page.");
      return;
    }

    try {
      // loadPDFScripts helper kept local
      const loadPDFScripts = () =>
        new Promise((resolve, reject) => {
          if (window.jspdf && window.jspdf.jsPDF) {
            resolve(window.jspdf);
            return;
          }
          const s1 = document.createElement("script");
          s1.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          s1.onload = () => {
            const s2 = document.createElement("script");
            s2.src =
              "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js";
            s2.onload = () => resolve(window.jspdf);
            s2.onerror = reject;
            document.body.appendChild(s2);
          };
          s1.onerror = reject;
          document.body.appendChild(s1);
        });

      await loadPDFScripts();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Blocked Users Report", 14, 20);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
      doc.text(`Page: ${page + 1} of ${totalPages}`, 14, 31);
      doc.text(`Total Entries (this page): ${blockedUsers.length}`, 14, 36);
      doc.text(`Total in system: ${totalElements}`, 14, 41);

      const headers = [["User", "Role & ID", "Blocked Date", "Done By"]];
      const rows = blockedUsers.map((item) => [
        item.name,
        `${item.role} • ID: ${item.userId}`,
        item.date,
        item.blockedBy,
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 48,
        theme: "striped",
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 8, cellPadding: 4 },
      });

      doc.save(`blocked_users_${new Date().toISOString().slice(0, 10)}.pdf`);
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
          placeholder="Search blocked users..."
        />

        {viewState === "notifications" ? (
          <NotificationsPage onBack={() => setViewState("blocked")} />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Blocked Users
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Management of platform-wide restrictions and student/tutor
                  blocking actions.
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
                Export PDF
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Recently Blocked Users
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Management of platform-wide restrictions
                  </p>
                </div>
                <span className="text-gray-400 text-[11px] font-medium">
                  {isLoading
                    ? "Loading..."
                    : `Showing ${blockedUsers.length} of ${totalElements} entries`}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider border-b border-gray-100">
                      <th className="py-3 px-6">User</th>
                      <th className="py-3 px-6">Blocked Date</th>
                      <th className="py-3 px-6">Done By</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-8 text-center text-gray-400"
                        >
                          Loading blocks...
                        </td>
                      </tr>
                    ) : blockedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-8 text-center text-gray-400"
                        >
                          No blocked records found.
                        </td>
                      </tr>
                    ) : (
                      blockedUsers.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={getAvatarSrc(item.avatar, item.name)}
                                alt={item.name}
                                className="w-9 h-9 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getAvatarSrc("", item.name);
                                }}
                              />
                              <div>
                                <h4 className="font-bold text-gray-900 text-xs">
                                  {item.name}
                                </h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {item.role} • ID: {item.userId}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-gray-500 font-medium">
                            {item.date}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <img
                                src={getAvatarSrc(
                                  item.blockedByImage,
                                  item.blockedBy,
                                )}
                                alt={item.blockedBy}
                                className="w-5 h-5 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getAvatarSrc(
                                    "",
                                    item.blockedBy,
                                  );
                                }}
                              />
                              <span className="bg-gray-200/80 text-gray-900 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase inline-block">
                                {item.blockedBy}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => setSelectedBlocked(item)}
                              className="text-gray-500 hover:text-black font-semibold text-xs cursor-pointer px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => setUnblockModalUser(item)}
                              className="font-bold text-xs text-black hover:underline cursor-pointer"
                            >
                              Unblock
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ✅ Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500">
                    Page {page + 1} of {totalPages}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0 || isLoading}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1 || isLoading}
                      className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedBlocked && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarSrc(
                    selectedBlocked.avatar,
                    selectedBlocked.name,
                  )}
                  alt={selectedBlocked.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getAvatarSrc("", selectedBlocked.name);
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {selectedBlocked.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {selectedBlocked.role} (ID: {selectedBlocked.userId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlocked(null)}
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <p>
                <strong className="text-gray-900">Blocked Date:</strong>{" "}
                {selectedBlocked.date}
              </p>
              <p>
                <strong className="text-gray-900">Action Issued By:</strong>{" "}
                {selectedBlocked.blockedBy}
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setSelectedBlocked(null)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Modal */}
      {unblockModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Confirm Unblock
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to unblock{" "}
                <span className="font-semibold text-gray-900">
                  {unblockModalUser.name}
                </span>
                ? This will restore their full access to the Tutr marketplace.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleUnblock}
                disabled={isUnblocking}
                className="w-full py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnblocking ? "Unblocking..." : "Unblock User"}
              </button>
              <button
                onClick={() => setUnblockModalUser(null)}
                disabled={isUnblocking}
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

export default BlockedPage;
