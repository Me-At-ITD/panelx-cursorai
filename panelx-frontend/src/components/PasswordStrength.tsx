import React from 'react';
import { CheckCircleIcon } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

const RULES = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number (0–9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const passed = RULES.filter(r => r.test(password)).length;
  const strengthColors = ['#DC2626', '#D97706', '#D97706', '#16A34A', '#16A34A'];
  const barColor = strengthColors[passed - 1] ?? '#e2e8f0';

  return (
    <div className="mt-2 p-3 bg-subtle-bg border border-border">
      <div className="flex gap-1 mb-2">
        {RULES.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 transition-all duration-200"
            style={{ background: i < passed ? barColor : 'var(--border)' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-heading font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
        Password Requirements
      </p>
      <div className="space-y-1">
        {RULES.map((rule, i) => {
          const ok = rule.test(password);
          return (
            <div key={i} className="flex items-center gap-2">
              {ok ? (
                <CheckCircleIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-border flex-shrink-0" />
              )}
              <span className={`text-[11px] ${ok ? 'text-green-500' : 'text-text-secondary'}`}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function validatePassword(password: string): boolean {
  return RULES.every(r => r.test(password));
}
