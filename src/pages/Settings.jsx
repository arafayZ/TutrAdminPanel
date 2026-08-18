import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import DisplayPicture from '../assets/dp.JPG';

const Settings = () => {
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [profile, setProfile] = useState({
    fullName: 'Abdul Rafay',
    email: 'admin@gmail.com',
    role: 'Admin',
    bio: 'Advanced mathematics student focusing on quantum mechanics. Seeking professional tutors for specialized advanced calculus and theoretical physics applications.',
    avatar: DisplayPicture
  });

  // Modal & Notification States
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setAlertModal({
      isOpen: true,
      title: 'Profile Updated',
      message: 'Your profile details have been saved successfully.',
      type: 'success'
    });
  };

  // Handle Avatar Change (Simulated Upload)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar: imageUrl }));
      setAlertModal({
        isOpen: true,
        title: 'Avatar Updated',
        message: 'Your profile picture has been updated.',
        type: 'success'
      });
    }
  };

  // Handle Password Update Submit
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setAlertModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fill out all password fields.',
        type: 'danger'
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlertModal({
        isOpen: true,
        title: 'Password Mismatch',
        message: 'New passwords do not match!',
        type: 'danger'
      });
      return;
    }

    setIsPasswordModalOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setAlertModal({
      isOpen: true,
      title: 'Password Changed',
      message: 'Your password has been successfully updated.',
      type: 'success'
    });
  };

  // Handle Deactivate Account
  const handleConfirmDeactivate = () => {
    setIsDeactivateModalOpen(false);
    setAlertModal({
      isOpen: true,
      title: 'Account Action',
      message: 'Deactivation request submitted to super admin.',
      type: 'danger'
    });
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TUTR - Settings & Account Summary', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Setting Category', 'Detail']],
      body: [
        ['Full Name', profile.fullName],
        ['Email Address', profile.email],
        ['Role', profile.role],
        ['Bio', profile.bio],
        ['Security', 'Password Last Changed 3 months ago'],
        ['Account Status', 'Active']
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });

    doc.save('Admin_Settings_Summary.pdf');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden relative">
      
      {/* Sidebar Component */}
      <Sidebar onGenerateReport={handleExportPDF} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">

        {/* Top Bar Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer relative">
              <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5 border border-white"></span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
            
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
              <img src={profile.avatar} alt="Admin Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Card: Profile Avatar & Basic Info */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col items-center text-center">
              <div className="relative group">
                <img 
                  src={profile.avatar} 
                  alt={profile.fullName} 
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                />
                <label className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-zinc-800 transition-all shadow-md">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l0.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l0.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              <h2 className="text-base font-bold text-gray-900 mt-4">{profile.fullName}</h2>
              <p className="text-xs text-gray-400 font-medium">{profile.role}</p>

              <label className="mt-6 w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center cursor-pointer">
                Change Avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Right Column Stack */}
            <div className="lg:col-span-8 space-y-6">

              {/* Public Profile Form Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                <form onSubmit={handleSaveProfile}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Public Profile</h3>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full bg-[#F4F5F7] rounded-xl px-4 py-3 text-xs font-medium text-gray-800 border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full bg-[#F4F5F7] rounded-xl px-4 py-3 text-xs font-medium text-gray-800 border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                      PROFESSIONAL BIO
                    </label>
                    <textarea
                      rows="4"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full bg-[#F4F5F7] rounded-xl p-4 text-xs font-medium text-gray-800 border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>
                </form>
              </div>

              {/* Security & Privacy Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Security & Privacy</h3>
                </div>

                {/* Password Change Row */}
                <div className="flex items-center justify-between pt-2 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Password</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Last changed 3 months ago</p>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>

                {/* Deactivate Account Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-red-600">Deactivate Account</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Permanently delete your data</p>
                  </div>
                  <button
                    onClick={() => setIsDeactivateModalOpen(true)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    Manage Privacy
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      </main>

      {/* ---------------- UPDATE PASSWORD MODAL (WHITE BACKGROUND) ---------------- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-gray-900 mb-1">Update Password</h3>
            <p className="text-xs text-gray-500 mb-4">Enter your current password to make changes.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-left">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-medium border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-medium border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-medium border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- DEACTIVATE CONFIRMATION MODAL (WHITE BACKGROUND) ---------------- */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">Deactivate Account?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">This action cannot be undone. You will lose admin access to the TUTR dashboard.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsDeactivateModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeactivate}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- POPUP ALERT MODAL (WHITE BACKGROUND) ---------------- */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">{alertModal.title}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ isOpen: false, title: '', message: '', type: 'info' })}
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

export default Settings;