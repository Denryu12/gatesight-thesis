import { useEffect, useRef, useState } from 'react';
import type { VehicleType } from '../types';

interface VehicleScanProps {
  onComplete: () => void;
  onProgress?: (pct: number) => void;
}

type ScanStage = 'idle' | 'scanning' | 'complete';

const stages = [
  { key: 'front', label: 'Front', icon: 'front' },
  { key: 'left', label: 'Left Side', icon: 'left' },
  { key: 'rear', label: 'Rear', icon: 'rear' },
  { key: 'right', label: 'Right Side', icon: 'right' },
  { key: 'plate', label: 'Plate', icon: 'plate' },
];

export function VehicleScanSim({ onComplete, onProgress }: VehicleScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<ScanStage>('idle');
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [completeness, setCompleteness] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const tickRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      tickRef.current = frame;
      drawScene(frame);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Start scan
  useEffect(() => {
    if (stage !== 'scanning') return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < stages.length) {
        const stageKey = stages[idx].key;
        setCompletedStages((prev) => new Set([...prev, stageKey]));
        const pct = Math.round(((idx + 1) / stages.length) * 100);
        setCompleteness(pct);
        onProgress?.(pct);
        setCurrentStageIdx(idx);
        idx++;
      } else {
        setStage('complete');
        setCompleteness(100);
        clearInterval(interval);
      }
    }, 1400);
    return () => clearInterval(interval);
  }, [stage]);

  const drawScene = (frame: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const t = frame * 0.02;

    // Background — outdoor/garage
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#3a4050');
    bgGrad.addColorStop(1, '#2a2a35');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = '#33333d';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    // Grid lines on ground for depth
    ctx.strokeStyle = '#3a3a44';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = h * 0.7 + i * (h * 0.3 / 7);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vehicle silhouette (simplified car shape) — rotating perspective
    const cx = w / 2;
    const cy = h * 0.55;
    const angle = stage === 'scanning' ? (currentStageIdx / stages.length) * Math.PI * 2 : 0;
    const perspective = Math.sin(t) * 0.3;

    ctx.save();
    ctx.translate(cx, cy);

    // Car body
    ctx.fillStyle = '#5a6a78';
    ctx.beginPath();
    ctx.moveTo(-50, 10);
    ctx.lineTo(-45, -15);
    ctx.lineTo(-20, -25);
    ctx.lineTo(20, -25);
    ctx.lineTo(45, -15);
    ctx.lineTo(50, 10);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#2a3040';
    ctx.beginPath();
    ctx.moveTo(-35, -12);
    ctx.lineTo(-18, -22);
    ctx.lineTo(18, -22);
    ctx.lineTo(35, -12);
    ctx.lineTo(30, -5);
    ctx.lineTo(-30, -5);
    ctx.closePath();
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1a1a1f';
    ctx.beginPath();
    ctx.arc(-30, 12, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(30, 12, 8, 0, Math.PI * 2);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#ffe082';
    ctx.beginPath();
    ctx.arc(-42, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(42, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Scanning effect — moving scan line
    if (stage === 'scanning') {
      const scanY = (Math.sin(t * 2) * 0.5 + 0.5) * h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrad.addColorStop(0, 'rgba(34, 197, 94, 0)');
      scanGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.3)');
      scanGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 20, w, 40);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // Corner brackets
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2;
      const m = 20;
      const bl = 25;
      // Top-left
      ctx.beginPath(); ctx.moveTo(m, m + bl); ctx.lineTo(m, m); ctx.lineTo(m + bl, m); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(w - m - bl, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + bl); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(m, h - m - bl); ctx.lineTo(m, h - m); ctx.lineTo(m + bl, h - m); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(w - m - bl, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - bl); ctx.stroke();
    }

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SIMULATED CAMERA FEED', 8, 18);

    if (stage === 'scanning' && currentStageIdx >= 0) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`VIEW: ${stages[currentStageIdx]?.label?.toUpperCase()}`, 8, 34);
    }
  };

  const handleStart = () => {
    setStage('scanning');
    setCompletedStages(new Set());
    setCompleteness(0);
    setCurrentStageIdx(0);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg bg-black">
        <canvas ref={canvasRef} width={400} height={250} className="w-full h-auto" />

        {stage === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <button
              onClick={handleStart}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Start Vehicle Scan
            </button>
          </div>
        )}

        {stage === 'complete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-3">
            <div className="text-green-400 text-sm font-mono font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Scan Complete
            </div>
            <button
              onClick={handleComplete}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Complete Scan
            </button>
          </div>
        )}

        {stage === 'scanning' && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[9px] font-mono text-green-400 bg-black/50 px-1.5 py-0.5 rounded">
              SCANNING... {completeness}%
            </span>
          </div>
        )}
      </div>

      {/* Scan progress checklist */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Scan Checklist</div>
        {stages.map((s) => {
          const done = completedStages.has(s.key);
          const active = stage === 'scanning' && currentStageIdx === stages.indexOf(s);
          return (
            <div key={s.key} className="flex items-center gap-2 text-sm">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                done ? 'bg-green-700 text-white' : active ? 'bg-green-700/30 text-green-400 animate-pulse' : 'bg-gray-700 text-gray-500'
              }`}>
                {done ? '✓' : active ? '...' : ''}
              </div>
              <span className={done ? 'text-gray-200' : active ? 'text-green-400' : 'text-gray-500'}>
                {s.label}
              </span>
            </div>
          );
        })}
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">Scan Completeness</span>
            <span className="font-mono font-bold text-green-400">{completeness}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
