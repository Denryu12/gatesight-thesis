import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import type { Application, ContactRecord } from '../../types';

export function GuardStickers() {
  const { state, issueSticker, recordContact } = useStore();
  const session = state.guardSession!;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stickerNumbers, setStickerNumbers] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [contactApp, setContactApp] = useState<Application | null>(null);
  const [confirmApp, setConfirmApp] = useState<Application | null>(null);

  const pendingStickers = state.applications.filter(
    (a) => a.status === 'APPROVED' && !a.stickerNo
  ).filter((a) => {
    if (!search) return true;
    return a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.vehicleInfo?.plate.toLowerCase().includes(search.toLowerCase());
  });

  const issuedStickers = state.applications.filter(
    (a) => a.stickerNo && a.status === 'APPROVED'
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleConfirmIssuance = (app: Application) => {
    const stickerNo = stickerNumbers[app.id];
    if (!stickerNo) return;
    issueSticker(app.id, stickerNo, session.username);
    setConfirmApp(null);
    setStickerNumbers((prev) => {
      const copy = { ...prev };
      delete copy[app.id];
      return copy;
    });
    const next = new Set(selected);
    next.delete(app.id);
    setSelected(next);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-base font-bold text-gray-100">Sticker Issuance</h2>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, application ID, or plate..."
        className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 placeholder-gray-700"
      />

      {/* Pending issuance */}
      <div>
        <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold mb-2">
          Pending Issuance ({pendingStickers.length})
        </div>
        {pendingStickers.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-xs bg-gray-900/50 rounded-xl border border-gray-800">
            No applications pending sticker issuance.
          </div>
        ) : (
          <div className="space-y-2">
            {pendingStickers.map((app) => (
              <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-200">{app.applicantName}</div>
                    <div className="text-[10px] font-mono text-gray-500">{app.id}</div>
                    {app.vehicleInfo && (
                      <div className="text-[11px] text-gray-600 mt-0.5">
                        {app.vehicleInfo.vehicleType} — {app.vehicleInfo.makeModel} ({app.vehicleInfo.plate})
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSelect(app.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selected.has(app.id) ? 'bg-green-700 border-green-600' : 'border-gray-700'
                    }`}
                  >
                    {selected.has(app.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={stickerNumbers[app.id] || ''}
                    onChange={(e) => setStickerNumbers((prev) => ({ ...prev, [app.id]: e.target.value }))}
                    placeholder="GP-2026-XXXX"
                    className="flex-1 bg-gray-950 border border-gray-800 text-green-300 text-xs font-mono rounded-lg px-2.5 py-2 focus:outline-none focus:border-green-600 placeholder-gray-700"
                  />
                  <button
                    onClick={() => setConfirmApp(app)}
                    disabled={!stickerNumbers[app.id]}
                    className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issued stickers */}
      {issuedStickers.length > 0 && (
        <div>
          <div className="text-[10px] text-green-400 uppercase tracking-wider font-semibold mb-2">
            Recently Issued ({issuedStickers.length})
          </div>
          <div className="space-y-2">
            {issuedStickers.slice(0, 5).map((app) => (
              <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-200">{app.applicantName}</div>
                    <div className="text-[10px] font-mono text-green-400">{app.stickerNo}</div>
                    <div className="text-[10px] text-gray-600">{app.issuedBy} — {app.issuedDate}</div>
                  </div>
                  <button
                    onClick={() => setContactApp(app)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold ${
                      app.contactRecord?.status === 'CONTACTED'
                        ? 'bg-green-950/40 border-green-800/40 text-green-400'
                        : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
                    }`}
                  >
                    {app.contactRecord?.status === 'CONTACTED' ? 'Contacted' : 'Record Contact'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm issuance modal */}
      {confirmApp && (
        <Modal onClose={() => setConfirmApp(null)}>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-100">Confirm Sticker Issuance</h3>
            <div className="bg-gray-900 rounded-lg p-3 space-y-1.5">
              <div className="text-xs text-gray-500">Applicant</div>
              <div className="text-sm text-gray-200">{confirmApp.applicantName}</div>
              <div className="text-[10px] font-mono text-gray-500">{confirmApp.id}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 space-y-1.5">
              <div className="text-xs text-gray-500">Sticker Number</div>
              <div className="text-sm font-mono font-bold text-green-400">{stickerNumbers[confirmApp.id]}</div>
            </div>
            <div className="text-[11px] text-gray-500">
              Once confirmed, the gate pass will become VALID and this action will be recorded in the audit log.
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmApp(null)} className="flex-1 bg-gray-800 text-gray-300 text-xs py-2 rounded-lg border border-gray-700">Cancel</button>
              <button onClick={() => handleConfirmIssuance(confirmApp)} className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded-lg font-semibold">Confirm Issuance</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Contact record modal */}
      {contactApp && (
        <ContactModal
          app={contactApp}
          onClose={() => setContactApp(null)}
          onSave={(record) => {
            recordContact(contactApp.id, record, session.username);
            setContactApp(null);
          }}
        />
      )}
    </div>
  );
}

function ContactModal({ app, onClose, onSave }: { app: Application; onClose: () => void; onSave: (record: ContactRecord) => void }) {
  const [status, setStatus] = useState<'NOT_CONTACTED' | 'CONTACTED'>(app.contactRecord?.status || 'NOT_CONTACTED');
  const [method, setMethod] = useState<ContactRecord['method']>(app.contactRecord?.method || 'Phone');
  const [notes, setNotes] = useState(app.contactRecord?.notes || '');

  return (
    <Modal onClose={onClose}>
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-100">Applicant Contact Record</h3>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-sm text-gray-200">{app.applicantName}</div>
          <div className="text-[11px] text-gray-500">{app.contactInfo}</div>
          <div className="text-[10px] font-mono text-green-400 mt-1">{app.stickerNo}</div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Contact Status</label>
          <div className="flex gap-2 mt-1">
            {(['NOT_CONTACTED', 'CONTACTED'] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border ${status === s ? 'bg-green-800 border-green-600 text-green-100' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                {s === 'CONTACTED' ? 'Contacted' : 'Not Contacted'}
              </button>
            ))}
          </div>
        </div>

        {status === 'CONTACTED' && (
          <>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Contact Method</label>
              <div className="flex gap-1.5 mt-1">
                {(['Phone', 'SMS', 'Email', 'Other'] as const).map((m) => (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg border ${method === m ? 'bg-green-800 border-green-600 text-green-100' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Applicant informed that physical gate-pass sticker is ready."
                className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-green-600 placeholder-gray-700 resize-none"
                rows={3}
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-800 text-gray-300 text-xs py-2 rounded-lg border border-gray-700">Cancel</button>
          <button
            onClick={() => onSave({ status, method: status === 'CONTACTED' ? method : undefined, notes: notes || undefined })}
            className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded-lg font-semibold"
          >
            Save Record
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
