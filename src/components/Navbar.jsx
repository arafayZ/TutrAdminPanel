import React from 'react';
import AppIcon from '../assets/tutr_icon.png';

const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  viewState, 
  setViewState, 
  user = { name: "Abdul Rafay", role: "ADMIN" },
  placeholder = "Search..." 
}) => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Brand Logo */}
      <div className="w-48 flex items-center">
        <img 
          src={AppIcon} 
          alt="TUTR Logo" 
          className="h-9 w-auto object-contain cursor-pointer" 
          onClick={() => setViewState && setViewState('dashboard')}
        />
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Notifications & Admin Profile */}
      <div className="flex items-center justify-end gap-4">
        <button 
          onClick={() => setViewState && setViewState('notifications')}
          className={`p-2 rounded-full transition-colors cursor-pointer relative ${
            viewState === 'notifications' ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }`}
        >
          <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5 border border-white"></span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="text-right">
            <p className="text-xs font-bold leading-tight">{user.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{user.role}</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
            alt="User Avatar" 
            className="w-8 h-8 rounded-full object-cover border border-gray-200" 
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;