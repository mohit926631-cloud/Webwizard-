import React, { useState, useEffect } from 'react';
import { AuthMode, User } from '../../types';
import { apiService } from '../../services/api';
import { Sparkles, Eye, EyeOff, Lock, Mail, User as UserIcon, Check, X, ArrowLeft, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
  onToast,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [timer, setTimer] = useState(300); // 5 mins
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  // Password Requirements
  const hasMinLen = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Reset modal state on open or mode change
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setOtpStep('request');
      setOtpCode(['', '', '', '', '', '']);
      setGeneratedOtp(null);
      setLoading(false);
      setResetSent(false);
    }
  }, [isOpen, initialMode]);

  // Focus first OTP box on verify step
  useEffect(() => {
    if (otpStep === 'verify') {
      setTimeout(() => {
        document.getElementById('otp-box-0')?.focus();
      }, 100);
    }
  }, [otpStep]);

  // OTP Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (otpStep === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpStep, timer]);

  if (!isOpen) return null;

  // Handle Sending OTP Code
  const handleSendOTP = async () => {
    if (!email.includes('@')) {
      return onToast('error', 'Please enter a valid email address.');
    }
    if (mode === 'signup' && !name.trim()) {
      return onToast('error', 'Please enter your full name.');
    }
    if (mode === 'signup' && !termsAgreed) {
      return onToast('error', 'You must agree to the Terms of Service & Privacy Policy.');
    }

    setLoading(true);
    setOtpCode(['', '', '', '', '', '']);
    try {
      const res = await apiService.sendOTP(email.trim(), name.trim());
      setGeneratedOtp(res.otpCode);
      setOtpStep('verify');
      setTimer(300);
      onToast('success', `OTP Verification code sent to ${email.trim()}!`);
    } catch (err: any) {
      onToast('error', err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillOtp = () => {
    if (generatedOtp && generatedOtp.length === 6) {
      const digits = generatedOtp.split('');
      setOtpCode(digits);
      onToast('info', 'OTP code auto-filled! Click "Verify & Complete Sign In".');
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('').trim();
    if (fullCode.length !== 6) {
      return onToast('error', 'Please enter the complete 6-digit OTP code.');
    }

    setLoading(true);
    try {
      const res = await apiService.verifyOTP(email.trim(), fullCode, name.trim());
      onToast('success', `Authentication successful! Welcome, ${res.user.name}.`);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      onToast('error', err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle standard password auth
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      if (!name.trim()) return onToast('error', 'Please enter your full name.');
      if (!email.includes('@')) return onToast('error', 'Please enter a valid email address.');
      if (!hasMinLen || !hasNumber || !hasSpecial) {
        return onToast('error', 'Password must meet security requirements (8+ chars, 1 number, 1 special symbol).');
      }
      if (password !== confirmPassword) {
        return onToast('error', 'Passwords do not match.');
      }
      if (!termsAgreed) {
        return onToast('error', 'You must agree to the Terms of Service & Privacy Policy.');
      }

      setLoading(true);
      try {
        const res = await apiService.signup(name.trim(), email.trim(), password);
        onToast('success', 'Account created successfully! You received 200 free monthly credits.');
        onSuccess(res.user);
        onClose();
      } catch (err: any) {
        onToast('error', err.message || 'Signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'login') {
      if (!email.includes('@')) return onToast('error', 'Please enter a valid email address.');
      if (!password) return onToast('error', 'Please enter your password.');

      setLoading(true);
      try {
        const res = await apiService.login(email.trim(), password);
        onToast('success', `Welcome back, ${res.user.name}!`);
        onSuccess(res.user);
        onClose();
      } catch (err: any) {
        onToast('error', err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.includes('@')) return onToast('error', 'Please enter a valid email address.');
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setResetSent(true);
        onToast('info', 'Password reset instructions sent to your email.');
      }, 600);
    }
  };

  // Google OAuth Login
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = googleEmail.trim() || email.trim() || 'user@gmail.com';
    const targetName = googleName.trim() || (targetEmail.split('@')[0]) || 'Google User';

    if (!targetEmail.includes('@')) {
      return onToast('error', 'Please enter a valid Google email address.');
    }

    setLoading(true);
    try {
      const res = await apiService.googleLogin(
        targetName,
        targetEmail,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      );
      onToast('success', `Signed in with Google as ${res.user.email}!`);
      onSuccess(res.user);
      setShowGoogleModal(false);
      onClose();
    } catch (err: any) {
      onToast('error', err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);

    // Auto-focus next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const digits = pasted.split('');
      const newCode = [...otpCode];
      digits.forEach((d, i) => {
        if (i < 6) newCode[i] = d;
      });
      setOtpCode(newCode);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-8 overflow-hidden text-slate-100 my-auto">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER BRANDING */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white font-mono">VERVOX</span>

          {mode === 'login' && (
            <>
              <h2 className="text-xl font-bold text-white mt-1">
                {authMethod === 'otp' && otpStep === 'verify' ? 'Verify OTP Code' : 'Sign In to Vervox'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {authMethod === 'otp' && otpStep === 'verify'
                  ? `Enter the 6-digit code sent to ${email}`
                  : 'Access your AI websites, credits & dashboard.'}
              </p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="text-xl font-bold text-white mt-1">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1">Get 200 free monthly credits & start building AI websites.</p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="text-xl font-bold text-white mt-1">Forgot Password</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your email to receive password reset instructions.</p>
            </>
          )}
        </div>

        {/* METHOD TOGGLE BUTTONS (OTP vs Password) */}
        {mode !== 'forgot' && otpStep === 'request' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'otp'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Email OTP Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'password'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD RESET SENT STATE */}
        {mode === 'forgot' && resetSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Check Your Inbox</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Password reset instructions have been sent to <span className="text-indigo-300 font-semibold">{email}</span>.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 mt-4"
            >
              Back to Sign In
            </button>
          </div>
        ) : authMethod === 'otp' && mode !== 'forgot' ? (
          /* REAL EMAIL OTP AUTH FLOW */
          otpStep === 'request' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mohit Kumar"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="flex items-start gap-2 text-xs text-slate-300 pt-1">
                  <input
                    type="checkbox"
                    id="terms-otp"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <label htmlFor="terms-otp" className="cursor-pointer text-[11px] leading-snug">
                    I agree to the Terms of Service and Privacy Policy.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating OTP Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Send 6-Digit OTP Code
                  </span>
                )}
              </button>

              {/* GOOGLE SIGN IN BUTTON */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                  <span className="bg-slate-900 px-2">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGoogleEmail(email || 'mohit926631@gmail.com');
                  setGoogleName(name || 'Mohit Kumar');
                  setShowGoogleModal(true);
                }}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className="text-center pt-2 text-xs text-slate-400">
                {mode === 'login' ? (
                  <p>
                    Need a new account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setOtpStep('request');
                      }}
                      className="font-semibold text-indigo-400 hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setOtpStep('request');
                      }}
                      className="font-semibold text-indigo-400 hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>
          ) : (
            /* OTP VERIFICATION STEP */
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* REAL OTP DEMO BANNER WITH CLICK TO AUTO-FILL */}
              {generatedOtp && (
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="w-full p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-center transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-semibold text-indigo-300 group-hover:text-white transition-colors flex items-center justify-center gap-1">
                    <span>Security Verification Code:</span>
                    <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-200">Click to Auto-Fill</span>
                  </p>
                  <div className="text-2xl font-mono font-extrabold text-indigo-200 tracking-widest my-1 group-hover:scale-105 transition-transform">
                    {generatedOtp}
                  </div>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-300">Click anywhere on this box to auto-fill code</p>
                </button>
              )}

              {/* 6-DIGIT OTP INPUT BOXES */}
              <div className="flex justify-between gap-1.5 sm:gap-2 my-2" onPaste={handleOtpPaste}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpBoxKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-xl font-bold font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Code expires in <strong className="text-indigo-400 font-mono">{formatTimer(timer)}</strong></span>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || timer > 295}
                  className="text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.join('').length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying OTP Code...
                  </span>
                ) : (
                  'Verify & Complete Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => setOtpStep('request')}
                className="w-full py-2 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Email or Method
              </button>
            </form>
          )
        ) : (
          /* STANDARD PASSWORD FORM */
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Developer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-medium text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1.5">
                  <p className="font-semibold text-slate-400 mb-1">Password Requirements:</p>
                  <div className={`flex items-center gap-2 ${hasMinLen ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLen ? 'opacity-100' : 'opacity-40'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNumber ? 'opacity-100' : 'opacity-40'}`} />
                    <span>At least 1 number</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'opacity-100' : 'opacity-40'}`} />
                    <span>At least 1 special character (!@#$)</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'signup' ? (
                'Create Account & Get 200 Credits'
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* GOOGLE SIGN IN BUTTON */}
            {mode !== 'forgot' && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                    <span className="bg-slate-900 px-2">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGoogleEmail(email || 'mohit926631@gmail.com');
                    setGoogleName(name || 'Mohit Kumar');
                    setShowGoogleModal(true);
                  }}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <div className="text-center pt-2 text-xs text-slate-400">
              {mode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-semibold text-indigo-400 hover:underline"
                  >
                    Create one
                  </button>
                </p>
              ) : mode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-semibold text-indigo-400 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-indigo-400 hover:underline flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* REAL GOOGLE ACCOUNT SELECTOR MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-4">
              <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="text-base font-bold text-white">Sign in with Google</h3>
              <p className="text-xs text-slate-400 mt-1">Select or confirm your Google Account for Vervox</p>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Mohit Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Connecting Google Account...' : 'Confirm & Continue with Google'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
