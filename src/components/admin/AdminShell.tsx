import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { AdminLiveMonitoring } from './pages/AdminLiveMonitoring';
import { AdminApplications } from './pages/AdminApplications';
import { AdminGatePasses } from './pages/AdminGatePasses';
import { AdminUnknownVerification } from './pages/AdminUnknownVerification';
import { AdminVehicles } from './pages/AdminVehicles';
import { AdminEvents } from './pages/AdminEvents';
import { AdminCameraConfig } from './pages/AdminCameraConfig';
import { AdminUsers } from './pages/AdminUsers';
import { AdminAuditLogs } from './pages/AdminAuditLogs';
import { AdminSettings } from './pages/AdminSettings';

type Page =
  | 'monitoring'
  | 'applications'
  | 'gatepasses'
  | 'unknown'
  | 'vehicles'
  | 'events'
  | 'cameras'
  | 'users'
  | 'audit'
  | 'settings';

const navItems: { key: Page; label: string; icon: string }[] = [
  { key: 'monitoring', label: 'Live Monitoring', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { key: 'applications', label: 'Applications', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'gatepasses', label: 'Gate Passes', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.984 1.984 0 013 12V7a4 4 0 014-4z' },
  { key: 'unknown', label: 'Unknown Verification', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'vehicles', label: 'Vehicles', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1' },
  { key: 'events', label: 'Events', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { key: 'cameras', label: 'Camera Configuration', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'users', label: 'Users & Roles', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { key: 'audit', label: 'Audit Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export function AdminShell() {
  const { state, logout } = useStore();
  const [page, setPage] = useState<Page>('monitoring');
  const session = state.adminSession!;

  const pendingReview = state.applications.filter((a) => a.status === 'READY_FOR_ADMIN_REVIEW').length;
  const pendingUnknown = state.unknownVehicles.filter((u) => u.status === 'NEW' || u.status === 'UNDER_REVIEW').length;

  return (
    <div className="h-full flex bg-gray-950">
      {/* Sidebar */}
      <aside className="w-44 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-3 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-800 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M5 5v12M19 5v12M3 13h18" />
              </svg>
            </div>
            <div>
              <div className="text-green-100 font-bold text-xs tracking-wide">GATESIGHT</div>
              <div className="text-gray-600 text-[8px] uppercase tracking-wider">Admin Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {navItems.map((item) => {
            const active = page === item.key;
            const badge =
              item.key === 'applications' && pendingReview > 0 ? pendingReview :
              item.key === 'unknown' && pendingUnknown > 0 ? pendingUnknown : 0;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  active ? 'bg-green-800/30 text-green-300 border border-green-800/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {badge > 0 && (
                  <span className="bg-amber-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-2 py-2 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-green-800 flex items-center justify-center text-green-100 font-bold text-[10px]">
              {session.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-gray-300 font-medium truncate">{session.name}</div>
              <div className="text-[8px] text-gray-600">{session.username}</div>
            </div>
          </div>
          <button
            onClick={() => logout('ADMIN_DESKTOP')}
            className="w-full text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800/50"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {page === 'monitoring' && <AdminLiveMonitoring />}
        {page === 'applications' && <AdminApplications />}
        {page === 'gatepasses' && <AdminGatePasses />}
        {page === 'unknown' && <AdminUnknownVerification />}
        {page === 'vehicles' && <AdminVehicles />}
        {page === 'events' && <AdminEvents />}
        {page === 'cameras' && <AdminCameraConfig />}
        {page === 'users' && <AdminUsers />}
        {page === 'audit' && <AdminAuditLogs />}
        {page === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}
