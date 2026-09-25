import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import tutrLogo from "../assets/app_icon1.png";

const API_BASE = "http://192.168.100.10:8080/api/admin/auth";

// Safe JSON parser — falls back to {} if body isn't JSON
const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Steps: "email" -> "otp" -> "newPassword"
  const [step, setStep] = useState("email");
  const [isLoading, setIsLoading] = useState(false);

  // Email step
  const [email, setEmail] = useState("");

  // OTP step
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);

  // New password step
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal
  const [modal, setModal] = useState({
    show: false,
    type: "error", // "error" | "success"
    title: "",
    message: "",
  });

  // ---------- PASSWORD STRENGTH (same logic as TeamAccessControlPage) ----------
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: "", score: 0, color: "", text: "" };
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

  const pwdStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const canResetPassword =
    newPassword && pwdStrength.label === "Strong" && passwordsMatch;

  // ---------- TIMER ----------
  useEffect(() => {
    if (step !== "otp") return;
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ---------- MODAL HELPERS ----------
  const showModal = (type, title, message) =>
    setModal({ show: true, type, title, message });
  const closeModal = () =>
    setModal({ show: false, type: "error", title: "", message: "" });

  // ---------- STEP 1: SEND OTP ----------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email) {
      showModal("error", "Missing Email", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await safeJson(response);

      if (!response.ok) {
        setIsLoading(false);
        showModal(
          "error",
          "Request Failed",
          data.error || "Unable to send OTP. Please try again.",
        );
        return;
      }

      setIsLoading(false);
      setStep("otp");
      setTimeLeft(180);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setIsLoading(false);
      showModal(
        "error",
        "Network Error",
        "Check your connection and try again.",
      );
    }
  };

  // ---------- RESEND OTP ----------
  const handleResendOtp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await safeJson(response);
      setIsLoading(false);

      if (!response.ok) {
        showModal(
          "error",
          "Resend Failed",
          data.error || "Unable to resend OTP.",
        );
        return;
      }

      setTimeLeft(180);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      showModal(
        "success",
        "OTP Sent",
        "A new OTP has been sent to your email.",
      );
    } catch (err) {
      setIsLoading(false);
      showModal("error", "Network Error", "Please try again.");
    }
  };

  // ---------- OTP INPUT HANDLERS ----------
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    const lastIndex = Math.min(pasted.length, 6) - 1;
    otpRefs.current[lastIndex]?.focus();
  };

  // ---------- STEP 2: VERIFY OTP ----------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const code = otp.join("");
    if (code.length !== 6) {
      showModal("error", "Invalid OTP", "Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await safeJson(response);

      if (!response.ok) {
        setIsLoading(false);
        showModal(
          "error",
          "Verification Failed",
          data.error || "Invalid or expired OTP. Please try again.",
        );
        return;
      }

      setIsLoading(false);
      setStep("newPassword");
    } catch (err) {
      setIsLoading(false);
      showModal("error", "Network Error", "Please try again.");
    }
  };

  // ---------- STEP 3: RESET PASSWORD ----------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!newPassword || !confirmPassword) {
      showModal("error", "Missing Fields", "Please fill both password fields.");
      return;
    }
    if (pwdStrength.label !== "Strong") {
      showModal(
        "error",
        "Weak Password",
        "Password must be Strong (8+ chars, upper, lower, number & symbol).",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showModal(
        "error",
        "Passwords Don't Match",
        "New password and confirm password must be identical.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
      });
      const data = await safeJson(response);

      if (!response.ok) {
        setIsLoading(false);
        showModal(
          "error",
          "Reset Failed",
          data.error || "Unable to reset password. Please try again.",
        );
        return;
      }

      setIsLoading(false);
      showModal(
        "success",
        "Password Reset Successful",
        "Your password has been updated. You can now log in with your new password.",
      );
    } catch (err) {
      setIsLoading(false);
      showModal("error", "Network Error", "Please try again.");
    }
  };

  // ---------- MODAL ACTION ----------
  const handleModalPrimary = () => {
    if (modal.type === "success" && step === "newPassword") {
      closeModal();
      navigate("/login");
    } else {
      closeModal();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A1A] relative">
      {/* Top Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-sm overflow-hidden p-2.5">
          <img
            src={tutrLogo}
            alt="TUTR Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-black tracking-widest text-black uppercase">
          TUTR
        </h1>
        <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-1">
          {step === "email" && "Password Recovery"}
          {step === "otp" && "OTP Verification"}
          {step === "newPassword" && "Set New Password"}
        </p>
      </div>

      {/* Main Box */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/60 border border-gray-100">
        {/* ---------- STEP 1: EMAIL ---------- */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-base font-bold text-gray-900">
                Forgot your password?
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered email and we'll send you a 6-digit OTP.
              </p>
            </div>

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
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#F3F4F6] border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200 placeholder-gray-400 disabled:opacity-60"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </button>
          </form>
        )}

        {/* ---------- STEP 2: OTP ---------- */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center mb-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Enter verification code
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={isLoading || canResend}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onPaste={handleOtpPaste}
                  className="w-11 h-12 text-center text-lg font-bold bg-[#F3F4F6] border border-transparent rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all disabled:opacity-60"
                />
              ))}
            </div>

            {/* Timer / Resend */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-xs text-gray-500">
                  Code expires in{" "}
                  <span className="font-bold text-black tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-xs font-semibold text-black hover:underline cursor-pointer disabled:opacity-50"
                >
                  Didn't receive the code? Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || canResend}
              className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Change Email
            </button>
          </form>
        )}

        {/* ---------- STEP 3: NEW PASSWORD ---------- */}
        {step === "newPassword" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="text-center mb-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Set a new password
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Your new password must be different from the previous one.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                <Lock className="w-3.5 h-3.5 mr-2 text-gray-500" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-[#F3F4F6] border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-gray-300 focus:bg-white transition-all pr-10 disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pwdStrength.color} transition-all`}
                      style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${pwdStrength.text}`}>
                    {pwdStrength.label}
                  </span>
                </div>
              )}

              {newPassword && pwdStrength.label !== "Strong" && (
                <p className="text-[10px] text-red-500 mt-1">
                  Password must be Strong (8+ chars, upper, lower, number &
                  symbol).
                </p>
              )}
            </div>

            {/* Confirm Password — paste disabled */}
            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                <Lock className="w-3.5 h-3.5 mr-2 text-gray-500" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    showModal(
                      "error",
                      "Paste Not Allowed",
                      "For security, please type your confirm password manually.",
                    );
                  }}
                  onDrop={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-[#F3F4F6] border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-gray-300 focus:bg-white transition-all pr-10 disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {confirmPassword && !passwordsMatch && (
                <p className="text-[10px] text-red-500 mt-1">
                  Passwords do not match.
                </p>
              )}

              {!confirmPassword && (
                <p className="text-[10px] text-gray-400 mt-1.5">
                  For security, pasting is disabled — please type it manually.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !canResetPassword}
              className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-xs text-gray-500 space-y-3">
        <p>Protected by TUTR Identity Services.</p>
      </div>

      {/* ---------- MODAL ---------- */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
                modal.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {modal.type === "error" ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <h3 className="font-bold text-sm text-gray-900 mb-1">
              {modal.title}
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {modal.message}
            </p>

            <button
              onClick={handleModalPrimary}
              className="w-full py-2.5 bg-black text-white font-semibold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {modal.type === "success" && step === "newPassword"
                ? "Back to Login"
                : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
