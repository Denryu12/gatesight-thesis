import { useStore } from '../../store/StoreContext';
import type { Vehicle } from '../../types';

export function GuardVehicleDetail({ vehicle, onBack }: { vehicle: Vehicle; onBack: () => void }) {
  return (
    <div className="p-4 space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-mono font-bold text-green-400">{vehicle.id}</span>
          <PassStatusBadge status={vehicle.gatePassStatus} />
        </div>
        <div className="text-sm font-semibold text-gray-100">{vehicle.owner}</div>
        <div className="text-[11px] text-gray-500">{vehicle.applicantType === 'Student' ? `${vehicle.program} — ${vehicle.year}${vehicle.section}` : `${vehicle.department} — ${vehicle.position}`}</div>
      </div>

      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1.5">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Vehicle</div>
        <Row label="Type" value={vehicle.vehicleType} />
        <Row label="Make/Model" value={vehicle.makeModel} />
        <Row label="Color" value={vehicle.color} />
        <Row label="Plate" value={vehicle.plate} />
      </div>

      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1.5">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Gate Pass</div>
        <Row label="Sticker No." value={vehicle.stickerNo || 'NOT ISSUED'} highlight={!!vehicle.stickerNo} />
        <Row label="Status" value={vehicle.gatePassStatus.replace(/_/g, ' ')} />
        <Row label="Valid Until" value={vehicle.validUntil || 'Pending'} />
        <Row label="Issued By" value={vehicle.issuedBy || '—'} />
        <Row label="Issued Date" value={vehicle.issuedDate || '—'} />
      </div>

      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1.5">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Contact</div>
        <Row label="Contact Info" value={vehicle.contactInfo || '—'} />
        <Row label="Contact Status" value={vehicle.contactRecord?.status === 'CONTACTED' ? 'Contacted' : 'Not Contacted'} />
        {vehicle.contactRecord?.method && <Row label="Method" value={vehicle.contactRecord.method} />}
      </div>

      {vehicle.movementHistory.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Recent Movement</div>
          {vehicle.movementHistory.slice(-5).reverse().map((m) => (
            <div key={m.id} className="text-[11px] border-l-2 border-gray-700 pl-2">
              <div className="text-gray-300">{m.date} — {m.time}</div>
              <div className="text-gray-500">{m.gate} — {m.direction}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? 'text-green-400 font-mono font-bold' : 'text-gray-300'}>{value}</span>
    </div>
  );
}

function PassStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    VALID: 'Valid', PENDING: 'Pending', EXPIRED: 'Expired', NOT_ISSUED: 'Not Issued', REJECTED: 'Rejected', SUSPENDED: 'Suspended',
  };
  const colors: Record<string, string> = {
    VALID: 'text-green-400 bg-green-950/40 border-green-800/40',
    PENDING: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    EXPIRED: 'text-red-400 bg-red-950/40 border-red-800/40',
    NOT_ISSUED: 'text-gray-400 bg-gray-900 border-gray-700',
  };
  return <span className={`text-[9px] px-1.5 py-0.5 rounded border ${colors[status] || colors.NOT_ISSUED}`}>{labels[status] || status}</span>;
}
