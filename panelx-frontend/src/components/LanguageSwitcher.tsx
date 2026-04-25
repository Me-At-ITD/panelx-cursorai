import React, { useEffect, useState, useRef } from 'react';
import { GlobeIcon, CheckIcon } from 'lucide-react';
import { useLanguage } from './LanguageContext';
export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      popupRef.current &&
      !popupRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  return (
    <div
      className="fixed bottom-6 ltr:left-6 rtl:right-6 z-[9997]"
      ref={popupRef}>
      
      {/* Popup Panel */}
      {isOpen &&
      <div
        className="absolute bottom-16 ltr:left-0 rtl:right-0 w-[200px] bg-card-bg border border-border flex flex-col"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
          animation: 'fadeUp 0.2s ease both'
        }}>
        
          <div className="p-3 border-b border-border bg-subtle-bg">
            <h3 className="font-heading text-[11px] font-bold text-text-primary uppercase tracking-wider">
              {t('Select Language')}
            </h3>
          </div>
          <div className="p-2 flex flex-col gap-1">
            <button
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-[13px] transition-colors ${language === 'en' ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary hover:bg-subtle-bg hover:text-text-primary'}`}>
            
              <span>English (LTR)</span>
              {language === 'en' && <CheckIcon className="w-4 h-4" />}
            </button>
            <button
            onClick={() => {
              setLanguage('he');
              setIsOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-[13px] transition-colors ${language === 'he' ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary hover:bg-subtle-bg hover:text-text-primary'}`}>
            
              <span>עברית (RTL)</span>
              {language === 'he' && <CheckIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      }

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center bg-card-bg border border-border text-text-primary hover:text-accent hover:border-accent transition-all group"
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        aria-label={t('Language')}>
        
        <div className="flex flex-col items-center">
          <GlobeIcon className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-heading font-bold uppercase tracking-widest">
            {language === 'en' ? 'EN' : 'עב'}
          </span>
        </div>
      </button>
    </div>);

}