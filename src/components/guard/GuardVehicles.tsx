import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import type { Vehicle } from '../../types';

export function GuardVehicles({ onSelectVehicle }: { onSelectVehicle: (v: Vehicle) => void }) {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const vehicles = state.vehicles.filter((v) => {
    if (search) {
      const s = search.toLowerCase();
      if (!v.id.toLowerCase().includes(s) &&
          !v.plate.toLowerCase().includes(s) &&
          !v.owner.toLowerCase().includes(s) &&
          !v.makeModel.toLowerCase().includes(s) &&
          !v.stickerNo?.toLowerCase().includes(s)) return false;
    }
    if (statusFilter !== 'all' && v.gatePassStatus.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const passStatusColor = (status: string): string => {
    switch (status) {
      case 'VALID': return 'text-green-400 bg-green-950/40 border-green-800/40';
      case 'PENDING': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'EXPIRED': return 'text-red-400 bg-red-950/40 border-red-800/40';
      case 'NOT_ISSUED': return 'text-gray-400 bg-gray-900 border-gray-700';
      default: return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-base font-bold text-gray-100">Vehicles</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by ID, plate, owner, make..."
        className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 placeholder-gray-700"
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {['all', 'valid', 'pending', 'expired', 'not_issued'].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap font-medium capitalize ${statusFilter === f ? 'bg-green-800 text-green-100' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-600 text-sm bg-gray-900/50 rounded-xl border border-gray-800">
          No vehicles found.
        </div>
      ) : (
        vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelectVehicle(v)}
            className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-3 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-green-400">{v.id}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${passStatusColor(v.gatePassStatus)}`}>
                {v.gatePassStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-sm text-gray-200 font-medium">{v.owner}</div>
            <div className="text-[11px] text-gray-500">{v.makeModel} — {v.color}</div>
            <div className="text-[11px] text-gray-600 mt-0.5">{v.plate}</div>
            {v.stickerNo && <div className="text-[10px] font-mono text-gray-600 mt-0.5">{v.stickerNo}</div>}
          </button>
        ))
      )}
    </div>
  );
}
