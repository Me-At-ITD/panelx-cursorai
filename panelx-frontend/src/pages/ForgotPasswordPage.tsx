import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      setIsSubmitted(true);
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  const displayError = localError || authError;

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
          <Link
            to="/login"
            className="absolute top-6 left-6 text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>

          <div className="mb-8 mt-4 flex justify-center">
            <img
              src="/logo.png"
              alt="Design L.EFRAIM LTD."
              className="h-10 object-contain" />
          </div>

          {!isSubmitted ? (
            <>
              <h2 className="text-center font-heading text-xl font-bold text-text-primary mb-2">
                Forgot Password
              </h2>
              <p className="text-center text-[13px] text-text-secondary mb-8">
                Enter your email and we will send you a password reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 border bg-subtle-bg text-text-primary text-[13px] placeholder:text-text-placeholder focus:outline-none focus:border-accent transition-colors ${
                      displayError ? 'border-stat-alerts' : 'border-border'
                    }`}
                    placeholder="your.email@example.com"
                    disabled={isLoading} />
                </div>

                {displayError && (
                  <p className="text-[12px] text-stat-alerts">{displayError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="btn-primary w-full h-11 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send Reset Link'
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
                Check Your Email
              </h2>
              <p className="text-[13px] text-text-secondary mb-8">
                We've sent a password reset link to <br />
                <span className="font-medium text-text-primary">{email}</span>
              </p>
              <Link
                to="/login"
                className="btn-primary w-full h-11 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center justify-center">
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}