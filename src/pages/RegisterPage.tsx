import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Radio, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Building2 
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    // Client-side validations
    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please choose a password.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please accept the urban operations platform security terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: cleanName,
        email: cleanEmail,
        password,
        termsAccepted: true,
      });
      // Redirect to dashboard on successful registration
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#202B29] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white border border-[#E1E7E2] rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Brand Summary Panel */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#173D35] p-10 flex-col justify-between text-white border-r border-[#1F4D43]">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-xl bg-[#188568] flex items-center justify-center shrink-0 shadow-sm">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg tracking-wide leading-tight">CITY BRAIN</h2>
                  <p className="text-[10px] font-mono text-[#A8C5BD] uppercase tracking-widest">
                    Urban Management System
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                    Register Command Account
                  </h3>
                  <p className="text-xs text-[#A8C5BD] leading-relaxed">
                    Create an authorized operational account to access multi-domain urban analytics, telemetry dashboards, and spatial GIS mapping.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1F4D43] border border-[#2A6458]">
                    <CheckCircle2 className="w-4 h-4 text-[#188568] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-white block">Default Role Assignment</span>
                      <span className="text-[#A8C5BD] text-[11px]">All new accounts are safely assigned the USER role.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1F4D43] border border-[#2A6458]">
                    <ShieldCheck className="w-4 h-4 text-[#188568] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-white block">Cryptographic Protection</span>
                      <span className="text-[#A8C5BD] text-[11px]">Passwords salted and hashed using BCrypt in MySQL.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1F4D43] flex items-center justify-between text-[11px] text-[#A8C5BD] font-mono">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#188568]" />
                <span>Hyderabad Operations Sector</span>
              </span>
              <span>v2.4 Secure</span>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            
            {/* Mobile Header */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-10 h-10 rounded-lg bg-[#188568] flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-[#202B29] tracking-wide block leading-tight">
                  CITY BRAIN
                </span>
                <span className="text-[10px] font-mono text-[#697773] uppercase tracking-wider">
                  Urban Operations Hub
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202B29] tracking-tight">
                Create an account
              </h1>
              <p className="text-xs sm:text-sm text-[#697773] mt-1.5">
                Register as an urban management operator.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div 
                role="alert"
                className="mb-5 p-4 rounded-xl bg-[#FDF2F2] border border-[#FADCDA] flex items-start gap-3 text-xs text-[#D64545] animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D64545]" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Full Name */}
              <div>
                <label 
                  htmlFor="fullName" 
                  className="block text-xs font-semibold uppercase tracking-wider text-[#202B29] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697773]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] focus:bg-white transition-all font-sans"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label 
                  htmlFor="register-email" 
                  className="block text-xs font-semibold uppercase tracking-wider text-[#202B29] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697773]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@citybrain.gov.in"
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] focus:bg-white transition-all font-sans"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password and Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label 
                    htmlFor="register-password" 
                    className="block text-xs font-semibold uppercase tracking-wider text-[#202B29] mb-1.5"
                  >
                    Password (8+ chars)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697773]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] focus:bg-white transition-all font-sans"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#697773] hover:text-[#202B29]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-xs font-semibold uppercase tracking-wider text-[#202B29] mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697773]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] focus:bg-white transition-all font-sans"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#697773] hover:text-[#202B29]"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#E1E7E2] text-[#188568] focus:ring-[#188568] cursor-pointer"
                  />
                  <span className="text-xs text-[#697773] leading-relaxed">
                    I agree to the City Brain operational guidelines and understand that all activities are audited under municipal governance.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg bg-[#188568] hover:bg-[#11654F] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Link to Login */}
            <div className="mt-6 pt-5 border-t border-[#E1E7E2] text-center">
              <p className="text-xs text-[#697773]">
                Already have an authorized account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-[#188568] hover:text-[#11654F] underline ml-1"
                >
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
