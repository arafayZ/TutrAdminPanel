import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch, getImageUrl } from "../api/adminClient";

const Navbar = ({ searchQuery, setSearchQuery, placeholder = "Search..." }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          id: parsed.id,
          name:
            `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() ||
            "Admin",
          role:
            parsed.role === "SUPER_ADMIN"
              ? "SUPER ADMIN"
              : parsed.role || "ADMIN",
          avatar: parsed.profileImageUrl
            ? getImageUrl(parsed.profileImageUrl)
            : null,
        };
      } catch (e) {
        console.error("Failed to parse admin_user:", e);
      }
    }
    return { id: null, name: "Admin", role: "", avatar: null };
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await adminFetch("/api/admin/profile/me");
        if (!response.ok) return;
        const data = await response.json();

        setUser({
          id: data.id,
          name:
            `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Admin",
          role:
            data.role === "SUPER_ADMIN" ? "SUPER ADMIN" : data.role || "ADMIN",
          avatar: data.profileImageUrl
            ? getImageUrl(data.profileImageUrl)
            : null,
        });

        localStorage.setItem(
          "admin_user",
          JSON.stringify({
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            profileImageUrl: data.profileImageUrl,
            role: data.role,
          }),
        );
      } catch (err) {
        console.debug("Navbar: could not refresh admin profile");
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await adminFetch("/api/admin/notifications/unread-count");
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        // silent
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center gap-3 pl-16 pr-4 py-3 md:px-8 md:py-4 bg-white border-b border-gray-200 sticky top-0 z-20">
      {/* ✅ Centered, expandable search */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="w-full max-w-lg">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all placeholder-gray-400"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Notifications & Admin Profile */}
      <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
        <button
          onClick={() => navigate("/notifications")}
          className="p-2 rounded-full transition-colors cursor-pointer relative text-gray-500 hover:text-black hover:bg-gray-100"
          title="Notifications"
        >
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        <div
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2.5 sm:pl-2 sm:border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-tight">{user.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              {user.role}
            </p>
          </div>

          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center shrink-0 border border-gray-200">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
