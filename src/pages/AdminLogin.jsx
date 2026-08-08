import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import tutrLogo from '../assets/app_icon1.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // Navigate straight to the dashboard page on submission
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A1A]">
      
      {/* Top Header: Logo & Branding */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-sm overflow-hidden p-2.5">
          <img 
            src={tutrLogo} 
            alt="TUTR Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-3xl font-black tracking-widest text-black uppercase">TUTR</h1>
        <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-1">
          Admin Console Access
        </p>
      </div>

      {/* Main Login Box */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/60 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
              <Mail className="w-3.5 h-3.5 mr-2 text-gray-500" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tutr.edu"
              className="w-full px-4 py-3 bg-[#F3F4F6] border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200 placeholder-gray-400"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
              <Lock className="w-3.5 h-3.5 mr-2 text-gray-500" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#F3F4F6] border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200 placeholder-gray-400 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
              />
              Remember me
            </label>
            <a href="#forgot" className="font-semibold text-black hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            Login to Console
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-10 text-center text-xs text-gray-500 space-y-3">
        <p>Protected by TUTR Identity Services.</p>
        <div className="flex items-center justify-center gap-3 text-gray-600 font-medium">
          <a href="#privacy" className="hover:underline">Privacy Policy</a>
          <span className="text-gray-300">•</span>
          <a href="#terms" className="hover:underline">Terms of Service</a>
          <span className="text-gray-300">•</span>
          <a href="#status" className="hover:underline">System Status</a>
        </div>
      </div>

    </div>
  );
};

export default AdminLogin;