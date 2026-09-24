import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';
import type { Application, ApplicationStatus } from '../../../types';

export function AdminApplications() {
  const { state, approveApplication, rejectApplication } = useStore();
  const [tab, setTab] = useState<'review' | 'approved' | 'rejected' | 'all'>('review');
  const [selected, setSelected] = useState<Application | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const session = state.adminSession!;

  const apps = state.applications.filter((a) => {
    if (tab === 'review') return a.status === 'READY_FOR_ADMIN_REVIEW' || a.status === 'ADMIN_REVIEW';
    if (tab === 'approved') return a.status === 'APPROVED';
    if (tab === 'rejected') return a.status === 'REJECTED';
    return true;
  });

  const handleApprove = () => {
    if (!selected) return;
    approveApplication(selected.id, session.username);
    setSelected(null);
  };

  const handleReject = () => {
    if (!selected) return;
    rejectApplication(selected.id, session.username, rejectReason || undefined);
    setRejectMode(false);
    setRejectReason('');
    setSelected(null);
  };

  if (selected) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <button onClick={() => { setSelected(null); setRejectMode(false); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Applications
        </button>

        <div className="max-w-2xl space-y-3">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-mono font-bold text-gray-200">{selected.id}</div>
                <div className="text-base font-bold text-gray-100">{selected.applicantName}</div>
              </div>
              <StatusBadge status={selected.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Applicant info */}
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Applicant</div>
              <Row label="Name" value={selected.applicantName} />
              <Row label="Contact" value={selected.contactInfo} />
              <Row label="Type" value={selected.applicantType} />
              {selected.applicantType === 'Student' ? (
                <>
                  <Row label="Program" value={selected.program || '—'} />
                  <Row label="Dept" value={selected.department || '—'} />
                  <Row label="Year/Sec" value={`${selected.year || ''}${selected.section || ''}`} />
                </>
              ) : (
                <>
                  <Row label="Department" value={selected.department || '—'} />
                  <Row label="Position" value={selected.position || '—'} />
                </>
              )}
            </div>

            {/* Vehicle info */}
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Vehicle</div>
              {selected.vehicleInfo ? (
                <>
                  <Row label="Type" value={selected.vehicleInfo.vehicleType} />
                  <Row label="Make/Model" value={selected.vehicleInfo.makeModel} />
                  <Row label="Color" value={selected.vehicleInfo.color} />
                  <Row label="Plate" value={selected.vehicleInfo.plate} />
                  <Row label="Owner" value={selected.vehicleInfo.owner} />
                </>
              ) : (
                <div className="text-[11px] text-gray-600">No vehicle information yet.</div>
              )}
            </div>
          </div>

          {/* Scan result */}
          {selected.scanResult && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Vehicle Scan Result</div>
              <Row label="Vehicle Type" value={selected.scanResult.vehicleType} />
              <Row label="Color" value={selected.scanResult.color} />
              <Row label="Make/Model" value={selected.scanResult.makeModel} />
              <Row label="Plate" value={selected.scanResult.plate} />
              <Row label="Appearance Profile" value={selected.scanResult.appearanceProfile} />
              <Row label="Vehicle ID" value={selected.scanResult.vehicleId} highlight />
            </div>
          )}

          {/* Requirements */}
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Requirements & Attachments</div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${selected.requirementsComplete ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-500'}`}>{selected.requirementsComplete ? '✓' : ''}</div>
              <span className={selected.requirementsComplete ? 'text-gray-300' : 'text-gray-500'}>Requirements {selected.requirementsComplete ? 'Complete' : 'Incomplete'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${selected.attachmentsAvailable ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-500'}`}>{selected.attachmentsAvailable ? '✓' : ''}</div>
              <span className={selected.attachmentsAvailable ? 'text-gray-300' : 'text-gray-500'}>Attachments {selected.attachmentsAvailable ? 'Available' : 'Unavailable'}</span>
            </div>
          </div>

          {/* History */}
          {selected.history.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Application History</div>
              {selected.history.map((h, i) => (
                <div key={i} className="text-[11px] border-l-2 border-gray-700 pl-2">
                  <div className="text-gray-300">{h.action}</div>
                  <div className="text-gray-600">{h.by} — {h.timestamp}</div>
                  {h.note && <div className="text-gray-600">Note: {h.note}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {(selected.status === 'READY_FOR_ADMIN_REVIEW' || selected.status === 'ADMIN_REVIEW') && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Admin Actions</div>
              {rejectMode ? (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (optional)..."
                    className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 placeholder-gray-700 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setRejectMode(false)} className="flex-1 bg-gray-800 text-gray-300 text-xs py-2 rounded-lg border border-gray-700">Cancel</button>
                    <button onClick={handleReject} className="flex-1 bg-red-700 hover:bg-red-600 text-white text-xs py-2 rounded-lg font-semibold">Confirm Rejection</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setRejectMode(true)} className="flex-1 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs py-2 rounded-lg border border-red-800/40 font-semibold">Reject</button>
                  <button onClick={handleApprove} className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded-lg font-semibold">Approve Application</button>
                </div>
              )}
            </div>
          )}

          {selected.status === 'APPROVED' && (
            <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/40">
              <div className="text-xs text-green-400 font-semibold">Application Approved</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Approved by {selected.reviewedBy} on {selected.reviewedAt}</div>
              {selected.stickerNo ? (
                <div className="mt-2 text-[11px] text-green-400 font-mono">Sticker: {selected.stickerNo}</div>
              ) : (
                <div className="mt-2 text-[11px] text-amber-400">Sticker not yet issued — Gate Pass: PENDING</div>
              )}
            </div>
          )}

          {selected.status === 'REJECTED' && (
            <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/40">
              <div className="text-xs text-red-400 font-semibold">Application Rejected</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Rejected by {selected.reviewedBy} on {selected.reviewedAt}</div>
              {selected.rejectionReason && <div className="text-[11px] text-gray-500 mt-1">Reason: {selected.rejectionReason}</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Applications</h2>

      <div className="flex gap-1">
        {([
          { key: 'review', label: 'For Review' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'all', label: 'All' },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-[11px] px-3 py-1.5 rounded-lg font-medium ${tab === t.key ? 'bg-green-800 text-green-100' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>
            {t.label}
            {t.key === 'review' && apps.length > 0 && tab === 'review' && <span className="ml-1 text-[9px]">({apps.length})</span>}
          </button>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-sm bg-gray-900/30 rounded-lg border border-gray-800">
          No applications in this category.
        </div>
      ) : (
        <div className="space-y-2">
          {apps.map((app) => (
            <button key={app.id} onClick={() => setSelected(app)}
              className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-3 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-gray-300">{app.id}</span>
                <StatusBadge status={app.status} />
              </div>
              <div className="text-sm text-gray-200 font-medium">{app.applicantName}</div>
              <div className="text-[11px] text-gray-500">{app.applicantType} — {app.program || app.department}</div>
              {app.vehicleInfo && (
                <div className="text-[11px] text-gray-600 mt-0.5">{app.vehicleInfo.makeModel} — {app.vehicleInfo.plate}</div>
              )}
              {app.submittedAt && <div className="text-[10px] text-gray-600 mt-1">Submitted: {app.submittedAt}</div>}
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

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const labels: Record<ApplicationStatus, string> = {
    DRAFT: 'Draft', REQUIREMENTS_PENDING: 'Req Pending', REQUIREMENTS_COMPLETE: 'Req Complete',
    VEHICLE_SCAN_PENDING: 'Scan Pending', READY_FOR_ADMIN_REVIEW: 'For Review',
    ADMIN_REVIEW: 'Under Review', APPROVED: 'Approved', REJECTED: 'Rejected',
  };
  const colors: Record<ApplicationStatus, string> = {
    DRAFT: 'text-gray-400 bg-gray-900 border-gray-700',
    REQUIREMENTS_PENDING: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    REQUIREMENTS_COMPLETE: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    VEHICLE_SCAN_PENDING: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    READY_FOR_ADMIN_REVIEW: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    ADMIN_REVIEW: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    APPROVED: 'text-green-400 bg-green-950/40 border-green-800/40',
    REJECTED: 'text-red-400 bg-red-950/40 border-red-800/40',
  };
  return <span className={`text-[9px] px-1.5 py-0.5 rounded border ${colors[status]}`}>{labels[status]}</span>;
}
