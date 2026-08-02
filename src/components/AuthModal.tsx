import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiLogin, apiRegister, apiResendVerification, apiForgotPassword, apiResetPassword } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  initialResetToken?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, showToast, initialResetToken }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'reset_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (initialResetToken) {
      setResetToken(initialResetToken);
      setMode('reset_password');
    }
  }, [initialResetToken]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);
    setUnverifiedEmail(null);

    if (mode === 'login') {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      setLoading(true);
      try {
        const res = await apiLogin(email, password);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        onSuccess(res.user);
        onClose();
      } catch (err: any) {
        if (err.unverified) {
          setUnverifiedEmail(err.email || email);
          setError('Please verify your email address before logging in.');
        } else {
          setError(err.message || 'Invalid email or password.');
        }
      } finally {
        setLoading(false);
      }
    } else if (mode === 'register') {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      setLoading(true);
      try {
        const res = await apiRegister(name, email, password, confirmPassword);
        setSuccessInfo(res.message);
        setUnverifiedEmail(email);
        showToast('Registration complete! Please check your email for the verification link.', 'success');
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot_password') {
      if (!email) {
        setError('Please enter your registered email address.');
        return;
      }
      setLoading(true);
      try {
        const res = await apiForgotPassword(email);
        setSuccessInfo(res.message);
        showToast(res.message, 'success');
      } catch (err: any) {
        setError(err.message || 'Unable to request password reset.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'reset_password') {
      if (!resetToken || !newPassword) {
        setError('Reset token and new password are required.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      setLoading(true);
      try {
        const res = await apiResetPassword(resetToken, newPassword);
        showToast(res.message, 'success');
        setSuccessInfo(res.message);
        setMode('login');
      } catch (err: any) {
        setError(err.message || 'Password reset failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;

    setResendLoading(true);
    try {
      const res = await apiResendVerification(targetEmail);
      showToast(res.message, 'success');
      setSuccessInfo('A new verification email has been sent. Please check your inbox.');
    } catch (err: any) {
      showToast(err.message || 'Failed to resend verification email.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header decoration with HerShield Theme */}
        <div className="bg-gradient-to-r from-[#43266F] via-[#6C4AB6] to-[#E88BA5] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 fill-white/30 stroke-white stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            {mode === 'login' && 'Welcome Back to HerShield'}
            {mode === 'register' && 'Join HerShield Safety'}
            {mode === 'forgot_password' && 'Reset Password'}
            {mode === 'reset_password' && 'Set New Password'}
          </h3>
          <p className="text-xs text-purple-100 mt-1">
            {mode === 'login' && 'Access your trusted contacts and safe route logs'}
            {mode === 'register' && 'Create your account to start sharing safe journeys'}
            {mode === 'forgot_password' && "We'll send password reset instructions to your email"}
            {mode === 'reset_password' && 'Choose a strong new password for your account'}
          </p>
        </div>

        {/* Tab switcher (Only shown for login & register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessInfo(null);
                setUnverifiedEmail(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-[#6C4AB6] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessInfo(null);
                setUnverifiedEmail(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register' ? 'bg-white text-[#6C4AB6] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{error}</div>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="mt-2 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {resendLoading ? (
                      <span className="w-3 h-3 border-2 border-rose-800 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>Resend Verification Email</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {successInfo && (
            <div className="p-3.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{successInfo}</div>
                {mode === 'register' && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="mt-2.5 px-3 py-1.5 bg-[#6C4AB6] hover:bg-[#43266F] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {resendLoading ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>Resend Email Link</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                      setSuccessInfo(null);
                    }}
                    className="text-xs font-semibold text-[#6C4AB6] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]"
                />
              </div>
            </div>
          )}

          {mode === 'reset_password' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reset Token</label>
                <input
                  type="text"
                  placeholder="Paste reset token here"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6C4AB6] text-white hover:bg-[#43266F] active:scale-98 transition-all shadow-md shadow-[#6C4AB6]/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Register Account'}
                  {mode === 'forgot_password' && 'Send Reset Link'}
                  {mode === 'reset_password' && 'Reset Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'forgot_password' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessInfo(null);
              }}
              className="w-full text-center text-xs text-slate-600 hover:text-[#6C4AB6] font-semibold pt-1"
            >
              Back to Sign In
            </button>
          )}

          <p className="text-[11px] text-center text-slate-500 pt-2">
            Passwords are securely hashed using bcrypt encryption.
          </p>
        </form>
      </div>
    </div>
  );
};
