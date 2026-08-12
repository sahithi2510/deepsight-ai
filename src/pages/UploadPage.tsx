import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, FileImage, AlertCircle, Loader2, Sparkles, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { PredictionResult } from '../types';
import { ResultView } from '../components/ResultView';
import { generateSampleDataUrl, dataURLtoFile } from '../utils/sampleData';

export const UploadPage: React.FC = () => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Check if autoFile was passed from HomePage sample buttons
  useEffect(() => {
    if (location.state && location.state.autoFile) {
      handleFileSelected(location.state.autoFile);
    }
  }, [location.state]);

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds maximum 15MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setProgressStep(1);

    // Animated progress simulation while awaiting server response
    const step2Timer = setTimeout(() => setProgressStep(2), 250);
    const step3Timer = setTimeout(() => setProgressStep(3), 500);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post<PredictionResult>('/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProgressStep(4);
      setTimeout(() => {
        setResult(response.data);
        setLoading(false);
      }, 200);
    } catch (err: any) {
      console.error('Inference error:', err);
      setError(
        err.response?.data?.detail ||
        'Failed to process image. Make sure the backend microservice is online and model checkpoint is loaded.'
      );
      setLoading(false);
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
    }
  };

  const handleSampleClick = (type: 'real' | 'ai') => {
    const dataUrl = generateSampleDataUrl(type);
    const filename = type === 'real' ? 'sample_real_photograph.jpg' : 'sample_ai_pattern.jpg';
    const file = dataURLtoFile(dataUrl, filename);
    handleFileSelected(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleDeleteRecord = async (id: number) => {
    try {
      await axios.delete(`/api/history/${id}`);
      handleReset();
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  if (result) {
    return <ResultView result={result} onReset={handleReset} onDelete={handleDeleteRecord} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
          Image Authenticity & Grad-CAM Analysis
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Upload any photograph or AI render to generate classification predictions, Grad-CAM spatial heatmaps, and OpenCV DIP metrics.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-mono uppercase tracking-wider text-[10px]">Analysis Failed</p>
            <p className="text-xs text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Drop Zone / Preview Container */}
      <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-6 lg:p-8 shadow-2xl">
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#1E293B] hover:border-blue-500/80 rounded-xl p-10 text-center cursor-pointer transition-all duration-300 bg-[#0A0B0E] hover:bg-[#0A0B0E]/80 group space-y-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            />

            <div className="w-14 h-14 rounded bg-[#0F172A] border border-[#1E293B] flex items-center justify-center mx-auto text-blue-400 group-hover:scale-105 group-hover:border-blue-500/40 transition-all shadow-xl">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-white">
                Drag and drop your image here, or <span className="text-blue-400 underline">browse</span>
              </p>
              <p className="text-[11px] text-[#64748B]">
                Supports JPG, PNG, WEBP up to 15MB
              </p>
            </div>

            {/* Quick Sample Selector Pill Buttons */}
            <div className="pt-4 border-t border-[#1E293B] max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] text-[#64748B] font-mono block mb-2 uppercase tracking-wider">Or test immediately with built-in samples:</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleSampleClick('real')}
                  className="px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-emerald-400 font-mono text-xs uppercase tracking-wider border border-[#334155] transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Real Landscape Sample
                </button>
                <button
                  onClick={() => handleSampleClick('ai')}
                  className="px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-amber-400 font-mono text-xs uppercase tracking-wider border border-[#334155] transition-colors flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  AI Pattern Sample
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Selected Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#0A0B0E] border border-[#1E293B]">
              {previewUrl && (
                <div className="w-32 h-32 rounded overflow-hidden bg-[#0F172A] border border-[#1E293B] shrink-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <FileImage className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-mono text-white truncate max-w-xs">{selectedFile.name}</span>
                </div>
                <p className="text-xs font-mono text-[#94A3B8]">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB | Type: {selectedFile.type}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider shadow transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        Run DeepSight Analysis
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="px-4 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-mono text-xs uppercase tracking-wider border border-[#334155] transition-colors"
                  >
                    Choose Different Image
                  </button>
                </div>
              </div>
            </div>

            {/* Pipeline Step Progress Animation during loading */}
            {loading && (
              <div className="p-5 rounded-xl bg-[#0A0B0E] border border-[#1E293B] space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono text-blue-400">
                  <span>Executing Pipeline...</span>
                  <span>Step {progressStep} / 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div
                    className={`p-2 rounded border transition-all ${
                      progressStep >= 1
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-[#0F172A] text-[#64748B] border-[#1E293B]'
                    }`}
                  >
                    1. RGB Tensor (224x224)
                  </div>
                  <div
                    className={`p-2 rounded border transition-all ${
                      progressStep >= 2
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-[#0F172A] text-[#64748B] border-[#1E293B]'
                    }`}
                  >
                    2. MobileNetV3 Pass
                  </div>
                  <div
                    className={`p-2 rounded border transition-all ${
                      progressStep >= 3
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-[#0F172A] text-[#64748B] border-[#1E293B]'
                    }`}
                  >
                    3. Grad-CAM Backprop
                  </div>
                  <div
                    className={`p-2 rounded border transition-all ${
                      progressStep >= 4
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-[#0F172A] text-[#64748B] border-[#1E293B]'
                    }`}
                  >
                    4. OpenCV DIP & Hist
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
