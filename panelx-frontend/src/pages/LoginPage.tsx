import React, { useState } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  ZapIcon,
  BarChart3Icon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password');
      return;
    }

    const result = await login({ email, password });
    
    if (result.success) {
      navigate('/admin');
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel — desktop only */}
      <div
        className="hidden lg:flex lg:w-[40%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: '#0F172A'
        }}>
        
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(rgba(46,134,171,0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }} />
        
        {/* Radial overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(0,74,100,0.15) 0%, transparent 60%)'
          }} />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo white version */}
          <div className="flex items-center justify-center mb-12">
            <img
              src="/logo-light.png"
              alt="Design L.EFRAIM LTD."
              className="h-12 object-contain" />
          </div>

          <h2 className="font-heading text-xl font-semibold text-white mb-8 leading-relaxed">
            Engineering the Future of
            <br />
            Facade Management
          </h2>

          <div className="space-y-5 text-left">
            {[
              {
                icon: ShieldCheckIcon,
                text: 'Enterprise-grade security for your project data'
              },
              {
                icon: ZapIcon,
                text: 'Real-time sync across all project files'
              },
              {
                icon: BarChart3Icon,
                text: 'Comprehensive reporting and analytics'
              }
            ].map(({ icon: FeatureIcon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="p-1.5"
                  style={{
                    background: 'rgba(46,134,171,0.15)'
                  }}>
                  <FeatureIcon className="w-4 h-4 text-[#2E86AB]" />
                </div>
                <span className="text-[13px] text-slate-300 leading-relaxed">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div
        className="flex-1 flex items-center justify-center p-6"
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
            <div className="mb-10 flex justify-center">
              <img
                src="/logo.png"
                alt="Design L.EFRAIM LTD."
                className="h-10 object-contain" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 border bg-subtle-bg text-text-primary text-[13px] placeholder:text-text-placeholder focus:outline-none focus:border-accent transition-colors ${displayError ? 'border-stat-alerts' : 'border-border'}`}
                  placeholder="your.email@example.com"
                  disabled={authLoading} />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-heading font-medium text-text-primary mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 pr-12 border bg-subtle-bg text-text-primary text-[13px] placeholder:text-text-placeholder focus:outline-none focus:border-accent transition-colors ${displayError ? 'border-stat-alerts' : 'border-border'}`}
                    placeholder="Enter your password"
                    disabled={authLoading} />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                    disabled={authLoading}>
                    {showPassword ?
                      <EyeOffIcon className="w-4 h-4" /> :
                      <EyeIcon className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {displayError && <p className="text-[12px] text-stat-alerts">{displayError}</p>}

              <div className="flex justify-start">
                <Link
                  to="/forgot-password"
                  className="text-[12px] text-accent hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary w-full h-11 text-white font-heading text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {authLoading ?
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </> :
                  'LOGIN'
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}