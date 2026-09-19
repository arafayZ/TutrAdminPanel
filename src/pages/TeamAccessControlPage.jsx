import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { adminFetch, getImageUrl } from "../api/adminClient";

// ---------- Reusable eye icons ----------
const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

const TeamAccessControlPage = () => {
  const navigate = useNavigate();

  // Navigation & View States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Change-password sub-form inside detail modal
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // See-Detail editable form state (NO password field)
  const [detailForm, setDetailForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
  });

  // Add-Member form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    role: "ADMIN",
    password: "",
    confirmPassword: "",
  });

  // ---------- Password strength helper ----------
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: "", score: 0, color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (pwd.length < 6 || score <= 2)
      return {
        label: "Weak",
        score: 1,
        color: "bg-red-500",
        text: "text-red-600",
      };
    if (score === 3 || score === 4)
      return {
        label: "Medium",
        score: 2,
        color: "bg-amber-500",
        text: "text-amber-600",
      };
    return {
      label: "Strong",
      score: 3,
      color: "bg-emerald-500",
      text: "text-emerald-600",
    };
  };

  const pwdStrength = getPasswordStrength(formData.password);
  const passwordsMatch =
    formData.password && formData.password === formData.confirmPassword;
  const canAddMember =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.dob &&
    formData.email.trim() &&
    pwdStrength.label === "Strong" &&
    passwordsMatch;

  const newPwdStrength = getPasswordStrength(newPassword);
  const newPwdsMatch = newPassword && newPassword === confirmNewPassword;
  const canChangePassword = newPwdStrength.label === "Strong" && newPwdsMatch;

  // ---------- Team Members data ----------
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ============ LOAD FROM BACKEND ============
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const response = await adminFetch("/api/admin/team");
      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.error || "Failed to load team members");
        return;
      }

      // Map backend response → frontend shape
      const mapped = data.map((a) => ({
        id: String(a.id),
        firstName: a.firstName,
        lastName: a.lastName,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
        dob: a.dateOfBirth || "",
        role: a.role === "SUPER_ADMIN" ? "SUPER ADMIN" : a.role,
        status: a.isActive ? "Active" : "Deactivated",
        initials:
          `${a.firstName?.[0] || ""}${a.lastName?.[0] || ""}`.toUpperCase(),
        profileImageUrl: a.profileImageUrl || null,
      }));

      setTeamMembers(mapped);
    } catch (err) {
      setLoadError("Network error. Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Close custom dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterOptions = [
    { label: "Filter (All)", value: "All" },
    { label: "Super Admin", value: "SUPER ADMIN" },
    { label: "Admin", value: "ADMIN" },
  ];

  // ---------- Add Member ----------
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!canAddMember) return;

    try {
      const response = await adminFetch("/api/admin/team", {
        method: "POST",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dob || null,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create admin");
        return;
      }

      await loadTeamMembers();
      setFormData({
        firstName: "",
        lastName: "",
        dob: "",
        email: "",
        role: "ADMIN",
        password: "",
        confirmPassword: "",
      });
      setIsAddModalOpen(false);
    } catch (err) {
      alert("Network error. Could not create admin.");
    }
  };

  // ---------- Edit Role ----------
  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setFormData((prev) => ({ ...prev, role: member.role }));
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();

    try {
      const response = await adminFetch(
        `/api/admin/team/${selectedMember.id}/role`,
        {
          method: "PUT",
          body: JSON.stringify({ role: formData.role }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to update role");
        return;
      }

      await loadTeamMembers();
      setIsEditModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      alert("Network error.");
    }
  };

  // ---------- Deactivate / Reactivate ----------
  const handleOpenDeactivate = (member) => {
    setSelectedMember(member);
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    try {
      const response = await adminFetch(
        `/api/admin/team/${selectedMember.id}/deactivate`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to deactivate");
        return;
      }

      await loadTeamMembers();
      setIsDeactivateModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      alert("Network error.");
    }
  };

  // Open the reactivation confirmation modal
  const handleOpenReactivate = (member) => {
    setSelectedMember(member);
    setIsReactivateModalOpen(true);
  };

  // Confirm and perform reactivation
  const handleConfirmReactivate = async () => {
    try {
      const response = await adminFetch(
        `/api/admin/team/${selectedMember.id}/reactivate`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to reactivate");
        return;
      }

      await loadTeamMembers();
      setIsReactivateModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      alert("Network error.");
    }
  };

  // ---------- See Detail (NO password field) ----------
  const handleOpenDetail = (member) => {
    setSelectedMember(member);
    setDetailForm({
      firstName: member.firstName,
      lastName: member.lastName,
      dob: member.dob,
      email: member.email,
    });
    setNewPassword("");
    setConfirmNewPassword("");
    setShowNewPassword(false);
    setIsDetailModalOpen(true);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();

    // Only send editable fields — NO password
    const body = {
      firstName: detailForm.firstName,
      lastName: detailForm.lastName,
      dateOfBirth: detailForm.dob || null,
      email: detailForm.email,
    };

    try {
      const response = await adminFetch(
        `/api/admin/team/${selectedMember.id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update member");
        return;
      }

      await loadTeamMembers();
      alert("Member details updated successfully.");
      setIsDetailModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!canChangePassword) return;

    try {
      const response = await adminFetch(
        `/api/admin/team/${selectedMember.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ password: newPassword }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to change password");
        return;
      }

      setNewPassword("");
      setConfirmNewPassword("");
      alert("Password updated successfully.");
    } catch (err) {
      alert("Network error.");
    }
  };

  // ---------- Message Icon → navigate to Chat ----------
  const handleMessageMember = (member) => {
    navigate("/chat", {
      state: {
        contactName: member.name,
        contactRole: member.role === "SUPER ADMIN" ? "Super Admin" : "Admin",
      },
    });
  };

  // ---------- Filters ----------
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRole === "All" || member.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  // ---------- Derived Counts ----------
  const totalAdmins = teamMembers.filter((m) =>
    m.role.includes("ADMIN"),
  ).length;
  const superAdmins = teamMembers.filter(
    (m) => m.role === "SUPER ADMIN",
  ).length;
  const regularAdmins = teamMembers.filter((m) => m.role === "ADMIN").length;
  const activeUsers = teamMembers.filter((m) => m.status === "Active").length;
  const deactivatedUsers = teamMembers.filter(
    (m) => m.status === "Deactivated",
  ).length;

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden">
      <Sidebar activePage="team" />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search team members..."
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          )}

          {loadError && !loading && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
              {loadError}
            </div>
          )}
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Team & Access Control
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage platform administrators and their permissions.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-black hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shadow-xs self-start sm:self-auto"
            >
              <span className="text-sm font-bold">+</span> Add Admin
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center gap-2 text-gray-800">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Total Admins
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">
                  {totalAdmins}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-600">
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                  • {superAdmins} Super Admin
                </span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                  • {regularAdmins} Admins
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center gap-2 text-gray-800">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Users
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">
                  {activeUsers}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-medium">
                  {deactivatedUsers} Deactivated
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Team Members</h3>

              <div className="flex items-center gap-2" ref={dropdownRef}>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  Role:
                </span>
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsFilterDropdownOpen(!isFilterDropdownOpen)
                    }
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:border-black transition-colors cursor-pointer"
                  >
                    <span>
                      {filterOptions.find((opt) => opt.value === filterRole)
                        ?.label || "Filter (All)"}
                    </span>
                    <svg
                      className="w-3 h-3 text-gray-600"
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

                  {isFilterDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                      {filterOptions.map((option) => {
                        const isSelected = filterRole === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilterRole(option.value);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-black text-white"
                                : "text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-extrabold tracking-wider text-gray-400">
                    <th className="py-3 px-6">User</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 text-center text-gray-400 text-xs"
                      >
                        No team members found.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {member.profileImageUrl ? (
                              <img
                                src={getImageUrl(member.profileImageUrl)}
                                alt={member.name}
                                className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {member.initials}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">
                                {member.name}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xs text-[10px] font-extrabold tracking-wider uppercase ${
                              member.role === "SUPER ADMIN"
                                ? "bg-black text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            {member.status === "Active" ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-gray-800">Active</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-red-600">
                                  Deactivated
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleMessageMember(member)}
                              title="Message"
                              className="text-gray-500 hover:text-black transition-colors cursor-pointer"
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
                                  d="M8 10h8M8 14h5m-1 7a9 9 0 10-8.485-6.1L3 21l6.1-.515A8.96 8.96 0 0012 21z"
                                />
                              </svg>
                            </button>

                            <span className="text-gray-200">|</span>

                            <button
                              onClick={() => handleOpenDetail(member)}
                              className="text-gray-700 hover:text-black font-bold text-xs cursor-pointer"
                            >
                              See Detail
                            </button>

                            <span className="text-gray-200">|</span>

                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="text-gray-700 hover:text-black font-bold text-xs cursor-pointer"
                            >
                              Edit
                            </button>

                            <span className="text-gray-200">|</span>

                            {member.status === "Active" ? (
                              <button
                                onClick={() => handleOpenDeactivate(member)}
                                className="text-red-600 hover:text-red-700 font-bold text-xs cursor-pointer"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenReactivate(member)}
                                className="text-emerald-600 hover:text-emerald-700 font-bold text-xs cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ---------- ADD MEMBER MODAL ---------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Add New Team Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-black text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 cursor-pointer"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pwdStrength.color} transition-all`}
                        style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${pwdStrength.text}`}
                    >
                      {pwdStrength.label}
                    </span>
                  </div>
                )}
                {formData.password && pwdStrength.label !== "Strong" && (
                  <p className="text-[10px] text-red-500 mt-1">
                    Password must be Strong (8+ chars, upper, lower, number &
                    symbol).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 cursor-pointer"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-[10px] text-red-500 mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={!canAddMember}
                  className="flex-1 bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- EDIT ROLE MODAL ---------- */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Edit Role: {selectedMember.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-black text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  System Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- SEE DETAIL MODAL (NO password field) ---------- */}
      {isDetailModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Member Details
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-black text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Read-only: Role + Status */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                  Role
                </p>
                <p className="text-xs font-semibold text-gray-900">
                  {selectedMember.role}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                  Status
                </p>
                <p
                  className={`text-xs font-semibold ${
                    selectedMember.status === "Active"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedMember.status}
                </p>
              </div>
            </div>

            {/* Editable fields — NO PASSWORD */}
            <form onSubmit={handleSaveDetails} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={detailForm.firstName}
                    onChange={(e) =>
                      setDetailForm({
                        ...detailForm,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={detailForm.lastName}
                    onChange={(e) =>
                      setDetailForm({ ...detailForm, lastName: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={detailForm.dob}
                  onChange={(e) =>
                    setDetailForm({ ...detailForm, dob: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={detailForm.email}
                  onChange={(e) =>
                    setDetailForm({ ...detailForm, email: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </form>

            {/* Change Password sub-form */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-900 mb-3">
                Change Password
              </h4>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 cursor-pointer"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {newPassword && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${newPwdStrength.color} transition-all`}
                        style={{
                          width: `${(newPwdStrength.score / 3) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${newPwdStrength.text}`}
                    >
                      {newPwdStrength.label}
                    </span>
                  </div>
                )}

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                />

                {confirmNewPassword && !newPwdsMatch && (
                  <p className="text-[10px] text-red-500">
                    Passwords do not match.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canChangePassword}
                  className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DEACTIVATE MODAL ---------- */}
      {isDeactivateModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Deactivate User
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to deactivate{" "}
                <span className="font-bold text-gray-900">
                  {selectedMember.name}
                </span>
                ? They will no longer be able to log into the admin console.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmDeactivate}
                className="w-full py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Confirm Deactivate
              </button>
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------- REACTIVATE MODAL ---------- */}
      {isReactivateModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Reactivate User
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to reactivate{" "}
                <span className="font-bold text-gray-900">
                  {selectedMember.name}
                </span>
                ? They will regain access to the admin console.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmReactivate}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Confirm Reactivate
              </button>
              <button
                onClick={() => setIsReactivateModalOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
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

export default TeamAccessControlPage;
