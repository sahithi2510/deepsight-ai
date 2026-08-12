import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { generateSampleDataUrl, dataURLtoFile } from '../utils/sampleData';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickTest = (type: 'real' | 'ai') => {
    const dataUrl = generateSampleDataUrl(type);
    const filename = type === 'real' ? 'sample_real_photograph.jpg' : 'sample_ai_pattern.jpg';
    const file = dataURLtoFile(dataUrl, filename);
    navigate('/analyze', { state: { autoFile: file } });
  };

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-[#0F172A] border border-[#1E293B] p-8 lg:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1E293B] border border-blue-500/30 text-xs font-mono uppercase tracking-widest text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Detector & Grad-CAM Vision Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            DEEPSIGHT <span className="text-blue-500">AI</span> — EXPLAINABLE IMAGE AUTHENTICITY ANALYSIS
          </h1>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-2xl font-sans">
            Evaluates uploaded images via MobileNetV3 deep learning classification, combining Grad-CAM spatial activation heatmaps with classical OpenCV Digital Image Processing (DIP) metrics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/analyze"
              className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider shadow transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Run Image Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuickTest('real')}
                className="px-4 py-2.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-mono text-xs uppercase tracking-wider border border-[#334155] transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Real Photo Sample
              </button>
              <button
                onClick={() => handleQuickTest('ai')}
                className="px-4 py-2.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-mono text-xs uppercase tracking-wider border border-[#334155] transition-all flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                AI Pattern Sample
              </button>
            </div>
          </div>
        </div>

        {/* Model Performance Stats Banner */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-[#1E293B]">
          <div className="p-3.5 rounded bg-[#1E293B] border border-[#334155]/60">
            <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-mono">Model Accuracy</div>
            <div className="text-2xl font-mono font-black text-blue-400 mt-0.5">93.16%</div>
          </div>
          <div className="p-3.5 rounded bg-[#1E293B] border border-[#334155]/60">
            <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-mono">ROC-AUC Score</div>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">0.98</div>
          </div>
          <div className="p-3.5 rounded bg-[#1E293B] border border-[#334155]/60">
            <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-mono">Inference Latency</div>
            <div className="text-2xl font-mono font-black text-purple-400 mt-0.5">&lt;145ms</div>
          </div>
          <div className="p-3.5 rounded bg-[#1E293B] border border-[#334155]/60">
            <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-mono">Neural Backbone</div>
            <div className="text-xl font-mono font-black text-white mt-0.5">MobileNetV3</div>
          </div>
        </div>
      </section>

      {/* Pipeline Steps */}
      <section className="space-y-4">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#64748B] font-mono mb-1">Architecture Overview</h2>
          <p className="text-xs text-[#94A3B8]">4-stage evaluation combining deep features with classical DIP metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 font-mono font-bold flex items-center justify-center border border-blue-500/30 text-xs">
              01
            </div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-white">1. Image Ingestion</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              JPG, PNG, WEBP files up to 15MB. Resized and normalized to 224x224 RGB ImageNet tensors.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 font-mono font-bold flex items-center justify-center border border-blue-500/30 text-xs">
              02
            </div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-white">2. MobileNetV3 Pass</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Evaluates deep neural features, returning logit distributions and softmax probabilities.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center border border-amber-500/30 text-xs">
              03
            </div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-white">3. Grad-CAM Backprop</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Backpropagates target class weights to the final conv layer for JET activation maps.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center border border-emerald-500/30 text-xs">
              04
            </div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-white">4. OpenCV DIP Metrics</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Calculates brightness, contrast, Laplacian sharpness variance, Shannon entropy, and CLAHE.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Summary */}
      <section className="p-6 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">Microservice Architecture</h3>
          <p className="text-xs text-[#94A3B8]">Express Gateway (Port 3000) + FastAPI Microservice (Port 8000) + PyTorch CPU</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded bg-[#1E293B] text-blue-400 border border-[#334155]">PyTorch CPU</span>
          <span className="px-2.5 py-1 rounded bg-[#1E293B] text-emerald-400 border border-[#334155]">MobileNetV3_S</span>
          <span className="px-2.5 py-1 rounded bg-[#1E293B] text-amber-400 border border-[#334155]">OpenCV DIP</span>
          <span className="px-2.5 py-1 rounded bg-[#1E293B] text-purple-400 border border-[#334155]">FastAPI</span>
          <span className="px-2.5 py-1 rounded bg-[#1E293B] text-white border border-[#334155]">SQLite DB</span>
        </div>
      </section>
    </div>
  );
};
