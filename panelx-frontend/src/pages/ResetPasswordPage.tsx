import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, isLoading, error: authError } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localError, setLocalError] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Extract token from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      setResetToken(token);
    } else {
      setLocalError('Invalid or missing reset token');
    }
  }, [location]);

  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (strength < 3) {
      setLocalError('Please choose a stronger password (min 8 chars, include uppercase, number, and special character)');
      return;
    }

    if (!resetToken) {
      setLocalError('Invalid reset token');
      return;
    }

    const result = await resetPassword(resetToken, password);
    
    if (result.success) {
      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  const displayError = localError || authError;

  // If no token, show error
  if (!resetToken && !isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--bg-page)' }}>
        <div
          className="w-full max-w-[440px] bg-card-bg p-12 relative"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
            border: '0.5px solid var(--border)'
          }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-status-problem-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-status-problem"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-[13px] text-text-secondary mb-8">
              The password reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="btn-primary w-full h-11 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center justify-center">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'var(--bg-page)'
      }}>
      
      <div
        className="w-full max-w-[440px] bg-card-bg p-12 relative"
        style={{
          boxShadow:
          '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
          border: '0.5px solid var(--border)'
        }}>
        
        {/* Corner accents */}
        <div
          className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#004a64]"
          style={{
            animation: 'drawLine 0.6s ease 0.3s both'
          }} />
        
        <div
          className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#004a64]"
          style={{
            animation: 'drawLine 0.6s ease 0.4s both'
          }} />
        
        <div
          className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#004a64]"
          style={{
            animation: 'drawLine 0.6s ease 0.5s both'
          }} />
        
        <div
          className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#004a64]"
          style={{
            animation: 'drawLine 0.6s ease 0.6s both'
          }} />

        <div className="animate-fade-up">
          <div className="mb-8 flex justify-center">
            <img
              src="/logo.png"
              alt="Design L.EFRAIM LTD."
              className="h-10 object-contain" />
          </div>

          {!isSubmitted ? (
            <>
              <h2 className="text-center font-heading text-xl font-bold text-text-primary mb-2">
                Reset Password
              </h2>
              <p className="text-center text-[13px] text-text-secondary mb-8">
                Please enter your new password below
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 pr-12 border bg-subtle-bg text-text-primary text-[13px] placeholder:text-text-placeholder focus:outline-none focus:border-accent transition-colors ${
                        displayError ? 'border-stat-alerts' : 'border-border'
                      }`}
                      placeholder="Enter new password"
                      disabled={isLoading} />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1 h-1">
                        <div className={`flex-1 ${strength >= 1 ? strength === 1 ? 'bg-status-problem' : strength === 2 ? 'bg-status-pending' : 'bg-status-installed' : 'bg-border'}`} />
                        <div className={`flex-1 ${strength >= 2 ? strength === 2 ? 'bg-status-pending' : 'bg-status-installed' : 'bg-border'}`} />
                        <div className={`flex-1 ${strength >= 3 ? 'bg-status-installed' : 'bg-border'}`} />
                        <div className={`flex-1 ${strength >= 4 ? 'bg-status-installed' : 'bg-border'}`} />
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        {strength === 0 && 'Enter a password'}
                        {strength === 1 && 'Weak password'}
                        {strength === 2 && 'Fair password'}
                        {strength === 3 && 'Good password'}
                        {strength === 4 && 'Strong password'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 pr-12 border bg-subtle-bg text-text-primary text-[13px] placeholder:text-text-placeholder focus:outline-none focus:border-accent transition-colors ${
                        displayError ? 'border-stat-alerts' : 'border-border'
                      }`}
                      placeholder="Confirm new password"
                      disabled={isLoading} />
                    
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                      {showConfirmPassword ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {displayError && (
                  <p className="text-[12px] text-status-problem">{displayError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="btn-primary w-full h-11 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center animate-fade-up">
              <div className="w-16 h-16 bg-status-installed-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-status-installed"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-xl font-bold text-text-primary mb-2">
                Password Reset Successful
              </h2>
              <p className="text-[13px] text-text-secondary mb-8">
                Your password has been successfully updated. Redirecting to login...
              </p>
              <Link
                to="/login"
                className="btn-primary w-full h-11 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center justify-center">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}