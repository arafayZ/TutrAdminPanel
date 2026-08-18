import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const TeamAccessControlPage = () => {
  // Navigation & View States
  const [activePage, setActivePage] = useState('team_access_control');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All'); // 'All' | 'SUPER ADMIN' | 'ADMIN' | 'MANAGER'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Modal States (White Popups)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form State for Add/Edit Member
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ADMIN',
  });

  // Team Members Data
  const [teamMembers, setTeamMembers] = useState([
  {
    id: '1',
    name: 'Abdul Rafay',
    email: 'abdul.rafay@tutr.com',
    role: 'SUPER ADMIN',
    status: 'Active',
    initials: 'AR',
  },
  {
    id: '2',
    name: 'Muhammad Hamza',
    email: 'hamza.ahmed@tutr.com',
    role: 'ADMIN',
    status: 'Active',
    initials: 'MH',
  },
  {
    id: '3',
    name: 'Areeba Fatima',
    email: 'areeba.fatima@tutr.com',
    role: 'MANAGER',
    status: 'Active',
    initials: 'AF',
  },
  {
    id: '4',
    name: 'Hassan Ali',
    email: 'hassan.ali@tutr.com',
    role: 'ADMIN',
    status: 'Active',
    initials: 'HA',
  },
  {
    id: '5',
    name: 'Maham Khan',
    email: 'maham.khan@tutr.com',
    role: 'MANAGER',
    status: 'Pending Invitation',
    initials: 'MK',
  },
  {
    id: '6',
    name: 'Saad Ahmed',
    email: 'saad.ahmed@tutr.com',
    role: 'ADMIN',
    status: 'Inactive',
    initials: 'SA',
  },
  {
    id: '7',
    name: 'Hira Shah',
    email: 'hira.shah@tutr.com',
    role: 'MANAGER',
    status: 'Active',
    initials: 'HS',
  },
  {
    id: '8',
    name: 'Bilal Hussain',
    email: 'bilal.hussain@tutr.com',
    role: 'ADMIN',
    status: 'Pending Invitation',
    initials: 'BH',
  },
]);

  // Close custom dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options mapping
  const filterOptions = [
    { label: 'Filter (All)', value: 'All' },
    { label: 'Super Admin', value: 'SUPER ADMIN' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' },
  ];

  // Handle Add Member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newMember = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'Pending Invitation',
      initials: formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };

    setTeamMembers([...teamMembers, newMember]);
    setFormData({ name: '', email: '', role: 'ADMIN' });
    setIsAddModalOpen(false);
  };

  // Handle Edit Member Permissions
  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setFormData({ name: member.name, email: member.email, role: member.role });
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === selectedMember.id ? { ...m, role: formData.role } : m
      )
    );
    setIsEditModalOpen(false);
    setSelectedMember(null);
  };

  // Handle Revoke / Remove Member
  const handleOpenRevoke = (member) => {
    setSelectedMember(member);
    setIsRevokeModalOpen(true);
  };

  const handleConfirmRevoke = () => {
    setTeamMembers(teamMembers.filter((m) => m.id !== selectedMember.id));
    setIsRevokeModalOpen(false);
    setSelectedMember(null);
  };

  // Handle Resend Invite
  const handleResendInvite = (member) => {
    alert(`Invitation link successfully resent to ${member.email}`);
  };

  // Filtered List
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRole === 'All' || member.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  // Derived Counts
  const totalAdmins = teamMembers.filter((m) => m.role.includes('ADMIN')).length;
  const superAdmins = teamMembers.filter((m) => m.role === 'SUPER ADMIN').length;
  const regularAdmins = teamMembers.filter((m) => m.role === 'ADMIN').length;
  const activeManagers = teamMembers.filter((m) => m.role === 'MANAGER').length;
  const pendingInvites = teamMembers.filter((m) => m.status === 'Pending Invitation').length;

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        activePage={activePage}
        onGenerateReport={() => alert('Generating Administration Report...')}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Navbar Component */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search tutors or applications..."
        />

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Team & Access Control
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage platform administrators, managers, and their permissions.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-black hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shadow-xs self-start sm:self-auto"
            >
              <span className="text-sm font-bold">+</span> Add Admin/Manager
            </button>
          </div>

          {/* Metric Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stat Card 1: Total Admins */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center gap-2 text-gray-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Total Admins
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalAdmins}</h3>
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

            {/* Stat Card 2: Active Managers */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center gap-2 text-gray-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Active Managers
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{activeManagers}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-medium">
                  {pendingInvites} Pending Invites
                </span>
              </div>
            </div>

            {/* Stat Card 3: Security & Audit */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center gap-2 text-gray-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Security
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mt-2">System Secure</h4>
                <p className="text-[10px] text-gray-400">Last invite sent 2h ago</p>
              </div>
              <button
                onClick={() => alert('Opening System Audit Log...')}
                className="text-[11px] font-bold text-gray-900 hover:underline flex items-center gap-1 self-start cursor-pointer"
              >
                View Audit Log <span className="text-xs">→</span>
              </button>
            </div>
          </div>

          {/* Team Members Table Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Card Header & Custom Black Filter Dropdown */}
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Team Members</h3>

              {/* Custom Black Dropdown */}
              <div className="flex items-center gap-2" ref={dropdownRef}>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">Role:</span>
                <div className="relative">
                  <button
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:border-black transition-colors cursor-pointer"
                  >
                    <span>
                      {filterOptions.find((opt) => opt.value === filterRole)?.label || 'Filter (All)'}
                    </span>
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Custom Popup Options Menu */}
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
                                ? 'bg-black text-white'
                                : 'text-gray-800 hover:bg-gray-100'
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

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left border-collapse">
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
                      <td colSpan="4" className="py-8 text-center text-gray-400 text-xs">
                        No team members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* User Profile */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{member.name}</p>
                              <p className="text-[11px] text-gray-400">{member.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xs text-[10px] font-extrabold tracking-wider uppercase ${
                              member.role === 'SUPER ADMIN'
                                ? 'bg-black text-white'
                                : member.role === 'ADMIN'
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>

                        {/* Status Indicator */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            {member.status === 'Active' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-gray-800">Active</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <span className="text-gray-500">Pending Invitation</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right font-medium">
                          {member.role === 'SUPER ADMIN' ? (
                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="text-gray-500 hover:text-black text-xs font-bold transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          ) : member.status === 'Pending Invitation' ? (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleResendInvite(member)}
                                className="text-gray-900 hover:underline font-bold text-xs cursor-pointer"
                              >
                                Resend Invite
                              </button>
                              <span className="text-gray-200">|</span>
                              <button
                                onClick={() => handleOpenRevoke(member)}
                                className="text-red-600 hover:text-red-700 font-bold text-xs cursor-pointer"
                              >
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleOpenEdit(member)}
                                className="text-gray-700 hover:text-black font-bold text-xs cursor-pointer"
                              >
                                Edit Permissions
                              </button>
                              <span className="text-gray-200">|</span>
                              <button
                                onClick={() => handleOpenRevoke(member)}
                                className="text-red-600 hover:text-red-700 font-bold text-xs cursor-pointer"
                              >
                                Revoke
                              </button>
                            </div>
                          )}
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

      {/* --- MODALS (STRICTLY WHITE BACKGROUND) --- */}

      {/* Add Admin/Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Add New Team Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-black text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Ahmed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@tutoradmin.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Role Assignment</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Send Invitation
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

      {/* Edit Member Permissions Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Edit Permissions: {selectedMember.name}
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
                <label className="block text-xs font-bold text-gray-700 mb-1">System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-500 space-y-1">
                <p className="font-bold text-gray-700">Role Capabilities:</p>
                {formData.role === 'SUPER ADMIN' && (
                  <p>• Full system access including billing, security, and admin creation.</p>
                )}
                {formData.role === 'ADMIN' && (
                  <p>• Access to tutor verification, course approvals, and student records.</p>
                )}
                {formData.role === 'MANAGER' && (
                  <p>• View-only access to analytics, reports, and basic user support.</p>
                )}
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

      {/* Revoke Access Confirmation Modal */}
      {isRevokeModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Revoke Access</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to remove access for{' '}
                <span className="font-bold text-gray-900">{selectedMember.name}</span>? They will no longer be able to log into the admin console.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmRevoke}
                className="w-full py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Confirm Revoke
              </button>
              <button
                onClick={() => setIsRevokeModalOpen(false)}
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