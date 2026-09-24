import { useStore } from '../../store/StoreContext';

type Tab = 'home' | 'applications' | 'stickers' | 'vehicles' | 'more';

export function GuardHome({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { state } = useStore();
  const session = state.guardSession!;

  const todayEvents = state.eventLogs.filter((e) => e.date === 'Sept 24, 2026');
  const entered = todayEvents.filter((e) => e.direction === 'ENTRY').length;
  const exited = todayEvents.filter((e) => e.direction === 'EXIT').length;
  const pendingApps = state.applications.filter(
    (a) => a.status === 'APPROVED' && !a.stickerNo
  );
  const reviewApps = state.applications.filter(
    (a) => a.status === 'READY_FOR_ADMIN_REVIEW'
  );
  const unknownAlerts = state.unknownVehicles.filter(
    (u) => u.status === 'NEW' || u.status === 'UNDER_REVIEW'
  );

  return (
    <div className="p-4 space-y-4">
      {/* Greeting */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">GateSight Guard</div>
        <h2 className="text-lg font-bold text-gray-100">{session.name}</h2>
        <p className="text-[11px] text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Today's activity */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-3">Today's Activity</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-green-400">{entered}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Vehicles Entered</div>
          </div>
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-blue-400">{exited}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Vehicles Exited</div>
          </div>
        </div>
      </div>

      {/* Alert counts */}
      <div className="space-y-2">
        {pendingApps.length > 0 && (
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-center justify-between" onClick={() => onNavigate('stickers')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-300">Pending Sticker Issuance</div>
                <div className="text-[10px] text-amber-600">{pendingApps.length} application(s) awaiting sticker</div>
              </div>
            </div>
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        )}

        {reviewApps.length > 0 && (
          <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3 flex items-center justify-between" onClick={() => onNavigate('applications')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-300">Awaiting Admin Review</div>
                <div className="text-[10px] text-blue-600">{reviewApps.length} application(s) submitted</div>
              </div>
            </div>
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        )}

        {unknownAlerts.length > 0 && (
          <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-orange-300">Verification Alerts</div>
                <div className="text-[10px] text-orange-600">{unknownAlerts.length} unknown vehicle(s) require verification</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Application button */}
      <button
        onClick={() => onNavigate('applications')}
        className="w-full bg-green-700 hover:bg-green-600 text-white font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Application
      </button>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Applications', tab: 'applications' as Tab, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
          { label: 'Register Vehicle', tab: 'applications' as Tab, icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1' },
          { label: 'Sticker Issuance', tab: 'stickers' as Tab, icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.984 1.984 0 013 12V7a4 4 0 014-4z' },
          { label: 'Search Vehicles', tab: 'vehicles' as Tab, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.tab)}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-3 flex flex-col items-center gap-1.5 transition-colors"
          >
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
            </svg>
            <span className="text-[11px] text-gray-300 font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
