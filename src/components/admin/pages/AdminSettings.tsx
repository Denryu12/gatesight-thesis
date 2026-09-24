import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';

export function AdminSettings() {
  const { state, updateSettings, addAuditLog } = useStore();
  const session = state.adminSession!;
  const [unknownMode, setUnknownMode] = useState(state.settings.unknownVerificationMode);
  const [academicYear, setAcademicYear] = useState(state.settings.currentAcademicYear);
  const [expiration, setExpiration] = useState(state.settings.gatePassExpiration);
  const [emailAlerts, setEmailAlerts] = useState(state.settings.notificationPrefs.emailAlerts);
  const [smsAlerts, setSmsAlerts] = useState(state.settings.notificationPrefs.smsAlerts);
  const [unknownAlerts, setUnknownAlerts] = useState(state.settings.notificationPrefs.unknownVehicleAlerts);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      unknownVerificationMode: unknownMode,
      currentAcademicYear: academicYear,
      gatePassExpiration: expiration,
      notificationPrefs: { emailAlerts, smsAlerts, unknownVehicleAlerts: unknownAlerts },
    });
    addAuditLog(session.username, 'Settings Changed', 'System Settings', 'Updated');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Settings</h2>

      {/* Unknown Vehicle Verification */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Unknown Vehicle Verification</div>
        <div className="flex gap-2">
          {(['ADMIN_ONLY', 'ADMIN_AND_AUTHORIZED_GUARDS'] as const).map((m) => (
            <button key={m} onClick={() => setUnknownMode(m)}
              className={`flex-1 py-2 text-[11px] font-medium rounded-lg border ${unknownMode === m ? 'bg-green-800 border-green-600 text-green-100' : 'bg-gray-950 border-gray-800 text-gray-500'}`}>
              {m === 'ADMIN_ONLY' ? 'Admin Only' : 'Admin + Authorized Guards'}
            </button>
          ))}
        </div>
      </div>

      {/* Academic Year */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Academic Year</div>
        <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-600" />
      </div>

      {/* Gate Pass Expiration */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Gate Pass Expiration</div>
        <select value={expiration} onChange={(e) => setExpiration(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-600">
          <option>End of Year</option>
          <option>End of Semester</option>
          <option>Custom Date</option>
        </select>
      </div>

      {/* Recognition Prototype Settings */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Recognition Prototype Settings</div>
        <div className="text-[11px] text-gray-500">Vehicle Re-ID is the primary identity mechanism. License plate is secondary/supporting.</div>
        <div className="text-[11px] text-gray-500">Model classification observations do NOT overwrite registered vehicle identity.</div>
        <div className="text-[11px] text-gray-500">Progressive Vehicle Profile Enrichment: confirmed high-confidence observations only.</div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Notification Preferences</div>
        {[
          { label: 'Email Alerts', value: emailAlerts, set: setEmailAlerts },
          { label: 'SMS Alerts', value: smsAlerts, set: setSmsAlerts },
          { label: 'Unknown Vehicle Alerts', value: unknownAlerts, set: setUnknownAlerts },
        ].map((pref) => (
          <div key={pref.label} className="flex items-center justify-between">
            <span className="text-[11px] text-gray-300">{pref.label}</span>
            <button onClick={() => pref.set(!pref.value)}
              className={`w-9 h-5 rounded-full transition-colors ${pref.value ? 'bg-green-700' : 'bg-gray-700'}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${pref.value ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Camera/Gate Settings */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Camera/Gate Settings</div>
        <div className="text-[11px] text-gray-500">Cameras: 4 fixed cameras (Gate 1-A, 1-B, 2-A, 2-B)</div>
        <div className="text-[11px] text-gray-500">Detection Line: Manually configured by Administrator</div>
        <div className="text-[11px] text-gray-500">Entry/Exit: Determined by crossing direction</div>
      </div>

      <button onClick={handleSave}
        className="w-full bg-green-700 hover:bg-green-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors">
        {saved ? 'Settings Saved' : 'Save Settings'}
      </button>
    </div>
  );
}
