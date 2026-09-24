import { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { GuardApp } from './guard/GuardApp';
import { AdminApp } from './admin/AdminApp';
import { SimulationControls } from './SimulationControls';
import type { ScenarioType } from '../types';

export function DemoLayout() {
  const { state } = useStore();
  const [simOpen, setSimOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M5 5v12M19 5v12M3 13h18" />
              </svg>
            </div>
            <div>
              <h1 className="text-green-100 font-bold text-sm tracking-wide">GATESIGHT</h1>
              <p className="text-gray-500 text-[9px] uppercase tracking-wider">AI Vehicle Tracking & Re-ID System</p>
            </div>
          </div>
          <span className="hidden md:inline text-gray-600 text-[10px] border-l border-gray-700 pl-3 ml-2">
            Prototype Simulation Mode
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500">
            <span>Shared State: Active</span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <button
            onClick={() => setSimOpen(!simOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors border border-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Simulation
          </button>
        </div>
      </header>

      {/* Simulation controls panel */}
      {simOpen && (
        <div className="bg-gray-900/95 border-b border-gray-800 backdrop-blur-sm">
          <SimulationControls onClose={() => setSimOpen(false)} />
        </div>
      )}

      {/* Two device screens side by side */}
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-4 p-4 overflow-auto">
        {/* LEFT: Guard smartphone (portrait) */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">Guard Smartphone</span>
          </div>
          <PhoneFrame>
            <GuardApp />
          </PhoneFrame>
        </div>

        {/* RIGHT: Administrator desktop (landscape) */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">Administrator Workstation</span>
          </div>
          <DesktopFrame>
            <AdminApp />
          </DesktopFrame>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ width: '340px', height: '720px' }}>
      {/* Phone body */}
      <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] border-[3px] border-gray-800 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-30" />
        {/* Speaker */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gray-700 rounded-full z-40" />

        {/* Screen */}
        <div className="absolute inset-0 top-7 bottom-2 left-1.5 right-1.5 rounded-[2rem] overflow-hidden bg-white">
          {children}
        </div>

        {/* Side buttons */}
        <div className="absolute left-[-4px] top-32 w-1 h-8 bg-gray-800 rounded-l" />
        <div className="absolute left-[-4px] top-44 w-1 h-12 bg-gray-800 rounded-l" />
        <div className="absolute right-[-4px] top-36 w-1 h-16 bg-gray-800 rounded-r" />
      </div>
    </div>
  );
}

function DesktopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center" style={{ width: 'min(960px, 100%)' }}>
      {/* Monitor bezel */}
      <div className="w-full bg-gray-900 rounded-xl border-2 border-gray-800 shadow-2xl overflow-hidden">
        {/* Screen content */}
        <div className="bg-gray-950 overflow-hidden" style={{ height: '600px' }}>
          {children}
        </div>
      </div>
      {/* Monitor stand */}
      <div className="w-24 h-4 bg-gray-800 -mt-px rounded-b" />
      <div className="w-48 h-1.5 bg-gray-700 rounded-b-lg" />
    </div>
  );
}
