import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';
import type { UnknownVehicle } from '../../../types';

export function AdminUnknownVerification() {
  const { state, resolveUnknownLinked, resolveUnknownUnregistered } = useStore();
  const [selected, setSelected] = useState<UnknownVehicle | null>(null);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const session = state.adminSession!;

  const queue = state.unknownVehicles;
  const pending = queue.filter((u) => u.status === 'NEW' || u.status === 'UNDER_REVIEW');
  const resolved = queue.filter((u) => u.status === 'RESOLVED_LINKED' || u.status === 'RESOLVED_UNREGISTERED');

  const searchResults = state.vehicles.filter((v) => {
    if (!search) return false;
    const s = search.toLowerCase();
    const fields = [v.id, v.plate, v.owner, v.makeModel, v.color, v.stickerNo, v.program, v.department, v.vehicleType];
    return fields.some((f) => f?.toLowerCase().includes(s));
  });

  const handleLink = (vehicleId: string) => {
    if (!selected) return;
    resolveUnknownLinked(selected.id, vehicleId, session.username);
    setSelected(null);
    setSearch('');
  };

  const handleUnregistered = () => {
    if (!selected) return;
    resolveUnknownUnregistered(selected.id, session.username);
    setSelected(null);
  };

  if (selected) {
    const statusLabel = selected.status === 'RESOLVED_LINKED' ? `Resolved — Linked to ${selected.resolvedTo}` :
      selected.status === 'RESOLVED_UNREGISTERED' ? 'Resolved — Unregistered' :
      selected.status === 'UNDER_REVIEW' ? 'Under Review' : 'Requires Verification';

    return (
      <div className="h-full overflow-y-auto p-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Queue
        </button>

        <div className="max-w-2xl space-y-3">
          {/* Unknown vehicle header */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-mono font-bold text-amber-400">{selected.id}</div>
                <div className="text-sm text-gray-300">{statusLabel}</div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded border ${
                selected.status === 'NEW' ? 'text-amber-400 bg-amber-950/40 border-amber-800/40' :
                selected.status === 'RESOLVED_LINKED' ? 'text-green-400 bg-green-950/40 border-green-800/40' :
                selected.status === 'RESOLVED_UNREGISTERED' ? 'text-red-400 bg-red-950/40 border-red-800/40' :
                'text-gray-400 bg-gray-900 border-gray-700'
              }`}>{selected.status.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Evidence</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-950 rounded p-2 border border-gray-800 text-center">
                <div className="text-[9px] text-gray-600 mb-1">SNAPSHOT</div>
                <div className="h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                </div>
                <div className="text-[8px] text-gray-700 mt-1">Evidence Snapshot</div>
              </div>
              <div className="bg-gray-950 rounded p-2 border border-gray-800 text-center">
                <div className="text-[9px] text-gray-600 mb-1">VIDEO CLIP</div>
                <div className="h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-[8px] text-gray-700 mt-1">Short Video Clip</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
              <div><span className="text-gray-500">Date:</span> <span className="text-gray-300">{selected.date}</span></div>
              <div><span className="text-gray-500">Time:</span> <span className="text-gray-300">{selected.time}</span></div>
              <div><span className="text-gray-500">Gate:</span> <span className="text-gray-300">{selected.gate}</span></div>
              <div><span className="text-gray-500">Camera:</span> <span className="text-gray-300">{selected.camera}</span></div>
              <div><span className="text-gray-500">Direction:</span> <span className="text-gray-300">{selected.direction}</span></div>
              <div><span className="text-gray-500">Plate:</span> <span className="text-gray-300">{selected.detectedPlate || 'Not detected'}</span></div>
            </div>
          </div>

          {/* Resolution info if resolved */}
          {selected.status === 'RESOLVED_LINKED' && (
            <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/40">
              <div className="text-xs text-green-400 font-semibold">Linked to {selected.resolvedTo}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Resolved by {selected.resolvedBy} on {selected.resolvedAt}</div>
              <div className="text-[10px] text-gray-600 mt-1">Original incident preserved. Audit log updated.</div>
            </div>
          )}
          {selected.status === 'RESOLVED_UNREGISTERED' && (
            <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/40">
              <div className="text-xs text-red-400 font-semibold">Marked Unregistered</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Resolved by {selected.resolvedBy} on {selected.resolvedAt}</div>
              <div className="text-[10px] text-gray-600 mt-1">Evidence retained. Audit log updated.</div>
            </div>
          )}

          {/* Resolution actions */}
          {(selected.status === 'NEW' || selected.status === 'UNDER_REVIEW') && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Search Registered Vehicles</div>
              <div className="flex gap-1.5">
                <select value={searchField} onChange={(e) => setSearchField(e.target.value)}
                  className="bg-gray-950 border border-gray-800 text-gray-300 text-[11px] rounded-lg px-2 py-1.5">
                  <option value="all">All Fields</option>
                  <option value="id">Vehicle ID</option>
                  <option value="plate">Plate</option>
                  <option value="owner">Owner</option>
                  <option value="make">Make/Model</option>
                </select>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search registered vehicles..."
                  className="flex-1 bg-gray-950 border border-gray-800 text-gray-200 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-600 placeholder-gray-700" />
              </div>

              {search && searchResults.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {searchResults.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded p-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-green-400">{v.id}</span>
                        <span className="text-[11px] text-gray-400 ml-2">{v.owner}</span>
                        <span className="text-[10px] text-gray-600 ml-1">— {v.makeModel} ({v.plate})</span>
                      </div>
                      <button onClick={() => handleLink(v.id)}
                        className="text-[10px] bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded font-semibold">
                        Link
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {search && searchResults.length === 0 && (
                <div className="text-[11px] text-gray-600 py-2">No matching vehicles found.</div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-800">
                <button onClick={handleUnregistered}
                  className="flex-1 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs py-2 rounded-lg border border-red-800/40 font-semibold">
                  Mark Unregistered
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Unknown Verification</h2>

      <div className="text-[10px] text-gray-500">
        Mode: <span className="text-gray-400">{state.settings.unknownVerificationMode === 'ADMIN_ONLY' ? 'Admin Only' : 'Admin + Authorized Guards'}</span>
      </div>

      {/* Pending */}
      <div>
        <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold mb-2">
          Requires Verification ({pending.length})
        </div>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-xs bg-gray-900/30 rounded-lg border border-gray-800">
            No unknown vehicles requiring verification.
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((unk) => (
              <button key={unk.id} onClick={() => setSelected(unk)}
                className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-amber-800/30 rounded-lg p-3 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-amber-400">{unk.id}</span>
                  <span className="text-[9px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">REQUIRES VERIFICATION</span>
                </div>
                <div className="text-[11px] text-gray-500">{unk.date} — {unk.time} | {unk.gate} — {unk.camera} | {unk.direction}</div>
                {unk.detectedPlate && <div className="text-[11px] text-gray-600 mt-0.5">Plate: {unk.detectedPlate}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <div className="text-[10px] text-green-400 uppercase tracking-wider font-semibold mb-2">
            Resolved ({resolved.length})
          </div>
          <div className="space-y-2">
            {resolved.map((unk) => (
              <button key={unk.id} onClick={() => setSelected(unk)}
                className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-3 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-gray-400">{unk.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    unk.status === 'RESOLVED_LINKED' ? 'text-green-400 bg-green-950/40 border-green-800/40' : 'text-red-400 bg-red-950/40 border-red-800/40'
                  }`}>
                    {unk.status === 'RESOLVED_LINKED' ? `LINKED → ${unk.resolvedTo}` : 'UNREGISTERED'}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600">{unk.date} — {unk.time} | {unk.gate}</div>
                <div className="text-[10px] text-gray-700 mt-0.5">Resolved by {unk.resolvedBy} on {unk.resolvedAt}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
