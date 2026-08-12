import React from 'react';
import { Sun, Sparkles, Zap, Activity } from 'lucide-react';
import { DIPMetrics } from '../types';

interface DipMetricsCardProps {
  metrics: DIPMetrics;
}

export const DipMetricsCard: React.FC<DipMetricsCardProps> = ({ metrics }) => {
  const brightness = metrics?.brightness ?? 0;
  const contrast = metrics?.contrast ?? 0;
  const sharpness = metrics?.sharpness ?? 0;
  const entropy = metrics?.entropy ?? 0;

  const metricItems = [
    {
      id: 'brightness',
      name: 'Brightness',
      value: brightness,
      unit: '/ 255',
      icon: Sun,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      barColor: 'bg-amber-400',
      pct: Math.min(100, (brightness / 255) * 100),
      evalText: brightness < 80 ? 'Low light' : brightness > 180 ? 'High luminance' : 'Balanced lighting',
      formula: 'Mean pixel intensity: (1/N) * ∑ I_i',
      interviewNote: 'AI generators often produce hyper-balanced luminance distributions compared to raw sensor exposures.'
    },
    {
      id: 'contrast',
      name: 'Contrast',
      value: contrast,
      unit: 'std',
      icon: Sparkles,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      barColor: 'bg-blue-400',
      pct: Math.min(100, (contrast / 100) * 100),
      evalText: contrast > 60 ? 'High dynamic range' : contrast < 30 ? 'Low dynamic spread' : 'Moderate contrast',
      formula: 'Std intensity: sqrt((1/N) * ∑ (I_i - μ)²)',
      interviewNote: 'Measures dynamic range spread between shadows and highlights. Real camera photos exhibit higher contrast std.'
    },
    {
      id: 'sharpness',
      name: 'Sharpness / Blur',
      value: sharpness,
      unit: 'var(L)',
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      barColor: 'bg-emerald-400',
      pct: Math.min(100, (sharpness / 800) * 100),
      evalText: sharpness > 300 ? 'Crisp edges' : sharpness < 80 ? 'Soft focus' : 'Moderate focus',
      formula: 'Variance of Laplacian: Var(∇²I)',
      interviewNote: 'Calculates high-frequency edge gradients. Real photographs contain sharp sensor noise & lens focus edge gradients.'
    },
    {
      id: 'entropy',
      name: 'Shannon Entropy',
      value: entropy,
      unit: 'bits',
      icon: Activity,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      barColor: 'bg-purple-400',
      pct: Math.min(100, (entropy / 8) * 100),
      evalText: entropy > 7.3 ? 'High density' : entropy < 6.5 ? 'Low entropy' : 'Standard entropy',
      formula: 'H(X) = - ∑ p(i) * log2(p(i))',
      interviewNote: 'Measures pixel randomness and texture detail density. Natural surface textures and sensor noise yield higher entropy.'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricItems.map(item => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 shadow-xl flex flex-col justify-between hover:border-blue-500/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded border ${item.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">{item.name}</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] border border-[#334155] font-mono">
                  {item.evalText}
                </span>
              </div>

              <div className="bg-[#1E293B] p-3 rounded mb-3 flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs font-mono text-blue-400">{item.unit}</span>
              </div>

              <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full ${item.barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.max(5, item.pct)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] space-y-1">
              <p className="text-[10px] text-[#94A3B8] font-mono leading-tight">
                <strong className="text-white">Formula:</strong> {item.formula}
              </p>
              <p className="text-[10px] text-[#64748B] leading-normal">
                {item.interviewNote}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
