import React, { useState } from 'react';
import { Eye, Flame, Layers, SunMedium, Maximize2, X } from 'lucide-react';
import { Visualizations } from '../types';

interface GradCamViewerProps {
  visualizations: Visualizations;
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({ visualizations }) => {
  const [selectedView, setSelectedView] = useState<'all' | 'original' | 'heatmap' | 'overlay' | 'clahe'>('all');
  const [modalImage, setModalImage] = useState<{ title: string; src: string; desc: string } | null>(null);

  const formatImgSrc = (srcStr: string | undefined): string => {
    if (!srcStr) return '';
    if (srcStr.startsWith('data:')) return srcStr;
    return `data:image/png;base64,${srcStr}`;
  };

  const viewItems = [
    {
      id: 'original',
      title: '1. Source Image',
      icon: Eye,
      color: 'text-slate-300',
      badge: 'Unmodified RGB',
      badgeBg: 'bg-[#1E293B] text-[#94A3B8] border-[#334155]',
      src: formatImgSrc(visualizations.original),
      desc: 'Raw pixel input passed directly into MobileNetV3 evaluation pipeline.'
    },
    {
      id: 'heatmap',
      title: '2. Grad-CAM Activation',
      icon: Flame,
      color: 'text-amber-400',
      badge: 'JET_COLORMAP',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      src: formatImgSrc(visualizations.heatmap),
      desc: 'Pure JET colormap of class activation weights. Red/yellow indicates peak neural attention.'
    },
    {
      id: 'overlay',
      title: '3. Analysis Overlay',
      icon: Layers,
      color: 'text-blue-400',
      badge: '0.6 OPACITY BLEND',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      src: formatImgSrc(visualizations.overlay),
      desc: 'Original photo visible through semi-transparent activation highlights using cv2.addWeighted.'
    },
    {
      id: 'clahe',
      title: '4. CLAHE Equalized',
      icon: SunMedium,
      color: 'text-purple-400',
      badge: 'DIP Micro-Contrast',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      src: formatImgSrc(visualizations.clahe),
      desc: 'Contrast Limited Adaptive Histogram Equalization exposing subtle grid artifacts and light transitions.'
    }
  ];

  const filteredItems = selectedView === 'all'
    ? viewItems
    : viewItems.filter(item => item.id === selectedView);

  return (
    <div className="space-y-4">
      {/* View Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0F172A] rounded-xl border border-[#1E293B]">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedView('all')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedView === 'all'
                ? 'bg-blue-600 text-white border border-blue-400/50 shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Side-by-Side (4 Views)
          </button>
          {viewItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedView === item.id
                    ? 'bg-blue-600 text-white border border-blue-400/50 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                {item.title.split('. ')[1]}
              </button>
            );
          })}
        </div>

        <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono hidden lg:inline">
          Click image to inspect
        </span>
      </div>

      {/* Cards Grid */}
      <div
        className={`grid gap-4 ${
          selectedView === 'all'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 max-w-2xl mx-auto'
        }`}
      >
        {filteredItems.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setModalImage({ title: item.title, src: item.src, desc: item.desc })}
              className="group cursor-pointer rounded-xl bg-[#0F172A] border border-[#1E293B] hover:border-blue-500/50 p-3 transition-all duration-300 shadow-xl flex flex-col justify-between hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#E2E8F0]">{item.title}</h4>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                </div>

                <div className="relative aspect-square w-full rounded bg-[#0A0B0E] border border-[#1E293B] overflow-hidden group-hover:scale-[1.01] transition-transform duration-300">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded bg-[#0F172A] text-blue-400 text-xs font-mono border border-blue-500/40 flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Expand View
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-[#94A3B8] leading-relaxed font-sans">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Image Zoom Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0B0E]/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 max-w-3xl w-full max-h-[90vh] flex flex-col gap-3 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">{modalImage.title}</h3>
              <button
                onClick={() => setModalImage(null)}
                className="p-1 rounded bg-[#1E293B] text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 min-h-0 bg-[#0A0B0E] rounded border border-[#1E293B] flex items-center justify-center p-2">
              <img
                src={modalImage.src}
                alt={modalImage.title}
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>

            <p className="text-xs text-[#E2E8F0] bg-[#1E293B] p-3 rounded border border-[#334155]/60">
              {modalImage.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
