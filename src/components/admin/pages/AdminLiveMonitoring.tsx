import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';
import { CameraFeed } from '../../CameraFeed';

export function AdminLiveMonitoring() {
  const { state } = useStore();
  const [selectedCam, setSelectedCam] = useState(0);
  const cameras = state.cameras;
  const sel = cameras[selectedCam];
  const otherCams = cameras.filter((_, i) => i !== selectedCam);

  const liveDetections = state.liveVehicles;
  const todayEvents = state.eventLogs.slice(0, 6);

  return (
    <div className="h-full flex">
      {/* Main camera area */}
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-gray-100">Live Monitoring</h2>
            <p className="text-[10px] text-gray-500">Fixed Gate Camera System — Simulated Feeds</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${state.currentWeather === 'NORMAL' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="text-[10px] text-gray-400">Weather: <span className="text-gray-300">{state.currentWeather.replace(/_/g, ' ')}</span></span>
            </div>
            <span className="text-[10px] text-gray-600">{cameras.filter((c) => c.status === 'ONLINE').length}/{cameras.length} Online</span>
          </div>
        </div>

        {/* Large camera feed */}
        <div className="flex-1 min-h-0">
          <CameraFeed
            cameraId={sel.id}
            cameraName={sel.name}
            gate={sel.gate}
            status={sel.status}
            weather={state.currentWeather}
            detections={liveDetections}
            detectionLine={sel.detectionLineConfigured}
            className="h-full"
          />
        </div>

        {/* Small previews */}
        <div className="grid grid-cols-3 gap-2 shrink-0" style={{ height: '90px' }}>
          {otherCams.map((cam) => {
            const idx = cameras.indexOf(cam);
            return (
              <button
                key={cam.id}
                onClick={() => setSelectedCam(idx)}
                className="relative group"
              >
                <CameraFeed
                  cameraId={cam.id}
                  cameraName={cam.name}
                  gate={cam.gate}
                  status={cam.status}
                  weather={state.currentWeather}
                  showOverlays={false}
                  className="h-full"
                  rounded="rounded-md"
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-green-800/10 rounded-md transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side activity panel */}
      <div className="w-56 border-l border-gray-800 bg-gray-900/50 flex flex-col overflow-hidden shrink-0">
        <div className="px-3 py-2 border-b border-gray-800">
          <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Activity</h3>
        </div>

        {/* Live detections */}
        <div className="px-3 py-2 border-b border-gray-800">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Current Detections</div>
          {liveDetections.length === 0 ? (
            <div className="text-[10px] text-gray-600 py-2">No vehicles currently detected.</div>
          ) : (
            <div className="space-y-1.5">
              {liveDetections.map((det) => (
                <DetectionCard key={det.id} det={det} />
              ))}
            </div>
          )}
        </div>

        {/* Camera status */}
        <div className="px-3 py-2 border-b border-gray-800">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb 1.5">Camera Status</div>
          <div className="space-y-1">
            {cameras.map((cam) => (
              <div key={cam.id} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">{cam.name}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={cam.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}>{cam.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent events */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Recent Events</div>
          <div className="space-y-1.5">
            {todayEvents.map((evt) => (
              <div key={evt.id} className="border-l-2 border-gray-700 pl-2 py-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-gray-300">{evt.vehicleId}</span>
                  <span className="text-[9px] text-gray-600">{evt.time}</span>
                </div>
                <div className="text-[9px] text-gray-500">{evt.gate} — {evt.direction}</div>
                <div className={`text-[9px] font-medium ${recColor(evt.recognitionStatus)}`}>
                  {recLabel(evt.recognitionStatus)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetectionCard({ det }: { det: any }) {
  return (
    <div className="bg-gray-900 rounded-md p-2 border" style={{ borderColor: det.boxColor + '40' }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold" style={{ color: det.boxColor }}>{det.label}</span>
      </div>
      <div className="text-[9px] font-medium mt-0.5" style={{ color: det.boxColor }}>
        {det.status === 'VERIFIED' ? 'ENTRY VERIFIED' :
         det.status === 'PENDING' ? 'GATE PASS PENDING' :
         det.status === 'EXPIRED' ? 'GATE PASS EXPIRED' :
         'REQUIRES VERIFICATION'}
      </div>
      {det.profileInconsistency && (
        <div className="text-[8px] text-blue-400 font-medium mt-0.5 bg-blue-950/30 px-1 py-0.5 rounded">
          PROFILE INCONSISTENCY
        </div>
      )}
    </div>
  );
}

function recColor(status: string): string {
  switch (status) {
    case 'VERIFIED': return 'text-green-400';
    case 'PENDING': return 'text-amber-400';
    case 'EXPIRED': return 'text-red-400';
    case 'REQUIRES_VERIFICATION': return 'text-orange-400';
    default: return 'text-gray-400';
  }
}

function recLabel(status: string): string {
  switch (status) {
    case 'VERIFIED': return 'Verified';
    case 'PENDING': return 'Pending';
    case 'EXPIRED': return 'Expired';
    case 'REQUIRES_VERIFICATION': return 'Requires Verification';
    default: return status;
  }
}
