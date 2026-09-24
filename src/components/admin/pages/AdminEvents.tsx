import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';

export function AdminEvents() {
  const { state } = useStore();
  const [gateFilter, setGateFilter] = useState('all');
  const [dirFilter, setDirFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const events = state.eventLogs.filter((e) => {
    if (gateFilter !== 'all' && !e.gate.toLowerCase().includes(gateFilter.replace('gate', 'gate'))) return false;
    if (dirFilter !== 'all' && e.direction.toLowerCase() !== dirFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified' && e.recognitionStatus !== 'VERIFIED') return false;
      if (statusFilter === 'unknown' && e.recognitionStatus !== 'UNKNOWN') return false;
      if (statusFilter === 'requires' && e.recognitionStatus !== 'REQUIRES_VERIFICATION') return false;
      if (statusFilter === 'pending' && e.recognitionStatus !== 'PENDING') return false;
      if (statusFilter === 'expired' && e.recognitionStatus !== 'EXPIRED') return false;
    }
    if (dateFilter === 'today' && e.date !== 'Sept 24, 2026') return false;
    if (dateFilter === 'week' && !e.date.includes('Sept 2')) return false;
    if (dateFilter === 'month' && !e.date.includes('Sept')) return false;
    if (dateFilter === 'year' && !e.date.includes('2026')) return false;
    return true;
  });

  const recColor = (s: string) => {
    switch (s) {
      case 'VERIFIED': return 'text-green-400';
      case 'PENDING': return 'text-amber-400';
      case 'EXPIRED': return 'text-red-400';
      case 'REQUIRES_VERIFICATION': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const passColor = (s: string) => {
    switch (s) {
      case 'VALID': return 'text-green-400';
      case 'PENDING': return 'text-amber-400';
      case 'EXPIRED': return 'text-red-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Event Log</h2>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          <FilterSelect label="Gate" value={gateFilter} onChange={setGateFilter} options={[{v:'all',l:'All'},{v:'gate 1',l:'Gate 1'},{v:'gate 2',l:'Gate 2'}]} />
          <FilterSelect label="Direction" value={dirFilter} onChange={setDirFilter} options={[{v:'all',l:'All'},{v:'entry',l:'Entry'},{v:'exit',l:'Exit'}]} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={[{v:'all',l:'All'},{v:'verified',l:'Verified'},{v:'unknown',l:'Unknown'},{v:'requires',l:'Requires Verification'},{v:'pending',l:'Pending'},{v:'expired',l:'Expired'}]} />
          <FilterSelect label="Date" value={dateFilter} onChange={setDateFilter} options={[{v:'all',l:'All'},{v:'today',l:'Today'},{v:'week',l:'This Week'},{v:'month',l:'This Month'},{v:'year',l:'This Year'}]} />
        </div>
      </div>

      {/* Event table */}
      {events.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-sm bg-gray-900/30 rounded-lg border border-gray-800">
          No events found for the selected filters.
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr className="text-left text-gray-500">
                <th className="px-2 py-1.5 font-medium">Date</th>
                <th className="px-2 py-1.5 font-medium">Time</th>
                <th className="px-2 py-1.5 font-medium">Gate</th>
                <th className="px-2 py-1.5 font-medium">Camera</th>
                <th className="px-2 py-1.5 font-medium">Dir</th>
                <th className="px-2 py-1.5 font-medium">Vehicle</th>
                <th className="px-2 py-1.5 font-medium">Status</th>
                <th className="px-2 py-1.5 font-medium">Gate Pass</th>
                <th className="px-2 py-1.5 font-medium">Plate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-gray-800/30">
                  <td className="px-2 py-1.5 text-gray-400">{evt.date}</td>
                  <td className="px-2 py-1.5 text-gray-400 font-mono">{evt.time}</td>
                  <td className="px-2 py-1.5 text-gray-300">{evt.gate}</td>
                  <td className="px-2 py-1.5 text-gray-300">{evt.camera}</td>
                  <td className="px-2 py-1.5 text-gray-300">{evt.direction}</td>
                  <td className="px-2 py-1.5 font-mono font-bold text-gray-200">{evt.vehicleId}</td>
                  <td className={`px-2 py-1.5 font-medium ${recColor(evt.recognitionStatus)}`}>{evt.recognitionStatus.replace(/_/g, ' ')}</td>
                  <td className={`px-2 py-1.5 ${passColor(evt.gatePassStatus)}`}>{evt.gatePassStatus}</td>
                  <td className="px-2 py-1.5 text-gray-500 font-mono">{evt.detectedPlate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-gray-600 uppercase">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="bg-gray-900 border border-gray-800 text-gray-300 text-[10px] rounded px-1.5 py-1 focus:outline-none focus:border-green-600">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
