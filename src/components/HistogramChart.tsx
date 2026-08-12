import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { ColorHistogram } from '../types';

interface HistogramChartProps {
  histogram: ColorHistogram;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ histogram }) => {
  if (!histogram || !histogram.bins || !Array.isArray(histogram.bins) || histogram.bins.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[#64748B] font-mono text-xs">
        Histogram data unavailable for this image
      </div>
    );
  }

  // Transform into Recharts dataset
  const chartData = histogram.bins.map((binCenter, idx) => ({
    bin: `${binCenter}`,
    Red: (Array.isArray(histogram.red) && histogram.red[idx]) || 0,
    Green: (Array.isArray(histogram.green) && histogram.green[idx]) || 0,
    Blue: (Array.isArray(histogram.blue) && histogram.blue[idx]) || 0
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.8} />
          <XAxis
            dataKey="bin"
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            label={{ value: 'PIXEL INTENSITY BINS (0 - 255)', position: 'insideBottom', offset: -12, fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            unit="%"
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#1E293B',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#E2E8F0'
            }}
            formatter={(value: any) => [`${value}%`, 'Frequency']}
            labelFormatter={(label) => `Bin Center: ~${label}`}
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8', paddingTop: '0px' }}
          />
          <Bar dataKey="Red" fill="#EF4444" radius={[2, 2, 0, 0]} opacity={0.85} />
          <Bar dataKey="Green" fill="#10B981" radius={[2, 2, 0, 0]} opacity={0.85} />
          <Bar dataKey="Blue" fill="#3B82F6" radius={[2, 2, 0, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
