import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, History, BookOpen, Upload, Activity } from 'lucide-react';
import axios from 'axios';
import { HealthStatus } from '../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get<HealthStatus>('/api/health');
        setHealth(res.data);
      } catch (err) {
        setHealth({ status: 'offline', model_loaded: false, device: 'cpu' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Geometric Badge */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-white text-sm shadow-md group-hover:bg-blue-500 transition-colors">
            DS
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-1.5">
              DEEPSIGHT <span className="text-blue-500 font-light">AI</span>
            </h1>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 ${
              isActive('/')
                ? 'bg-[#1E293B] text-blue-400 border border-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Overview
          </Link>
          <Link
            to="/analyze"
            className={`px-3.5 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 ${
              isActive('/analyze')
                ? 'bg-[#1E293B] text-blue-400 border border-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Analyze
          </Link>
          <Link
            to="/history"
            className={`px-3.5 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 ${
              isActive('/history')
                ? 'bg-[#1E293B] text-blue-400 border border-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </Link>
          <Link
            to="/docs"
            className={`px-3.5 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 ${
              isActive('/docs')
                ? 'bg-[#1E293B] text-blue-400 border border-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Interview Guide
          </Link>
        </nav>

        {/* Model Status Bar & Action CTA */}
        <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-[#94A3B8]">
          <span className="hidden lg:inline">Model: <strong className="text-white">MobileNetV3_S</strong></span>
          <span className="flex items-center gap-1.5">
            Status:{' '}
            {health?.model_loaded ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ● Online
              </span>
            ) : (
              <span className="text-amber-400">● Init</span>
            )}
          </span>
          <span className="hidden xl:inline text-[#64748B]">Build: <span className="text-[#94A3B8]">1.2.0-RC</span></span>

          <Link
            to="/analyze"
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run Inference</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
