// Pre-generated data URLs for immediate testing in the UI
export interface SampleImage {
  id: string;
  name: string;
  type: 'Real Photograph' | 'AI-Generated';
  description: string;
  dataUrl: string;
}

// Generate simple canvas sample data URLs dynamically in browser if needed, or provide clean default base64 samples
export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-real-1',
    name: 'Camera Landscape (Real)',
    type: 'Real Photograph',
    description: 'Natural optical lighting with organic sensor noise and high Laplacian edge variance.',
    dataUrl: '' // Will be generated on demand via Canvas in UI
  },
  {
    id: 'sample-ai-1',
    name: 'Synthetic Pattern (AI)',
    type: 'AI-Generated',
    description: 'Hyper-balanced gradient texture with geometric high-frequency grid frequencies.',
    dataUrl: ''
  }
];

export function generateSampleDataUrl(type: 'real' | 'ai'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'real') {
    // Draw sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 300, 200);

    // Draw Sun
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(220, 60, 28, 0, Math.PI * 2);
    ctx.fill();

    // Draw Hills
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(100, 300, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(240, 320, 160, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle sensor noise
    const imgData = ctx.getImageData(0, 0, 300, 300);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  } else {
    // AI pattern - checkerboard / synthetic grid
    const size = 20;
    for (let x = 0; x < 300; x += size) {
      for (let y = 0; y < 300; y += size) {
        if (((x / size) + (y / size)) % 2 === 0) {
          ctx.fillStyle = '#ec4899';
        } else {
          ctx.fillStyle = '#06b6d4';
        }
        ctx.fillRect(x, y, size, size);
      }
    }
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
