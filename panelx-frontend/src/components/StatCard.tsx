import React, { useEffect, useState, useRef } from 'react';
import { BoxIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: number;
  icon: BoxIcon;
  accentColor: string;
  trend?: string;
  sparkData?: number[];
  delay?: number;
}
function useCountUp(target: number, duration: number = 800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}
function MiniSparkline({ data, color }: {data: number[];color: string;}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = data.
  map((v, i) => {
    const x = i / (data.length - 1) * w;
    const y = h - (v - min) / range * (h - 4) - 2;
    return `${x},${y}`;
  }).
  join(' ');
  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-3">
      
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4" />
      
    </svg>);

}
export function StatCard({
  title,
  value,
  icon: Icon,
  accentColor,
  trend = '↑ 12%',
  sparkData = [4, 7, 5, 9, 6, 8],
  delay = 0
}: StatCardProps) {
  const animatedValue = useCountUp(value, 800);
  return (
    <div
      className="bg-card-bg border border-border p-6 transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        borderLeft: `3px solid ${accentColor}`,
        boxShadow:
        '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
        animation: `fadeUp 0.35s ease both`,
        animationDelay: `${delay}ms`
      }}>
      
      <div className="flex items-start justify-between">
        <div>
          <p className="font-heading text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p
              className="text-3xl font-heading font-bold"
              style={{
                color: accentColor
              }}>
              
              {animatedValue}
            </p>
            <span className="text-[9px] text-text-secondary uppercase tracking-wider">
              {trend}
            </span>
          </div>
        </div>
        <div
          className="p-2.5"
          style={{
            background: `${accentColor}15`
          }}>
          
          <Icon
            className="w-5 h-5"
            style={{
              color: accentColor
            }} />
          
        </div>
      </div>
      <MiniSparkline data={sparkData} color={accentColor} />
    </div>);

}