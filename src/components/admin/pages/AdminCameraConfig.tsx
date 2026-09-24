import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';
import { CameraFeed } from '../../CameraFeed';
import type { CameraConfig } from '../../../types';

export function AdminCameraConfig() {
  const { state, updateCamera, addAuditLog } = useStore();
  const [selectedId, setSelectedId] = useState(state.cameras[0].id);
  const [editing, setEditing] = useState(false);
  const [testing, setTesting] = useState(false);
  const session = state.adminSession!;

  const cam = state.cameras.find((c) => c.id === selectedId)!;

  const handleSave = () => {
    updateCamera(cam.id, { detectionLineConfigured: true });
    addAuditLog(session.username, 'Camera Configuration Changed', cam.name, 'Detection Line Saved');
    setEditing(false);
  };

  const handleToggleStatus = () => {
    updateCamera(cam.id, { status: cam.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' });
    addAuditLog(session.username, 'Camera Status Changed', cam.name, cam.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE');
  };

  return (
    <div className="h-full flex">
      {/* Camera list */}
      <div className="w-48 border-r border-gray-800 bg-gray-900/30 overflow-y-auto shrink-0">
        <div className="px-3 py-2 border-b border-gray-800">
          <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Cameras</h3>
        </div>
        {state.cameras.map((c) => (
          <button key={c.id} onClick={() => { setSelectedId(c.id); setEditing(false); }}
            className={`w-full text-left px-3 py-2 border-b border-gray-800/50 transition-colors ${selectedId === c.id ? 'bg-green-800/20 border-l-2 border-l-green-600' : 'hover:bg-gray-800/30'}`}>
            <div className="text-[11px] font-mono font-bold text-gray-300">{c.name}</div>
            <div className="text-[10px] text-gray-500">{c.gate}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-[9px] ${c.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}`}>{c.status}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-100">{cam.name}</h2>
          <button onClick={handleToggleStatus}
            className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold ${cam.status === 'ONLINE' ? 'text-red-400 bg-red-950/40 border-red-800/40' : 'text-green-400 bg-green-950/40 border-green-800/40'}`}>
            {cam.status === 'ONLINE' ? 'Set Offline' : 'Set Online'}
          </button>
        </div>

        {/* Camera feed preview */}
        <div style={{ height: '200px' }}>
          <CameraFeed
            cameraId={cam.id}
            cameraName={cam.name}
            gate={cam.gate}
            status={cam.status}
            weather={state.currentWeather}
            showOverlays={false}
            detectionLine={cam.detectionLineConfigured && !editing}
            className="h-full"
          />
        </div>

        {/* Config form */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Configuration</div>
          <ConfigRow label="Camera Name" value={cam.name} />
          <ConfigRow label="Gate" value={cam.gate} />
          <ConfigRow label="Position" value={cam.position === 'MAIN_FRONT' ? 'Main/Front' : 'Elevated/Top-Down'} />
          <ConfigRow label="Detection Line" value={cam.detectionLineConfigured ? 'Configured' : 'Not Configured'} />
          <ConfigRow label="Entry Direction" value={cam.entryDirection} />
          <ConfigRow label="Exit Direction" value={cam.exitDirection} />
        </div>

        {/* Detection line editor */}
        {editing ? (
          <div className="bg-gray-900 rounded-lg p-3 border border-green-800/40 space-y-3">
            <div className="text-[10px] font-bold text-green-400 uppercase tracking-wide">Configure Detection Line</div>
            <div className="text-[11px] text-gray-500">
              Draw a detection line on the camera feed. Define which crossing direction means ENTRY and which means EXIT.
            </div>
            <div className="bg-gray-950 rounded p-3 border border-gray-800">
              <div className="relative h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded">
                <div className="absolute left-0 right-0 top-1/2" style={{ borderTop: '2px dashed #4ade80' }} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-green-400 bg-black/50 px-1 rounded">DETECTION LINE</div>
                <div className="absolute left-2 top-1/4 text-[9px] text-blue-400">ENTRY →</div>
                <div className="absolute left-2 bottom-1/4 text-[9px] text-amber-400">← EXIT</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-gray-500 uppercase">Entry Direction</label>
                <select className="w-full bg-gray-950 border border-gray-800 text-gray-300 text-[11px] rounded px-2 py-1.5 mt-0.5">
                  <option>Outside → Inside</option>
                  <option>Inside → Outside</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase">Exit Direction</label>
                <select className="w-full bg-gray-950 border border-gray-800 text-gray-300 text-[11px] rounded px-2 py-1.5 mt-0.5">
                  <option>Inside → Outside</option>
                  <option>Outside → Inside</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 bg-gray-800 text-gray-300 text-xs py-2 rounded-lg border border-gray-700">Cancel</button>
              {testing ? (
                <button onClick={() => setTesting(false)} className="flex-1 bg-amber-800 text-white text-xs py-2 rounded-lg font-semibold">Stop Test</button>
              ) : (
                <button onClick={() => setTesting(true)} className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-xs py-2 rounded-lg font-semibold">Test Camera</button>
              )}
              <button onClick={handleSave} className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded-lg font-semibold">Save</button>
            </div>
            {testing && (
              <div className="text-[11px] text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded p-2">
                Test mode active — Simulated vehicle will cross the detection line to verify entry/exit detection.
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-2 rounded-lg border border-gray-700 font-semibold">
            {cam.detectionLineConfigured ? 'Edit Detection Line' : 'Configure Detection Line'}
          </button>
        )}
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}
