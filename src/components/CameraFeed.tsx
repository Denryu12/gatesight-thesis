import { useEffect, useRef, useState } from 'react';
import type { WeatherCondition, CameraStatus, LiveVehicleDetection } from '../types';

interface CameraFeedProps {
  cameraId: string;
  cameraName: string;
  gate: string;
  status: CameraStatus;
  weather: WeatherCondition;
  detections?: LiveVehicleDetection[];
  showOverlays?: boolean;
  detectionLine?: boolean;
  className?: string;
  rounded?: string;
}

export function CameraFeed({
  cameraName,
  gate,
  status,
  weather,
  detections = [],
  showOverlays = true,
  detectionLine = false,
  className = '',
  rounded = 'rounded-lg',
}: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      setTick(frame);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const t = tick * 0.01;

    // Base background — road scene
    if (status === 'OFFLINE') {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO SIGNAL', w / 2, h / 2);
      return;
    }

    // Time-of-day base
    const isNight = weather === 'NIGHT_FOG' || weather === 'NIGHT';
    const isFog = weather === 'FOG' || weather === 'NIGHT_FOG';
    const isRain = weather === 'RAIN' || weather === 'HEAVY_RAIN';
    const isHeavyRain = weather === 'HEAVY_RAIN';
    const isRecFailure = weather === 'RECOGNITION_FAILURE';

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    if (isNight) {
      skyGrad.addColorStop(0, '#0a1018');
      skyGrad.addColorStop(1, '#1a2030');
    } else if (isFog) {
      skyGrad.addColorStop(0, '#6a7080');
      skyGrad.addColorStop(1, '#808890');
    } else if (isRain) {
      skyGrad.addColorStop(0, '#3a4050');
      skyGrad.addColorStop(1, '#4a505a');
    } else {
      skyGrad.addColorStop(0, '#5a6a7a');
      skyGrad.addColorStop(1, '#7a8a9a');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.5);

    // Ground/road
    const roadGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
    if (isNight) {
      roadGrad.addColorStop(0, '#1a1a20');
      roadGrad.addColorStop(1, '#0a0a10');
    } else {
      roadGrad.addColorStop(0, '#3a3a40');
      roadGrad.addColorStop(1, '#2a2a30');
    }
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, h * 0.5, w, h * 0.5);

    // Road perspective lines
    ctx.strokeStyle = isNight ? '#333' : '#555';
    ctx.lineWidth = 1;
    const vanishX = w / 2;
    const vanishY = h * 0.5;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(vanishX + i * 80, h);
      ctx.lineTo(vanishX + i * 15, vanishY);
      ctx.stroke();
    }

    // Lane markings (animated)
    ctx.strokeStyle = isNight ? '#444433' : '#aaa';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 30]);
    ctx.lineDashOffset = -tick * 2;
    ctx.beginPath();
    ctx.moveTo(vanishX, vanishY);
    ctx.lineTo(vanishX, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Buildings/fence silhouette on sides
    ctx.fillStyle = isNight ? '#15151c' : '#2a2a35';
    ctx.fillRect(0, h * 0.35, w * 0.15, h * 0.2);
    ctx.fillRect(w * 0.85, h * 0.35, w * 0.15, h * 0.2);

    // Gate pillar
    ctx.fillStyle = isNight ? '#252530' : '#3a3a48';
    ctx.fillRect(w * 0.12, h * 0.3, w * 0.04, h * 0.25);
    ctx.fillRect(w * 0.84, h * 0.3, w * 0.04, h * 0.25);

    // Weather effects
    if (isFog) {
      const fogOpacity = weather === 'NIGHT_FOG' ? 0.55 : 0.35;
      ctx.fillStyle = isNight ? `rgba(40,45,55,${fogOpacity})` : `rgba(180,185,195,${fogOpacity})`;
      for (let i = 0; i < 5; i++) {
        const y = (h * 0.3) + i * 20 + Math.sin(t + i) * 10;
        ctx.fillRect(0, y, w, 60);
      }
    }

    if (isRain) {
      ctx.strokeStyle = isHeavyRain ? 'rgba(150,170,200,0.5)' : 'rgba(150,170,200,0.3)';
      ctx.lineWidth = isHeavyRain ? 1.5 : 1;
      const count = isHeavyRain ? 120 : 60;
      for (let i = 0; i < count; i++) {
        const seed = i * 37.3;
        const x = (seed + tick * (isHeavyRain ? 8 : 5)) % w;
        const y = (seed * 2.7 + tick * (isHeavyRain ? 14 : 10)) % h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 2, y + 12);
        ctx.stroke();
      }
      // Wet ground reflection
      if (isHeavyRain) {
        ctx.fillStyle = 'rgba(100,120,150,0.08)';
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
      }
    }

    if (isRecFailure) {
      // Visual distortion
      ctx.fillStyle = 'rgba(200,50,50,0.05)';
      ctx.fillRect(0, 0, w, h);
      // Glitch lines
      for (let i = 0; i < 5; i++) {
        const gy = (t * 50 + i * 40) % h;
        ctx.fillStyle = `rgba(255,100,100,0.08)`;
        ctx.fillRect(0, gy, w, 3);
      }
    }

    // Night vision tint
    if (isNight) {
      ctx.fillStyle = 'rgba(10,30,20,0.15)';
      ctx.fillRect(0, 0, w, h);
      // Light source from gate
      const lightGrad = ctx.createRadialGradient(vanishX, h * 0.4, 0, vanishX, h * 0.4, w * 0.3);
      lightGrad.addColorStop(0, 'rgba(255,240,180,0.12)');
      lightGrad.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Scanlines (subtle CCTV feel)
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }

    // Vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }, [tick, status, weather]);

  return (
    <div className={`relative overflow-hidden bg-black ${rounded} ${className}`}>
      <canvas
        ref={canvasRef}
        width={480}
        height={300}
        className="w-full h-full object-cover"
      />

      {/* Camera label overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
        <span className="text-white text-xs font-mono font-semibold bg-black/50 px-2 py-0.5 rounded">
          {cameraName}
        </span>
        <span className={`text-white text-[10px] font-mono bg-black/50 px-1.5 py-0.5 rounded`}>
          {gate}
        </span>
      </div>

      {/* Status indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        <div className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'} ${status === 'ONLINE' ? 'animate-pulse' : ''}`} />
        <span className={`text-[10px] font-mono font-semibold ${status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}`}>
          {status === 'ONLINE' ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* Recording indicator */}
      {status === 'ONLINE' && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-white/70">REC</span>
          <span className="text-[9px] font-mono text-white/50 ml-1">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
      )}

      {/* Weather label */}
      {weather !== 'NORMAL' && status === 'ONLINE' && (
        <div className="absolute bottom-2 right-2 z-10">
          <span className="text-[9px] font-mono text-amber-400 bg-black/50 px-1.5 py-0.5 rounded">
            {weather.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      {/* Detection line */}
      {detectionLine && status === 'ONLINE' && (
        <div className="absolute left-0 right-0 z-10" style={{ top: '50%' }}>
          <div className="h-0.5 bg-green-400/60 w-full" style={{ borderTop: '2px dashed rgba(74, 222, 128, 0.6)' }} />
          <div className="absolute right-2 -top-2">
            <span className="text-[8px] font-mono text-green-400 bg-black/50 px-1 rounded">DETECTION LINE</span>
          </div>
        </div>
      )}

      {/* Vehicle bounding boxes */}
      {showOverlays && detections.map((det) => (
        <DetectionBox key={det.id} detection={det} tick={tick} />
      ))}

      {/* Simulated camera label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <span className="text-[8px] font-mono text-white/10">SIMULATED CAMERA</span>
      </div>
    </div>
  );
}

function DetectionBox({ detection, tick }: { detection: LiveVehicleDetection; tick: number }) {
  const offset = detection.moving ? Math.sin(tick * 0.05) * 2 : 0;
  const statusLabel = getStatusLabel(detection.status);
  const statusColor = detection.boxColor;

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${detection.x + offset * 0.3}%`,
        top: `${detection.y + offset}%`,
        width: `${detection.width}%`,
        height: `${detection.height}%`,
      }}
    >
      {/* Bounding box — outline only */}
      <div
        className="absolute inset-0 border-2"
        style={{ borderColor: statusColor, boxShadow: `0 0 4px ${statusColor}40` }}
      >
        {/* Corner markers */}
        <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2" style={{ borderColor: statusColor }} />
        <div className="absolute -top-px -right-px w-2 h-2 border-t-2 border-r-2" style={{ borderColor: statusColor }} />
        <div className="absolute -bottom-px -left-px w-2 h-2 border-b-2 border-l-2" style={{ borderColor: statusColor }} />
        <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2" style={{ borderColor: statusColor }} />
      </div>

      {/* Status label */}
      <div
        className="absolute -top-7 left-0 text-[9px] font-mono font-bold px-1.5 py-0.5 whitespace-nowrap"
        style={{ backgroundColor: statusColor, color: '#fff' }}
      >
        [{detection.label}]
      </div>
      <div
        className="absolute -bottom-5 left-0 text-[8px] font-mono font-semibold px-1.5 py-0.5 whitespace-nowrap border"
        style={{ backgroundColor: `${statusColor}20`, borderColor: statusColor, color: statusColor }}
      >
        {statusLabel}
      </div>

      {detection.profileInconsistency && (
        <div className="absolute -top-14 left-0 text-[8px] font-mono font-semibold px-1.5 py-0.5 whitespace-nowrap border bg-blue-500/20 border-blue-500 text-blue-400">
          PROFILE INCONSISTENCY
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'VERIFIED': return 'ENTRY VERIFIED';
    case 'PENDING': return 'GATE PASS PENDING';
    case 'EXPIRED': return 'GATE PASS EXPIRED';
    case 'REQUIRES_VERIFICATION': return 'REQUIRES VERIFICATION';
    case 'UNKNOWN': return 'REQUIRES VERIFICATION';
    default: return status;
  }
}
