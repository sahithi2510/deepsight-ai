import React, { useEffect, useState } from 'react';
import { History, Search, Trash2, Eye, ShieldCheck, AlertTriangle, Clock, Calendar, Filter, X } from 'lucide-react';
import axios from 'axios';
import { HistoryItem, PredictionResult } from '../types';
import { ResultView } from '../components/ResultView';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'All' | 'Real Photograph' | 'AI-Generated'>('All');
  const [selectedDetail, setSelectedDetail] = useState<PredictionResult | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get<HistoryItem[]>('/api/history');
      setHistory(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError('Failed to load prediction history from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/history/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedDetail?.id === id) {
        setSelectedDetail(null);
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const filteredItems = history.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || item.prediction === filterType;
    return matchesSearch && matchesFilter;
  });

  const openDetail = (item: HistoryItem) => {
    let parsedHist: any = item.color_histogram;
    if (typeof parsedHist === 'string') {
      try {
        parsedHist = JSON.parse(parsedHist);
      } catch {
        parsedHist = { bins: [], red: [], green: [], blue: [] };
      }
    }
    if (!parsedHist || typeof parsedHist !== 'object') {
      parsedHist = { bins: [], red: [], green: [], blue: [] };
    }

    const resultFormat: PredictionResult = {
      id: item.id,
      filename: item.filename || 'unknown.jpg',
      prediction: item.prediction || 'Real Photograph',
      prediction_label: item.prediction_label ?? 0,
      confidence: item.confidence ?? 0,
      authenticity_score: item.authenticity_score ?? 0,
      explanation: item.explanation || '',
      prediction_time_ms: item.prediction_time_ms ?? 0,
      dip_metrics: {
        brightness: item.brightness ?? 0,
        contrast: item.contrast ?? 0,
        sharpness: item.sharpness ?? 0,
        entropy: item.entropy ?? 0,
        color_histogram: parsedHist
      },
      visualizations: {
        original: item.original_b64 || '',
        heatmap: item.heatmap_b64 || '',
        overlay: item.overlay_b64 || '',
        clahe: item.clahe_b64 || ''
      },
      created_at: item.created_at
    };
    setSelectedDetail(resultFormat);
  };

  if (selectedDetail) {
    return (
      <div className="space-y-4 py-4">
        <button
          onClick={() => setSelectedDetail(null)}
          className="px-3.5 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-mono text-xs uppercase tracking-wider border border-[#334155] transition-colors flex items-center gap-2"
        >
          <X className="w-3.5 h-3.5" />
          Back to History Table
        </button>
        <ResultView
          result={selectedDetail}
          onReset={() => setSelectedDetail(null)}
          onDelete={(id) => handleDelete(id)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
            <History className="w-5 h-5 text-blue-400" />
            Prediction Database Logs
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            SQLite persistent records of prior model classifications, Grad-CAM maps, and DIP metrics.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="px-3.5 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white font-mono text-xs uppercase tracking-wider border border-[#334155] transition-colors shrink-0"
        >
          Refresh Records
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-[#0F172A] rounded-xl border border-[#1E293B] shadow-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0B0E] border border-[#1E293B] rounded pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        {/* Classification Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['All', 'Real Photograph', 'AI-Generated'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-blue-600 text-white border border-blue-400/50 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* History Grid / Table */}
      {loading ? (
        <div className="p-12 text-center text-[#94A3B8] font-mono text-xs">Loading database records...</div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">{error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#0F172A] rounded-xl border border-[#1E293B] space-y-3">
          <History className="w-8 h-8 text-[#64748B] mx-auto" />
          <p className="text-xs font-mono uppercase text-[#94A3B8]">No prediction history recorded</p>
          <p className="text-xs text-[#64748B]">Analyze an image to save your first prediction entry to SQLite.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const isReal = item.prediction === 'Real Photograph';
            return (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="group cursor-pointer rounded-xl bg-[#0F172A] border border-[#1E293B] hover:border-blue-500/50 p-4 transition-all duration-300 shadow-xl flex flex-col justify-between hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${
                      isReal
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {item.prediction}
                  </span>
                </div>

                {/* Thumbnail & File Details */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded overflow-hidden bg-[#0A0B0E] border border-[#1E293B] shrink-0">
                    {(() => {
                      const imgStr = item.overlay_b64 || item.original_b64 || '';
                      const srcUrl = imgStr.startsWith('data:') ? imgStr : `data:image/png;base64,${imgStr}`;
                      return (
                        <img
                          src={srcUrl}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      );
                    })()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-mono text-white truncate">{item.filename}</h4>
                    <p className="text-[10px] font-mono text-[#94A3B8] mt-1">
                      Confidence: <strong className="text-white">{item.confidence}%</strong>
                    </p>
                    <p className="text-[10px] font-mono text-[#94A3B8]">
                      Authenticity: <strong className="text-white">{item.authenticity_score}%</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Latency: {item.prediction_time_ms}ms</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-1 rounded bg-[#1E293B] hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
