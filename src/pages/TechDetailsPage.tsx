import React from 'react';
import { BookOpen, Cpu, Flame, BarChart3, Server, CheckCircle } from 'lucide-react';

export const TechDetailsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Technical Architecture & Mathematical Foundations
        </h1>
        <p className="text-xs text-[#94A3B8]">
          In-depth explanation of deep learning models, Grad-CAM backprop, and computer vision formulas used in DeepSight AI.
        </p>
      </div>

      {/* 1. MobileNetV3 Neural Network */}
      <section className="p-6 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider font-bold">
          <Cpu className="w-4 h-4 text-blue-400" />
          1. Model Architecture & Transfer Learning
        </div>

        <div className="text-xs text-[#E2E8F0] space-y-3 leading-relaxed font-sans">
          <p>
            DeepSight AI uses <strong>MobileNetV3 Small</strong> fine-tuned for binary image classification (0 = Real Photograph, 1 = AI-Generated).
          </p>

          <div className="p-4 rounded bg-[#0A0B0E] font-mono text-[11px] text-blue-300 border border-[#1E293B]">
            def get_mobilenetv3_model(num_classes=2):<br />
            &nbsp;&nbsp;model = models.mobilenet_v3_small(weights=None)<br />
            &nbsp;&nbsp;in_features = model.classifier[-1].in_features<br />
            &nbsp;&nbsp;model.classifier[-1] = nn.Linear(in_features, num_classes)<br />
            &nbsp;&nbsp;return model
          </div>

          <p className="text-[#94A3B8]">
            <strong>Preprocessing Pipeline:</strong> Images are converted to RGB, resized to 224x224, converted to PyTorch Tensors, and normalized with ImageNet mean/std:
          </p>
          <ul className="list-disc list-inside text-[#94A3B8] font-mono text-[11px] space-y-1">
            <li>Mean: [0.485, 0.456, 0.406]</li>
            <li>Std: [0.229, 0.224, 0.225]</li>
          </ul>
        </div>
      </section>

      {/* 2. Grad-CAM Backprop Mathematics */}
      <section className="p-6 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
          <Flame className="w-4 h-4 text-amber-400" />
          2. Grad-CAM (Gradient-Weighted Class Activation Mapping)
        </div>

        <div className="text-xs text-[#E2E8F0] space-y-3 leading-relaxed">
          <p className="text-[#94A3B8]">
            Grad-CAM uses gradients of target class score $y^c$ flowing into the final convolutional layer of the network ($A^k$) to produce a coarse localization map highlighting important activation regions.
          </p>

          <div className="p-4 rounded bg-[#0A0B0E] font-mono text-[11px] text-amber-300 border border-[#1E293B] space-y-2">
            <p>1. Neuron Importance Weights: α_k^c = (1/Z) * ∑_i ∑_j (∂y^c / ∂A^k_ij)</p>
            <p>2. Weighted Feature Map Combination: L_Grad-CAM^c = ReLU( ∑_k α_k^c * A^k )</p>
          </div>

          <p className="text-[#94A3B8]">
            <strong>Implementation Hooks:</strong> Forward hooks capture feature activations A^k, while backward hooks capture gradients d(y^c) / d(A^k).
            The raw heatmap is colorized with OpenCV <code className="text-blue-400 font-mono">cv2.COLORMAP_JET</code> and blended with <code className="text-blue-400 font-mono">cv2.addWeighted(original, 0.6, heatmap, 0.4, 0)</code>.
          </p>
        </div>
      </section>

      {/* 3. Digital Image Processing Formulas */}
      <section className="p-6 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          3. OpenCV Digital Image Processing (DIP) Metrics
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded bg-[#0A0B0E] border border-[#1E293B] space-y-1">
            <h4 className="font-mono text-xs uppercase text-white">Brightness</h4>
            <p className="font-mono text-[11px] text-amber-400">Mean Intensity: (1/N) * ∑ I_i</p>
            <p className="text-[#94A3B8] text-[11px]">Evaluates overall luminosity spread.</p>
          </div>

          <div className="p-4 rounded bg-[#0A0B0E] border border-[#1E293B] space-y-1">
            <h4 className="font-mono text-xs uppercase text-white">Contrast</h4>
            <p className="font-mono text-[11px] text-blue-400">Std Intensity: sqrt( (1/N) * ∑ (I_i - μ)² )</p>
            <p className="text-[#94A3B8] text-[11px]">Evaluates dynamic range spread between shadows and highlights.</p>
          </div>

          <div className="p-4 rounded bg-[#0A0B0E] border border-[#1E293B] space-y-1">
            <h4 className="font-mono text-xs uppercase text-white">Laplacian Sharpness</h4>
            <p className="font-mono text-[11px] text-emerald-400">Var(∇²I) where ∇²I = ∂²I/∂x² + ∂²I/∂y²</p>
            <p className="text-[#94A3B8] text-[11px]">Evaluates high-frequency sensor noise and edge focus variance.</p>
          </div>

          <div className="p-4 rounded bg-[#0A0B0E] border border-[#1E293B] space-y-1">
            <h4 className="font-mono text-xs uppercase text-white">Shannon Entropy</h4>
            <p className="font-mono text-[11px] text-purple-400">H(X) = - ∑ p(i) * log2(p(i))</p>
            <p className="text-[#94A3B8] text-[11px]">Evaluates texture information density and noise randomness.</p>
          </div>
        </div>
      </section>

      {/* 4. Full-Stack Gateway Architecture */}
      <section className="p-6 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider font-bold">
          <Server className="w-4 h-4 text-purple-400" />
          4. Gateway & Microservice Architecture
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Node.js Express serves on public port 3000, serving the Vite React SPA assets and handling <code className="text-blue-400 font-mono">/api/*</code> endpoints directly. Express handles image ingestion, computes DIP metrics, performs deep spatial attention visual explainability, and persists history records.
        </p>
      </section>
    </div>
  );
};
