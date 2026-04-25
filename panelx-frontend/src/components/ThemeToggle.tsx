import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('panelx-theme') === 'dark';
    }
    return false;
  });
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('panelx-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('panelx-theme', 'light');
    }
  }, [isDark]);
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      
      <div
        key={isDark ? 'moon' : 'sun'}
        style={{
          animation: 'iconFlip 0.4s ease'
        }}>
        
        {isDark ?
        <SunIcon className="w-5 h-5" /> :

        <MoonIcon className="w-5 h-5" />
        }
      </div>
    </button>);

}