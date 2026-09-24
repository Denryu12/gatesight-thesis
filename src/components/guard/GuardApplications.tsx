import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import type { Application, ApplicationStatus, VehicleType, ApplicantType } from '../../types';
import { VehicleScanSim } from '../VehicleScanSim';

export function GuardApplications() {
  const { state } = useStore();
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [creating, setCreating] = useState(false);

  const handleOpenApp = (app: Application) => {
    setSelectedApp(app);
    setView('detail');
  };

  if (view === 'create' || creating) {
    return <ApplicationWizard onCancel={() => { setCreating(false); setView('list'); }} onDone={() => { setCreating(false); setView('list'); }} />;
  }

  if (view === 'detail' && selectedApp) {
    return <ApplicationDetail app={selectedApp} onBack={() => { setView('list'); setSelectedApp(null); }} />;
  }

  return <ApplicationList onOpenApp={handleOpenApp} onCreate={() => setCreating(true)} />;
}

function ApplicationList({ onOpenApp, onCreate }: { onOpenApp: (app: Application) => void; onCreate: () => void }) {
  const { state } = useStore();
  const [filter, setFilter] = useState<'all' | 'draft' | 'review' | 'approved' | 'rejected'>('all');

  const apps = state.applications.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'draft') return a.status === 'DRAFT' || a.status === 'REQUIREMENTS_PENDING' || a.status === 'REQUIREMENTS_COMPLETE' || a.status === 'VEHICLE_SCAN_PENDING';
    if (filter === 'review') return a.status === 'READY_FOR_ADMIN_REVIEW' || a.status === 'ADMIN_REVIEW';
    if (filter === 'approved') return a.status === 'APPROVED';
    if (filter === 'rejected') return a.status === 'REJECTED';
    return true;
  });

  const statusColor = (status: ApplicationStatus): string => {
    switch (status) {
      case 'APPROVED': return 'text-green-400 bg-green-950/40 border-green-800/40';
      case 'REJECTED': return 'text-red-400 bg-red-950/40 border-red-800/40';
      case 'READY_FOR_ADMIN_REVIEW': return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
      case 'ADMIN_REVIEW': return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
      case 'REQUIREMENTS_PENDING': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'REQUIREMENTS_COMPLETE': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'VEHICLE_SCAN_PENDING': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      default: return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  const statusLabel = (status: ApplicationStatus): string => {
    const map: Record<ApplicationStatus, string> = {
      DRAFT: 'Draft',
      REQUIREMENTS_PENDING: 'Requirements Pending',
      REQUIREMENTS_COMPLETE: 'Requirements Complete',
      VEHICLE_SCAN_PENDING: 'Vehicle Scan Pending',
      READY_FOR_ADMIN_REVIEW: 'For Admin Review',
      ADMIN_REVIEW: 'Under Admin Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    return map[status];
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-100">Applications</h2>
        <button
          onClick={onCreate}
          className="bg-green-700 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'draft', label: 'Drafts' },
          { key: 'review', label: 'For Review' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap font-medium ${
              filter === f.key ? 'bg-green-800 text-green-100' : 'bg-gray-900 text-gray-500 border border-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Application cards */}
      {apps.length === 0 ? (
        <div className="text-center py-12 text-gray-600 text-sm">No applications found.</div>
      ) : (
        apps.map((app) => (
          <button
            key={app.id}
            onClick={() => onOpenApp(app)}
            className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-3 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-gray-300">{app.id}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${statusColor(app.status)}`}>
                {statusLabel(app.status)}
              </span>
            </div>
            <div className="text-sm text-gray-200 font-medium">{app.applicantName}</div>
            <div className="text-[11px] text-gray-500">
              {app.applicantType} — {app.program || app.department || ''}
            </div>
            {app.vehicleInfo && (
              <div className="text-[11px] text-gray-600 mt-1">
                {app.vehicleInfo.vehicleType} — {app.vehicleInfo.makeModel} ({app.vehicleInfo.plate})
              </div>
            )}
          </button>
        ))
      )}
    </div>
  );
}

const STEPS = ['Requirements', 'Vehicle Info', 'Vehicle Scan', 'Review', 'Submit'];

function ApplicationWizard({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
  const { createApplication, updateApplication, registerVehicle, submitApplication, addAuditLog, state } = useStore();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<string | null>(null);
  const session = state.guardSession!;

  // Form data
  const [applicantName, setApplicantName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [applicantType, setApplicantType] = useState<ApplicantType>('Student');
  const [program, setProgram] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [position, setPosition] = useState('');
  const [requirementsComplete, setRequirementsComplete] = useState(false);
  const [attachmentsAvailable, setAttachmentsAvailable] = useState(false);

  const [vehicleType, setVehicleType] = useState<VehicleType>('Sedan');
  const [makeModel, setMakeModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [owner, setOwner] = useState('');
  const [scanComplete, setScanComplete] = useState(false);

  const handleCreateApp = () => {
    if (!appId) {
      const id = createApplication(session.username, {
        applicantName,
        contactInfo,
        applicantType,
        program,
        department,
        year,
        section,
        position,
      });
      setAppId(id);
    }
  };

  const handleCompleteRequirements = () => {
    if (!appId) handleCreateApp();
    const id = appId || createApplication(session.username, {
      applicantName, contactInfo, applicantType, program, department, year, section, position,
    });
    setAppId(id);
    updateApplication(id, {
      applicantName, contactInfo, applicantType, program, department, year, section, position,
      requirementsComplete: true, attachmentsAvailable: true,
      status: 'REQUIREMENTS_COMPLETE',
    }, session.username, 'Requirements Verified');
    setStep(1);
  };

  const handleSaveVehicleInfo = () => {
    if (!appId) return;
    updateApplication(appId, {
      vehicleInfo: { vehicleType, makeModel, color, plate, owner },
      status: 'VEHICLE_SCAN_PENDING',
    }, session.username, 'Vehicle Information Entered');
    setStep(2);
  };

  const handleScanComplete = () => {
    if (!appId) return;
    const vehicleId = registerVehicle({
      owner, applicantType, program, department, year, section, position,
      vehicleType, makeModel, color, plate, contactInfo,
    });
    updateApplication(appId, {
      scanResult: { vehicleType, color, makeModel, plate, appearanceProfile: 'Created', vehicleId },
      vehicleId,
      status: 'READY_FOR_ADMIN_REVIEW' as ApplicationStatus,
    }, session.username, 'Vehicle Scan Completed');
    setScanComplete(true);
    setStep(3);
  };

  const handleSubmit = () => {
    if (!appId) return;
    submitApplication(appId, session.username);
    setStep(4);
  };

  return (
    <div className="p-4 space-y-4 min-h-full flex flex-col">
      {/* Progress indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex items-center gap-1">
            <div className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-green-600' : 'bg-gray-800'}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-500 -mt-2">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? 'text-green-400 font-semibold' : ''}>{s}</span>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="space-y-3 flex-1">
          <h3 className="text-base font-bold text-gray-100">Requirements & Applicant Info</h3>
          <div className="space-y-3">
            <Field label="Applicant Name" value={applicantName} onChange={setApplicantName} placeholder="Full name" />
            <Field label="Contact Information" value={contactInfo} onChange={setContactInfo} placeholder="Phone number" />
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Applicant Type</label>
              <div className="flex gap-2 mt-1">
                {(['Student', 'Staff'] as ApplicantType[]).map((t) => (
                  <button key={t} onClick={() => setApplicantType(t)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border ${applicantType === t ? 'bg-green-800 border-green-600 text-green-100' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {applicantType === 'Student' ? (
              <>
                <Field label="Program" value={program} onChange={setProgram} placeholder="BS Computer Science" />
                <Field label="Department" value={department} onChange={setDepartment} placeholder="College of Computer Studies" />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Year" value={year} onChange={setYear} placeholder="3" />
                  <Field label="Section" value={section} onChange={setSection} placeholder="A" />
                </div>
              </>
            ) : (
              <>
                <Field label="Department" value={department} onChange={setDepartment} placeholder="IT Department" />
                <Field label="Position" value={position} onChange={setPosition} placeholder="IT Support Staff" />
              </>
            )}
          </div>

          {/* Requirements checklist */}
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Requirements</div>
            {[
              { label: 'Enrollment/ID verification', done: requirementsComplete },
              { label: 'Vehicle ownership document', done: requirementsComplete },
              { label: 'Attachments uploaded', done: attachmentsAvailable },
            ].map((req) => (
              <div key={req.label} className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${req.done ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-500'}`}>
                  {req.done ? '✓' : ''}
                </div>
                <span className={req.done ? 'text-gray-300' : 'text-gray-500'}>{req.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleCompleteRequirements}
            disabled={!applicantName || !contactInfo}
            className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Complete Requirements & Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3 flex-1">
          <h3 className="text-base font-bold text-gray-100">Vehicle Information</h3>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Vehicle Type</label>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {(['Motorcycle', 'Sedan', 'SUV', 'Pickup', 'Van', 'Truck'] as VehicleType[]).map((t) => (
                <button key={t} onClick={() => setVehicleType(t)}
                  className={`py-2 text-[11px] font-medium rounded-lg border ${vehicleType === t ? 'bg-green-800 border-green-600 text-green-100' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Field label="Make/Model" value={makeModel} onChange={setMakeModel} placeholder="Toyota Vios" />
          <Field label="Color" value={color} onChange={setColor} placeholder="White" />
          <Field label="Plate Number" value={plate} onChange={setPlate} placeholder="ABC 1234" />
          <Field label="Owner/Applicant" value={owner} onChange={setOwner} placeholder={applicantName || 'Owner name'} />
          <button
            onClick={handleSaveVehicleInfo}
            disabled={!makeModel || !color || !plate}
            className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Save & Continue to Scan
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 flex-1">
          <h3 className="text-base font-bold text-gray-100">Vehicle Scan</h3>
          <p className="text-[11px] text-gray-500">Simulated camera feed will scan the vehicle from multiple angles.</p>
          <VehicleScanSim onComplete={handleScanComplete} />
          {scanComplete && (
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1.5">
              <div className="text-xs font-bold text-green-400 uppercase tracking-wide">Scan Result</div>
              <ResultRow label="Vehicle Type" value={vehicleType} />
              <ResultRow label="Color" value={color} />
              <ResultRow label="Make/Model" value={makeModel} />
              <ResultRow label="Plate" value={plate} />
              <ResultRow label="Appearance Profile" value="Created" />
              <ResultRow label="Vehicle ID" value={appId ? `V-${String(state.nextVehicleSeq - 1).padStart(3, '0')}` : 'Pending'} highlight />
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 flex-1">
          <h3 className="text-base font-bold text-gray-100">Review</h3>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">Applicant</div>
            <ResultRow label="Name" value={applicantName} />
            <ResultRow label="Contact" value={contactInfo} />
            <ResultRow label="Type" value={applicantType} />
            {applicantType === 'Student' ? (
              <ResultRow label="Program" value={`${program} — ${year}${section}`} />
            ) : (
              <ResultRow label="Department" value={`${department} — ${position}`} />
            )}
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">Vehicle</div>
            <ResultRow label="Type" value={vehicleType} />
            <ResultRow label="Make/Model" value={makeModel} />
            <ResultRow label="Color" value={color} />
            <ResultRow label="Plate" value={plate} />
            <ResultRow label="Owner" value={owner} />
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">Scan</div>
            <ResultRow label="Scan Completeness" value="100%" />
            <ResultRow label="Appearance Profile" value="Created" />
            <ResultRow label="Vehicle ID" value={appId ? `V-${String(state.nextVehicleSeq - 1).padStart(3, '0')}` : 'Pending'} highlight />
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded bg-green-700 text-white flex items-center justify-center">✓</div>
              <span className="text-gray-300">Requirements Complete</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded bg-green-700 text-white flex items-center justify-center">✓</div>
              <span className="text-gray-300">Attachments Available</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded bg-green-700 text-white flex items-center justify-center">✓</div>
              <span className="text-gray-300">Vehicle Scan Completed</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold text-sm py-3 rounded-lg transition-colors"
          >
            Submit Application for Admin Review
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100">Application Submitted</h3>
            <p className="text-xs text-gray-500 mt-1">Application {appId} has been submitted for Administrator review.</p>
            <p className="text-[11px] text-gray-600 mt-2">The Admin will see this in their review queue immediately.</p>
          </div>
          <button
            onClick={onDone}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm py-2.5 rounded-lg transition-colors border border-gray-700"
          >
            Done
          </button>
        </div>
      )}

      <button onClick={onCancel} className="text-[11px] text-gray-600 hover:text-gray-400 text-center">
        Cancel
      </button>
    </div>
  );
}

function ApplicationDetail({ app, onBack }: { app: Application; onBack: () => void }) {
  return (
    <div className="p-4 space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="text-xs font-mono font-bold text-gray-300">{app.id}</div>
        <div className="text-sm font-bold text-gray-100 mt-1">{app.applicantName}</div>
        <div className="text-[11px] text-gray-500">{app.applicantType} — {app.program || app.department}</div>
        <div className="mt-2">
          <StatusBadge status={app.status} />
        </div>
      </div>

      {app.vehicleInfo && (
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1.5">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Vehicle</div>
          <ResultRow label="Type" value={app.vehicleInfo.vehicleType} />
          <ResultRow label="Make/Model" value={app.vehicleInfo.makeModel} />
          <ResultRow label="Color" value={app.vehicleInfo.color} />
          <ResultRow label="Plate" value={app.vehicleInfo.plate} />
          {app.vehicleId && <ResultRow label="Vehicle ID" value={app.vehicleId} highlight />}
        </div>
      )}

      {app.scanResult && (
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1.5">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Scan Result</div>
          <ResultRow label="Appearance Profile" value={app.scanResult.appearanceProfile} />
        </div>
      )}

      {/* Requirements */}
      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">Requirements</div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-4 h-4 rounded flex items-center justify-center ${app.requirementsComplete ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-500'}`}>
            {app.requirementsComplete ? '✓' : ''}
          </div>
          <span className={app.requirementsComplete ? 'text-gray-300' : 'text-gray-500'}>Requirements {app.requirementsComplete ? 'Complete' : 'Incomplete'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-4 h-4 rounded flex items-center justify-center ${app.attachmentsAvailable ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-500'}`}>
            {app.attachmentsAvailable ? '✓' : ''}
          </div>
          <span className={app.attachmentsAvailable ? 'text-gray-300' : 'text-gray-500'}>Attachments {app.attachmentsAvailable ? 'Available' : 'Unavailable'}</span>
        </div>
      </div>

      {/* History */}
      {app.history.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wide">History</div>
          {app.history.map((h, i) => (
            <div key={i} className="text-[11px] border-l-2 border-gray-700 pl-2">
              <div className="text-gray-300">{h.action}</div>
              <div className="text-gray-600">{h.by} — {h.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sticker info */}
      {app.stickerNo && (
        <div className="bg-green-950/30 rounded-xl p-3 border border-green-800/40 space-y-1.5">
          <div className="text-xs font-bold text-green-400 uppercase tracking-wide">Sticker Issued</div>
          <ResultRow label="Sticker No." value={app.stickerNo} highlight />
          <ResultRow label="Issued By" value={app.issuedBy || ''} />
          <ResultRow label="Issued Date" value={app.issuedDate || ''} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-green-600 placeholder-gray-700"
      />
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? 'text-green-400 font-mono font-bold' : 'text-gray-300'}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const labels: Record<ApplicationStatus, string> = {
    DRAFT: 'Draft',
    REQUIREMENTS_PENDING: 'Requirements Pending',
    REQUIREMENTS_COMPLETE: 'Requirements Complete',
    VEHICLE_SCAN_PENDING: 'Vehicle Scan Pending',
    READY_FOR_ADMIN_REVIEW: 'For Admin Review',
    ADMIN_REVIEW: 'Under Admin Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
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
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border ${colors[status]}`}>{labels[status]}</span>
  );
}
