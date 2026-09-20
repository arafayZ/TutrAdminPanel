import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPage from "./NotificationsPage";
import { adminFetch } from "../api/adminClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState("dashboard");
  const [viewMode, setViewMode] = useState("monthly");
  const [showAllRegistrations, setShowAllRegistrations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- Backend data ----------
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  // ---------- Fetch dashboard on mount ----------
  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch("/api/admin/dashboard");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        if (!cancelled) setError(err.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Date helpers ----------
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentDayIndex = currentDate.getDay();

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const currentMonthCode = monthNames[currentMonthIndex];
  const currentDayCode = dayNames[currentDayIndex];

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // ---------- Derived data ----------
  const stats = data?.stats || {
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    pendingVerifications: 0,
    usersGrowthPercent: null,
    tutorsGrowthPercent: null,
    studentsGrowthPercent: null,
  };

  const monthlyData = (data?.monthlyRegistrations || []).map((item) => ({
    label: item.label,
    val: item.value,
    active: item.label === currentMonthCode,
  }));

  const weeklyData = (data?.weeklyRegistrations || []).map((item) => ({
    label: item.label,
    val: item.value,
    active: item.label === currentDayCode,
  }));

  const chartData = viewMode === "monthly" ? monthlyData : weeklyData;

  const allRegistrations = data?.recentRegistrations || [];

  const filteredRegistrations = allRegistrations.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const visibleRegistrations = showAllRegistrations
    ? filteredRegistrations
    : filteredRegistrations.slice(0, 3);

  const teachingModes = (data?.teachingModes || []).map((m) => ({
    label: m.label,
    val: `${m.percentage}%`,
  }));

  const courseCategories = (data?.courseCategories || []).map((c) => ({
    label: c.label,
    val: `${c.percentage}%`,
  }));

  // ---------- Growth badge ----------
  const renderGrowthBadge = (pct) => {
    if (pct === null || pct === undefined) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[11px] font-semibold rounded-md">
          —
        </span>
      );
    }
    const isPositive = pct >= 0;
    return (
      <span
        className={`px-2 py-1 text-[11px] font-semibold rounded-md ${
          isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
        }`}
      >
        {isPositive ? "+" : ""}
        {pct}%
      </span>
    );
  };

  // ---------- Loading screen ----------
  if (loading) {
    return (
      <div className="flex h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden">
        <Sidebar
          onGenerateReport={() =>
            setModalConfig({
              isOpen: true,
              type: "Report",
              message: "Generating summary report...",
            })
          }
        />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-black rounded-full animate-spin" />
          <p className="text-xs text-gray-500 mt-4">Loading dashboard...</p>
        </main>
      </div>
    );
  }

  // ---------- Error screen ----------
  if (error) {
    return (
      <div className="flex h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden">
        <Sidebar
          onGenerateReport={() =>
            setModalConfig({
              isOpen: true,
              type: "Report",
              message: "Generating summary report...",
            })
          }
        />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center border border-gray-100 shadow-xs">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              Couldn't load dashboard
            </h3>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---------- Main dashboard ----------
  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden">
      <Sidebar
        onGenerateReport={() =>
          setModalConfig({
            isOpen: true,
            type: "Report",
            message: "Generating summary report...",
          })
        }
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search tutors or applications..."
        />

        {viewState === "notifications" ? (
          <NotificationsPage />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Greeting */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                {getGreeting()}, Admin.
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Here's what's happening across the TUTR network today.
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Users */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  {renderGrowthBadge(stats.usersGrowthPercent)}
                </div>
                <div className="mt-5 sm:mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    TOTAL USERS
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Total Tutors */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
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
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    </svg>
                  </div>
                  {renderGrowthBadge(stats.tutorsGrowthPercent)}
                </div>
                <div className="mt-5 sm:mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    TOTAL TUTORS
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {stats.totalTutors.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Total Students */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  {renderGrowthBadge(stats.studentsGrowthPercent)}
                </div>
                <div className="mt-5 sm:mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    TOTAL STUDENTS
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {stats.totalStudents.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Pending Verifications */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 bg-red-50 text-red-500 text-[11px] font-semibold rounded-md">
                    High Priority
                  </span>
                </div>
                <div className="mt-5 sm:mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    PENDING VERIFICATIONS
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {stats.pendingVerifications.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
              <div className="xl:col-span-2 space-y-6 sm:space-y-8">
                {/* Chart */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900">
                          {viewMode === "monthly"
                            ? "Monthly Registrations"
                            : "Weekly Registrations"}
                        </h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                          {viewMode === "monthly"
                            ? `Current: ${currentMonthCode}`
                            : `Today: ${currentDayCode}`}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                        {viewMode === "monthly"
                          ? "Growth trends across the year"
                          : "Growth trends across the current week"}
                      </p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl text-[10px] font-bold self-start sm:self-auto">
                      <button
                        onClick={() => setViewMode("weekly")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          viewMode === "weekly"
                            ? "bg-black text-white shadow-xs"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        WEEKLY
                      </button>
                      <button
                        onClick={() => setViewMode("monthly")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          viewMode === "monthly"
                            ? "bg-black text-white shadow-xs"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        MONTHLY
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                    <div className="h-48 flex items-end justify-between pt-8 px-1 gap-1.5 sm:gap-3 border-b border-gray-100 pb-2 min-w-[320px]">
                      {chartData.map((item, idx) => {
                        const maxVal = Math.max(
                          ...chartData.map((d) => d.val),
                          1,
                        );
                        const heightPct = (item.val / maxVal) * 100;

                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-0 group relative"
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                              {item.val}
                            </div>

                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full max-w-[14px] sm:max-w-none rounded-t-sm sm:rounded-t-md transition-all duration-300 ${
                                item.active
                                  ? "bg-black ring-2 ring-black/10"
                                  : "bg-gray-200 group-hover:bg-gray-300"
                              }`}
                            ></div>

                            <span
                              className={`text-[8px] sm:text-[10px] font-bold truncate w-full text-center ${
                                item.active
                                  ? "text-black font-extrabold"
                                  : "text-gray-400"
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Registrations */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900">
                      Recent Registrations
                    </h3>

                    <button
                      onClick={() =>
                        setShowAllRegistrations(!showAllRegistrations)
                      }
                      className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showAllRegistrations ? "Show Less" : "View All"}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${showAllRegistrations ? "rotate-180" : ""}`}
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
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400">
                          <th className="py-3 px-2 w-[50%]">USER</th>
                          <th className="py-3 px-2 w-[25%]">ROLE</th>
                          <th className="py-3 px-2 w-[25%]">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs">
                        {visibleRegistrations.length > 0 ? (
                          visibleRegistrations.map((user, idx) => (
                            <tr
                              key={user.id || idx}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="py-3.5 px-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs shrink-0">
                                  {user.initials}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {user.fullName}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {user.email}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3.5 px-2 text-gray-600 font-medium">
                                {user.role}
                              </td>
                              <td className="py-3.5 px-2">
                                <span
                                  className={`flex items-center gap-1.5 text-[10px] font-bold ${
                                    user.status === "PENDING"
                                      ? "text-amber-500"
                                      : "text-emerald-500"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      user.status === "PENDING"
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                    }`}
                                  ></span>
                                  {user.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="py-4 text-center text-xs text-gray-400"
                            >
                              No records matching "{searchQuery}"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 sm:space-y-8">
                {/* Teaching Mode */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
                  <h3 className="font-bold text-sm text-gray-900">
                    Teaching Mode
                  </h3>

                  <div className="space-y-4">
                    {teachingModes.length > 0 ? (
                      teachingModes.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-[10px] font-bold text-gray-700 uppercase mb-1.5">
                            <span>{item.label}</span>
                            <span>{item.val}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="bg-black h-full"
                              style={{ width: item.val }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No data available</p>
                    )}
                  </div>
                </div>

                {/* Course Categories */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
                  <h3 className="font-bold text-sm text-gray-900">
                    Course Categories
                  </h3>

                  <div className="space-y-4">
                    {courseCategories.length > 0 ? (
                      courseCategories.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-[10px] font-bold text-gray-700 uppercase mb-1.5">
                            <span>{item.label}</span>
                            <span>{item.val}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="bg-black h-full"
                              style={{ width: item.val }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalConfig.isOpen && (
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
              {modalConfig.type}
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {modalConfig.message}
            </p>
            <button
              onClick={() =>
                setModalConfig({ isOpen: false, type: "", message: "" })
              }
              className="w-full py-2.5 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
