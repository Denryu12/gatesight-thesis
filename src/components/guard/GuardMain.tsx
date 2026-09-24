import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { GuardHome } from './GuardHome';
import { GuardApplications } from './GuardApplications';
import { GuardStickers } from './GuardStickers';
import { GuardVehicles } from './GuardVehicles';
import { GuardMore } from './GuardMore';
import { GuardVehicleDetail } from './GuardVehicleDetail';
import type { Vehicle } from '../../types';

type Tab = 'home' | 'applications' | 'stickers' | 'vehicles' | 'more';

export function GuardMain() {
  const { state, logout } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  if (selectedVehicle) {
    return (
      <GuardVehicleDetail
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicle(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Status bar */}
      <div className="bg-gray-900 px-4 py-1.5 flex items-center justify-between text-[10px] text-gray-400 shrink-0 border-b border-gray-800">
        <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex items-center gap-2">
          <span className="text-green-500">●</span>
          <span>{state.guardSession?.name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'home' && <GuardHome onNavigate={setTab} />}
        {tab === 'applications' && <GuardApplications />}
        {tab === 'stickers' && <GuardStickers />}
        {tab === 'vehicles' && <GuardVehicles onSelectVehicle={handleSelectVehicle} />}
        {tab === 'more' && <GuardMore onLogout={() => logout('GUARD_PHONE')} />}
      </div>

      {/* Bottom navigation */}
      <nav className="bg-gray-900 border-t border-gray-800 flex items-center justify-around py-1.5 shrink-0">
        {[
          { key: 'home' as Tab, label: 'Home', icon: HomeIcon },
          { key: 'applications' as Tab, label: 'Applications', icon: FileIcon },
          { key: 'stickers' as Tab, label: 'Stickers', icon: StickerIcon },
          { key: 'vehicles' as Tab, label: 'Vehicles', icon: CarIcon },
          { key: 'more' as Tab, label: 'More', icon: MoreIcon },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? 'text-green-400' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function StickerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.984 1.984 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
