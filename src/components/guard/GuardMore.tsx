import { useStore } from '../../store/StoreContext';

export function GuardMore({ onLogout }: { onLogout: () => void }) {
  const { state } = useStore();
  const session = state.guardSession!;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-base font-bold text-gray-100">More</h2>

      {/* Profile */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-green-100 font-bold text-sm">
            {session.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-100">{session.name}</div>
            <div className="text-[11px] text-gray-500">@{session.username} — Guard</div>
            <div className="text-[10px] text-gray-600">Session: {session.loginTime}</div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        {[
          { label: 'Today\'s Activity', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { label: 'Search Vehicles', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
          { label: 'Gate Pass Status', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          { label: 'Help & Support', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
            <span className="text-xs text-gray-300">{item.label}</span>
            <svg className="w-3.5 h-3.5 text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        ))}
      </div>

      {/* System info */}
      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-1">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">System</div>
        <div className="flex justify-between text-[11px]"><span className="text-gray-600">Academic Year</span><span className="text-gray-400">{state.settings.currentAcademicYear}</span></div>
        <div className="flex justify-between text-[11px]"><span className="text-gray-600">Verification Mode</span><span className="text-gray-400">{state.settings.unknownVerificationMode === 'ADMIN_ONLY' ? 'Admin Only' : 'Admin + Authorized Guards'}</span></div>
        <div className="flex justify-between text-[11px]"><span className="text-gray-600">Weather</span><span className="text-gray-400">{state.currentWeather.replace(/_/g, ' ')}</span></div>
      </div>

      <button
        onClick={onLogout}
        className="w-full bg-red-950/40 hover:bg-red-900/40 text-red-400 font-semibold text-sm py-2.5 rounded-xl border border-red-800/40 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Sign Out
      </button>
    </div>
  );
}
