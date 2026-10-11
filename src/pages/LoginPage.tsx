import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Radio, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  Building2 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read post-login redirection target
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: cleanEmail, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#202B29] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white border border-[#E1E7E2] rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero Brand Panel (Desktop only) */}
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
                    Intelligent Urban Operations & Telemetry
                  </h3>
                  <p className="text-xs text-[#A8C5BD] leading-relaxed">
                    Integrated command infrastructure connecting traffic flow control, multi-agency emergency response, and municipal utilities across Greater Hyderabad.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1F4D43] border border-[#2A6458]">
                    <Activity className="w-4 h-4 text-[#188568] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-white block">Real-time Telemetry</span>
                      <span className="text-[#A8C5BD] text-[11px]">Sub-second congestion & environmental sensing.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1F4D43] border border-[#2A6458]">
                    <ShieldCheck className="w-4 h-4 text-[#188568] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-white block">Role-Based Security</span>
                      <span className="text-[#A8C5BD] text-[11px]">BCrypt hashing and cryptographically signed JWTs.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1F4D43] flex items-center justify-between text-[11px] text-[#A8C5BD] font-mono">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#188568]" />
                <span>Hyderabad Command Hub</span>
              </span>
              <span>v2.4 Secure</span>
            </div>
          </div>

          {/* Right Login Form Panel */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            
            {/* Mobile Brand Header */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-10 h-10 rounded-lg bg-[#188568] flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-[#202B29] tracking-wide block leading-tight">
                  CITY BRAIN
                </span>
                <span className="text-[10px] font-mono text-[#697773] uppercase tracking-wider">
                  Hyderabad Command Center
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202B29] tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-[#697773] mt-1.5">
                Sign in to your City Brain command center.
              </p>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div 
                role="alert"
                className="mb-6 p-4 rounded-xl bg-[#FDF2F2] border border-[#FADCDA] flex items-start gap-3 text-xs text-[#D64545] animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D64545]" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Email Input */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-xs font-semibold uppercase tracking-wider text-[#202B29] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697773]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@citybrain.gov.in"
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] focus:bg-white transition-all font-sans"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="password" 
                    className="block text-xs font-semibold uppercase tracking-wider text-[#202B29]"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697773]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] focus:bg-white transition-all font-sans"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#697773] hover:text-[#202B29] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Register Redirect */}
            <div className="mt-8 pt-6 border-t border-[#E1E7E2] text-center">
              <p className="text-xs text-[#697773]">
                Do not have an authorized account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-[#188568] hover:text-[#11654F] underline ml-1"
                >
                  Create an account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
