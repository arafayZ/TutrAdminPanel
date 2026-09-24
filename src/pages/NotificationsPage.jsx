import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "../api/adminClient";

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

const getPriority = (type) => {
  if (type === "NEW_REPORT" || type === "TUTOR_VERIFICATION_REQUEST") {
    return "high";
  }
  return "normal";
};

const mapNotificationFromBackend = (dto) => ({
  id: dto.id,
  type: dto.type,
  title: dto.title,
  message: dto.body,
  navigationPath: dto.navigationPath,
  read: dto.isRead,
  createdAt: dto.createdAt,
  time: timeAgo(dto.createdAt),
  priority: getPriority(dto.type),
});

// ============================================================
// MAIN COMPONENT
// ============================================================
const NotificationsPage = ({
  onBack = null,
  standalone = true, // ✅ default: full-page with its own sidebar+navbar
}) => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState(null);

  // ============================================================
  // FETCH
  // ============================================================
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/api/admin/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.map(mapNotificationFromBackend));
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ============================================================
  // MARK ALL AS READ
  // ============================================================
  const markAllAsRead = async () => {
    try {
      const res = await adminFetch("/api/admin/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed");
      await fetchNotifications();
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  // ============================================================
  // MARK ONE AS READ + NAVIGATE
  // ============================================================
  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      try {
        await adminFetch(`/api/admin/notifications/${notification.id}/read`, {
          method: "PATCH",
        });
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );
      } catch (err) {
        console.error("Mark read failed:", err);
      }
    }

    if (notification.navigationPath) {
      navigate(notification.navigationPath);
    } else {
      setSelectedNotification(notification);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================
  const deleteNotification = async (id) => {
    try {
      const res = await adminFetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete notification failed:", err);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "high") return n.priority === "high";
    return true;
  });

  // ============================================================
  // THE ACTUAL CONTENT (used in both standalone and embedded mode)
  // ============================================================
  const content = (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Notifications
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage system alerts, pending requests, and user updates.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-semibold text-black hover:underline cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        {[
          { key: "all", label: "All Alerts" },
          { key: "unread", label: "Unread" },
          { key: "high", label: "High Priority" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === tab.key
                ? "bg-black text-white shadow-xs"
                : "bg-white text-gray-500 hover:text-black border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-xs text-gray-400">
            Loading notifications...
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleOpenNotification(notification)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                notification.read
                  ? "bg-white border-gray-100"
                  : "bg-white border-black/20 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    notification.read ? "bg-gray-200" : "bg-black"
                  }`}
                ></span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-gray-900">
                      {notification.title}
                    </h3>
                    {notification.priority === "high" && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold rounded-md">
                        HIGH
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {notification.time}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-xs text-gray-400">
            No notifications found in this view.
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================
  // FALLBACK DETAIL MODAL
  // ============================================================
  const detailModal = selectedNotification && (
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <h3 className="font-bold text-sm text-gray-900 mb-1">
          {selectedNotification.title}
        </h3>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          {selectedNotification.message}
        </p>
        <button
          onClick={() => setSelectedNotification(null)}
          className="w-full py-2.5 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );

  // ============================================================
  // RENDER — Standalone vs Embedded
  // ============================================================

  // Embedded mode (inside another page like Settings)
  if (!standalone) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
        {content}
        {detailModal}
      </div>
    );
  }

  // Standalone mode (full page with Sidebar + Navbar)
  return (
    <div className="flex h-screen bg-[#F5F5F7] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
          {content}
        </main>
      </div>

      {detailModal}
    </div>
  );
};

export default NotificationsPage;
