import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, RefreshCw, Download, Trash2, Cpu, BarChart3, Info } from 'lucide-react';
import { PredictionResult } from '../types';
import { GradCamViewer } from './GradCamViewer';
import { DipMetricsCard } from './DipMetricsCard';
import { HistogramChart } from './HistogramChart';

interface ResultViewProps {
  result: PredictionResult;
  onReset: () => void;
  onDelete?: (id: number) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset, onDelete }) => {
  const isReal = result.prediction === 'Real Photograph';

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `deepsight_analysis_${result.id}_${result.filename}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner & Hero Prediction Card */}
      <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3 text-xs font-mono text-[#94A3B8]">
              <span>File: <strong className="text-white">{result.filename}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-400">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {result.prediction_time_ms}ms
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded border shadow-lg flex items-center justify-center ${
                  isReal
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-500 border-red-500/30'
                }`}
              >
                {isReal ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#94A3B8] mb-1 font-mono">
                  Classification Result
                </h3>
                <div className={`text-3xl sm:text-4xl font-bold tracking-tight uppercase ${isReal ? 'text-emerald-400' : 'text-red-500'}`}>
                  {result.prediction}
                </div>
              </div>
            </div>

            {/* Grad-CAM Plain English Explanation Banner */}
            <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 leading-relaxed italic flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-400 not-italic font-mono uppercase tracking-wider text-[10px]">Grad-CAM Insight: </strong>
                '{result.explanation}'
              </div>
            </div>
          </div>

          {/* Confidence & Authenticity Score Display */}
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-3 w-full lg:w-72 shrink-0">
            {/* Confidence Card */}
            <div className="p-4 rounded bg-[#1E293B] border border-[#334155]/60 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-2">
                <span>Model Confidence</span>
                <span className="text-blue-400 font-bold">{result.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    isReal ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {/* Authenticity Score Card */}
            <div className="p-4 rounded bg-[#1E293B] border border-[#334155]/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] block font-mono">Authenticity Index</span>
                <span className="text-[10px] text-[#64748B] font-mono">0 (AI) - 100 (REAL)</span>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-mono font-black ${isReal ? 'text-emerald-400' : 'text-red-500'}`}>
                  {result.authenticity_score}
                </span>
                <span className="text-xl text-blue-500 font-mono">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-6 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Another Image
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadJson}
              className="px-3.5 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-mono text-xs uppercase tracking-wider border border-[#334155] transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Export JSON
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(result.id)}
                className="px-3.5 py-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-xs uppercase tracking-wider border border-red-500/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Visual Explainability (Grad-CAM & CLAHE) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#64748B] font-mono mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Grad-CAM Spatial Activation Analysis
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Feature map weights extracted from MobileNetV3 convolutional backbone
          </p>
        </div>

        <GradCamViewer visualizations={result.visualizations} />
      </div>

      {/* Section 2: Digital Image Processing (DIP) Metrics */}
      {result?.dip_metrics && (
        <div className="space-y-3">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#64748B] font-mono mb-1 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              Digital Image Processing (DIP) Analysis
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Classical computer vision features computed via OpenCV & NumPy
            </p>
          </div>

          <DipMetricsCard metrics={result.dip_metrics} />
        </div>
      )}

      {/* Section 3: Color Histogram Analysis */}
      <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#64748B] font-mono mb-1">Color Frequency Distribution</h3>
          <p className="text-xs text-[#94A3B8]">
            32-Bin RGB pixel intensity spectrum detecting artificial color clustering.
          </p>
        </div>

        <HistogramChart histogram={result?.dip_metrics?.color_histogram || { bins: [], red: [], green: [], blue: [] }} />
      </div>
    </div>
  );
};
