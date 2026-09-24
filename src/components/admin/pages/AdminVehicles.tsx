import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';
import type { Vehicle } from '../../../types';

export function AdminVehicles() {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [tab, setTab] = useState<'overview' | 'gatepass' | 'recognition' | 'movement' | 'audit'>('overview');
  const [dateFilter, setDateFilter] = useState('all');

  const vehicles = state.vehicles.filter((v) => {
    if (search) {
      const s = search.toLowerCase();
      if (![v.id, v.plate, v.owner, v.makeModel, v.color, v.stickerNo, v.program, v.department, v.vehicleType].some((f) => f?.toLowerCase().includes(s)))
        return false;
    }
    if (statusFilter !== 'all' && v.gatePassStatus.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const passColor = (s: string) => {
    switch (s) {
      case 'VALID': return 'text-green-400 bg-green-950/40 border-green-800/40';
      case 'PENDING': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'EXPIRED': return 'text-red-400 bg-red-950/40 border-red-800/40';
      default: return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  if (selected) {
    const vehicle = state.vehicles.find((v) => v.id === selected.id) || selected;
    const filteredHistory = vehicle.movementHistory.filter((m) => {
      if (dateFilter === 'all') return true;
      if (dateFilter === 'today') return m.date === 'Sept 24, 2026';
      if (dateFilter === 'week') return m.date.includes('Sept 2');
      if (dateFilter === 'month') return m.date.includes('Sept');
      if (dateFilter === 'year') return m.date.includes('2026');
      return true;
    });

    return (
      <div className="h-full overflow-y-auto p-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Vehicles
        </button>

        <div className="max-w-2xl space-y-3">
          {/* Header */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-mono font-bold text-green-400">{vehicle.id}</div>
                <div className="text-sm text-gray-100 font-medium">{vehicle.owner}</div>
                <div className="text-[11px] text-gray-500">{vehicle.applicantType === 'Student' ? `${vehicle.program} — ${vehicle.year}${vehicle.section}` : `${vehicle.department} — ${vehicle.position}`}</div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded border ${passColor(vehicle.gatePassStatus)}`}>{vehicle.gatePassStatus.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-800 pb-1">
            {(['overview', 'gatepass', 'recognition', 'movement', 'audit'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-[11px] px-2.5 py-1 rounded font-medium capitalize ${tab === t ? 'bg-green-800 text-green-100' : 'text-gray-500 hover:text-gray-300'}`}>
                {t === 'gatepass' ? 'Gate Pass' : t}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-1.5">
              <Row label="Vehicle ID" value={vehicle.id} highlight />
              <Row label="Owner" value={vehicle.owner} />
              <Row label="Applicant Type" value={vehicle.applicantType} />
              {vehicle.applicantType === 'Student' ? (
                <>
                  <Row label="Program" value={vehicle.program || '—'} />
                  <Row label="Department" value={vehicle.department || '—'} />
                  <Row label="Year/Section" value={`${vehicle.year || ''}${vehicle.section || ''}`} />
                </>
              ) : (
                <>
                  <Row label="Department" value={vehicle.department || '—'} />
                  <Row label="Position" value={vehicle.position || '—'} />
                </>
              )}
              <Row label="Vehicle Type" value={vehicle.vehicleType} />
              <Row label="Make/Model" value={vehicle.makeModel} />
              <Row label="Color" value={vehicle.color} />
              <Row label="Plate" value={vehicle.plate} />
              <Row label="Contact Info" value={vehicle.contactInfo || '—'} />
            </div>
          )}

          {tab === 'gatepass' && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-1.5">
              <Row label="Sticker No." value={vehicle.stickerNo || 'NOT ISSUED'} highlight={!!vehicle.stickerNo} />
              <Row label="Gate Pass Status" value={vehicle.gatePassStatus.replace(/_/g, ' ')} />
              <Row label="Valid Until" value={vehicle.validUntil || 'Pending'} />
              <Row label="Application ID" value={vehicle.applicationId || '—'} />
              <Row label="Issued By" value={vehicle.issuedBy || '—'} />
              <Row label="Issued Date" value={vehicle.issuedDate || '—'} />
              {vehicle.contactRecord && (
                <>
                  <div className="pt-2 mt-2 border-t border-gray-800 text-[10px] font-bold text-gray-400 uppercase">Contact Record</div>
                  <Row label="Contact Status" value={vehicle.contactRecord.status === 'CONTACTED' ? 'Contacted' : 'Not Contacted'} />
                  {vehicle.contactRecord.method && <Row label="Method" value={vehicle.contactRecord.method} />}
                  {vehicle.contactRecord.notes && <Row label="Notes" value={vehicle.contactRecord.notes} />}
                </>
              )}
            </div>
          )}

          {tab === 'recognition' && (
            <div className="space-y-3">
              {vehicle.profileInconsistency && (
                <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/40">
                  <div className="text-xs font-bold text-blue-400">PROFILE INCONSISTENCY — REVIEW RECOMMENDED</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Registered Model: <span className="text-gray-300">{vehicle.makeModel}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Observed Model: <span className="text-blue-400">{vehicle.profileInconsistency.observedModel}</span>
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Visual Re-ID still strongly matches {vehicle.id}. The registered model is NOT overwritten.</div>
                </div>
              )}
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-1.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Recognition Profile</div>
                <Row label="Profile Status" value="Active" />
                <Row label="Initial Profile" value="Registration Scan" />
                <Row label="Total Observations" value={String(vehicle.confirmedObservations.length)} />
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Confirmed Appearance Observations</div>
                <div className="text-[10px] text-gray-600 italic mb-1">
                  Progressive Vehicle Profile Enrichment — confirmed high-confidence observations only.
                </div>
                {vehicle.confirmedObservations.map((obs) => (
                  <div key={obs.id} className="border-l-2 border-green-800/40 pl-2 text-[11px]">
                    <div className="text-gray-300">{obs.source} — {obs.date}</div>
                    <div className="text-gray-600">Lighting: {obs.lighting} | Angle: {obs.viewingAngle} | Confidence: {obs.confidence}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'movement' && (
            <div className="space-y-3">
              <div className="flex gap-1">
                {['all', 'today', 'week', 'month', 'year'].map((f) => (
                  <button key={f} onClick={() => setDateFilter(f)}
                    className={`text-[10px] px-2 py-1 rounded font-medium capitalize ${dateFilter === f ? 'bg-green-800 text-green-100' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-6 text-gray-600 text-xs">No movement history for this date range.</div>
                ) : (
                  [...filteredHistory].reverse().map((m) => (
                    <div key={m.id} className="border-l-2 border-gray-700 pl-2 text-[11px]">
                      <div className="text-gray-300">{m.date} — {m.time}</div>
                      <div className="text-gray-500">{m.gate} — {m.camera} — {m.direction}</div>
                      <div className={m.recognitionStatus === 'VERIFIED' ? 'text-green-400' : 'text-gray-500'}>{m.recognitionStatus}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'audit' && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
              {state.auditLogs.filter((a) => a.target.includes(vehicle.id) || a.target === vehicle.stickerNo || a.target === vehicle.applicationId).length === 0 ? (
                <div className="text-center py-6 text-gray-600 text-xs">No audit entries for this vehicle.</div>
              ) : (
                state.auditLogs.filter((a) => a.target.includes(vehicle.id) || a.target === vehicle.stickerNo || a.target === vehicle.applicationId).map((a) => (
                  <div key={a.id} className="border-l-2 border-gray-700 pl-2 text-[11px]">
                    <div className="text-gray-300">{a.what}</div>
                    <div className="text-gray-600">{a.who} — {a.when}</div>
                    {a.resultingStatus && <div className="text-gray-700">→ {a.resultingStatus}</div>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Vehicles</h2>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by ID, plate, owner, make, sticker, program..."
        className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 placeholder-gray-700" />

      <div className="flex gap-1">
        {['all', 'valid', 'pending', 'expired', 'not_issued'].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`text-[10px] px-2.5 py-1 rounded font-medium capitalize ${statusFilter === f ? 'bg-green-800 text-green-100' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-sm bg-gray-900/30 rounded-lg border border-gray-800">No vehicles found.</div>
      ) : (
        <div className="space-y-1.5">
          {vehicles.map((v) => (
            <button key={v.id} onClick={() => setSelected(v)}
              className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-2.5 transition-colors">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-mono font-bold text-green-400">{v.id}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${passColor(v.gatePassStatus)}`}>{v.gatePassStatus.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-[11px] text-gray-300">{v.owner} — {v.makeModel} ({v.color})</div>
              <div className="text-[10px] text-gray-600">{v.plate} {v.stickerNo && `| ${v.stickerNo}`}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? 'text-green-400 font-mono font-bold' : 'text-gray-300'}>{value}</span>
    </div>
  );
}
