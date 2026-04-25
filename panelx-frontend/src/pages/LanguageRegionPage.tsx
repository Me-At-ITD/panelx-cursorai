import React from 'react';
import { GlobeIcon } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
export function LanguageRegionPage() {
  const { t, language, setLanguage } = useLanguage();
  return (
    <div>
      <h1
        className="font-heading text-2xl font-bold text-text-primary mb-8 uppercase tracking-wide"
        style={{
          animation: 'fadeUp 0.35s ease both'
        }}>
        
        {t('Language & Region')}
      </h1>

      <div
        style={{
          animation: 'fadeUp 0.35s ease both',
          animationDelay: '100ms'
        }}>
        
        <div className="bg-card-bg border border-border p-8 min-h-[400px]">
          <div className="max-w-2xl">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-accent" />
              {t('Language & Region')}
            </h2>

            <div className="space-y-6">
              <div className="p-6 border border-border bg-subtle-bg">
                <h3 className="font-heading text-[13px] font-bold text-text-primary uppercase tracking-wider mb-4">
                  {t('Interface Language')}
                </h3>
                <p className="text-[13px] text-text-secondary mb-4">
                  Select your preferred language. This will also update the text
                  direction (LTR/RTL).
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 p-4 border flex flex-col items-center justify-center gap-2 transition-colors ${language === 'en' ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card-bg text-text-secondary hover:border-accent/50'}`}>
                    
                    <span className="text-2xl font-bold">A</span>
                    <span className="font-heading text-[12px] font-semibold uppercase tracking-wider">
                      {t('English (LTR)')}
                    </span>
                  </button>

                  <button
                    onClick={() => setLanguage('he')}
                    className={`flex-1 p-4 border flex flex-col items-center justify-center gap-2 transition-colors ${language === 'he' ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card-bg text-text-secondary hover:border-accent/50'}`}>
                    
                    <span className="text-2xl font-bold">א</span>
                    <span className="font-heading text-[12px] font-semibold uppercase tracking-wider">
                      {t('Hebrew (RTL)')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}