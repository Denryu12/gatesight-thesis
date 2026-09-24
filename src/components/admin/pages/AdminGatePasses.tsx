import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';

export function AdminGatePasses() {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');

  const passes = state.gatePasses.filter((p) => {
    if (filter === 'all') return true;
    return p.status.toLowerCase() === filter;
  });

  const statusColor = (status: string): string => {
    switch (status) {
      case 'VALID': return 'text-green-400 bg-green-950/40 border-green-800/40';
      case 'PENDING': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'EXPIRED': return 'text-red-400 bg-red-950/40 border-red-800/40';
      default: return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Gate Passes</h2>

      <div className="flex gap-1">
        {['all', 'valid', 'pending', 'expired'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] px-3 py-1.5 rounded-lg font-medium capitalize ${filter === f ? 'bg-green-800 text-green-100' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>
            {f}
          </button>
        ))}
      </div>

      {passes.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-sm bg-gray-900/30 rounded-lg border border-gray-800">No gate passes found.</div>
      ) : (
        <div className="space-y-2">
          {passes.map((pass) => {
            const vehicle = state.vehicles.find((v) => v.id === pass.vehicleId);
            return (
              <div key={pass.stickerNo} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-green-400">{pass.stickerNo}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${statusColor(pass.status)}`}>{pass.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-gray-500">Vehicle:</span> <span className="text-gray-300 font-mono">{pass.vehicleId}</span></div>
                  <div><span className="text-gray-500">Application:</span> <span className="text-gray-300 font-mono">{pass.applicationId}</span></div>
                  <div><span className="text-gray-500">Owner:</span> <span className="text-gray-300">{vehicle?.owner || '—'}</span></div>
                  <div><span className="text-gray-500">Valid Until:</span> <span className="text-gray-300">{pass.validUntil}</span></div>
                  <div><span className="text-gray-500">Issued By:</span> <span className="text-gray-300">{pass.issuedBy || '—'}</span></div>
                  <div><span className="text-gray-500">Issued Date:</span> <span className="text-gray-300">{pass.issuedDate || '—'}</span></div>
                </div>
                {pass.contactRecord && pass.contactRecord.status === 'CONTACTED' && (
                  <div className="mt-2 pt-2 border-t border-gray-800 text-[10px] text-gray-600">
                    Contacted via {pass.contactRecord.method} — {pass.contactRecord.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
