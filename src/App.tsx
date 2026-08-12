import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import { TechDetailsPage } from './pages/TechDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0A0B0E] text-[#E2E8F0] flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
        {/* Navigation Header */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/docs" element={<TechDetailsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1E293B] bg-[#0F172A] py-3 text-[10px] text-[#475569] font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>DEEPSIGHT AI — MOBILENETV3_S + GRAD-CAM + OPENCV DIP</div>
            <div className="flex items-center gap-4 text-[#64748B]">
              <span>MODEL ACCURACY: <strong className="text-[#94A3B8]">93.16%</strong></span>
              <span>•</span>
              <span>ROC-AUC: <strong className="text-[#94A3B8]">0.98</strong></span>
              <span>•</span>
              <span>BUILD: <strong className="text-blue-400">1.2.0-RC</strong></span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
