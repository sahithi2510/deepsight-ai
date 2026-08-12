export interface ColorHistogram {
  bins: number[];
  red: number[];
  green: number[];
  blue: number[];
}

export interface DIPMetrics {
  brightness: number;
  contrast: number;
  sharpness: number;
  entropy: number;
  color_histogram: ColorHistogram;
}

export interface Visualizations {
  original: string;
  heatmap: string;
  overlay: string;
  clahe: string;
}

export interface PredictionResult {
  id: number;
  filename: string;
  prediction: "Real Photograph" | "AI-Generated";
  prediction_label: number;
  confidence: number;
  authenticity_score: number;
  explanation: string;
  prediction_time_ms: number;
  dip_metrics: DIPMetrics;
  visualizations: Visualizations;
  created_at?: string;
}

export interface HistoryItem {
  id: number;
  filename: string;
  prediction: "Real Photograph" | "AI-Generated";
  prediction_label: number;
  confidence: number;
  authenticity_score: number;
  explanation: string;
  prediction_time_ms: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  entropy: number;
  color_histogram: ColorHistogram;
  original_b64: string;
  heatmap_b64: string;
  overlay_b64: string;
  clahe_b64: string;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  device: string;
}
