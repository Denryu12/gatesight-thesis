import { useState } from 'react';
import { useStore } from '../store/StoreContext';

const scenarios: { id: string; label: string; description: string }[] = [
  { id: 'NORMAL', label: 'Normal', description: 'Clear conditions, normal operation' },
  { id: 'VALID_ENTRY', label: 'Valid Vehicle Entry', description: 'V-014 recognized, gate pass valid' },
  { id: 'PENDING_PASS', label: 'Pending Gate Pass', description: 'V-021 matched, sticker not issued' },
  { id: 'EXPIRED_PASS', label: 'Expired Gate Pass', description: 'V-032 matched, pass expired' },
  { id: 'UNKNOWN_VEHICLE', label: 'Unknown Vehicle', description: 'Cannot match — assign UNKNOWN ID' },
  { id: 'UNKNOWN_RESOLVED', label: 'Unknown Vehicle Resolved', description: 'UNKNOWN-027 linked to V-014' },
  { id: 'UNKNOWN_NOT_REGISTERED', label: 'Unknown Vehicle Not Registered', description: 'UNKNOWN-031 marked unregistered' },
  { id: 'HEAVY_RAIN', label: 'Heavy Rain', description: 'Adverse weather, reduced recognition' },
  { id: 'FOG', label: 'Fog', description: 'Adverse weather, reduced visibility' },
  { id: 'NIGHT_FOG', label: 'Night Fog', description: 'Night conditions with fog' },
  { id: 'RECOGNITION_FAILURE', label: 'Recognition Failure', description: 'System fails to identify vehicle' },
  { id: 'PROFILE_INCONSISTENCY', label: 'Profile Inconsistency', description: 'Model mismatch with V-014' },
  { id: 'CAMERA_OFFLINE', label: 'Camera Offline', description: 'Gate 1-A goes offline' },
];

export function SimulationControls({ onClose }: { onClose: () => void }) {
  const { runScenario, resetDemo, state } = useStore();
  const [selected, setSelected] = useState('NORMAL');

  const handleRun = () => {
    runScenario(selected);
  };

  const handleReset = () => {
    if (confirm('Reset all demo data to initial state? This will clear all changes.')) {
      resetDemo();
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Prototype Simulation</span>
          <span className="text-gray-600 text-[10px]">— Testing / Demo Controls Only</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Scenario</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRun}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Run Scenario
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-red-700 text-gray-200 hover:text-white text-sm font-semibold rounded-lg transition-colors border border-gray-600"
          >
            Reset Demo
          </button>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-gray-500">
        {scenarios.find((s) => s.id === selected)?.description}
      </div>

      <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-600 border-t border-gray-800 pt-2">
        <span>Current Weather: <span className="text-gray-400">{state.currentWeather.replace(/_/g, ' ')}</span></span>
        <span>Vehicles: <span className="text-gray-400">{state.vehicles.length}</span></span>
        <span>Applications: <span className="text-gray-400">{state.applications.length}</span></span>
        <span>Unknown Queue: <span className="text-gray-400">{state.unknownVehicles.filter((u) => u.status === 'NEW' || u.status === 'UNDER_REVIEW').length}</span></span>
        <span>Events: <span className="text-gray-400">{state.eventLogs.length}</span></span>
      </div>
    </div>
  );
}
