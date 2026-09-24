import { useStore } from '../../../store/StoreContext';

export function AdminUsers() {
  const { state } = useStore();

  const roleColor = (role: string) => role === 'ADMINISTRATOR' ? 'text-green-400 bg-green-950/40 border-green-800/40' : 'text-blue-400 bg-blue-950/40 border-blue-800/40';

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Users & Roles</h2>

      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Roles & Permissions</div>
        <div className="space-y-2">
          <div className="text-[11px]">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${roleColor('ADMINISTRATOR')} mr-2`}>ADMINISTRATOR</span>
            <span className="text-gray-400">Full system access — approvals, camera config, users, settings, audit logs, unknown verification</span>
          </div>
          <div className="text-[11px]">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${roleColor('GUARD')} mr-2`}>GUARD</span>
            <span className="text-gray-400">Applications, vehicle registration, sticker issuance, vehicle search, contact records</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Users ({state.users.length})</div>

      <div className="space-y-2">
        {state.users.map((user) => (
          <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${user.role === 'ADMINISTRATOR' ? 'bg-green-800 text-green-100' : 'bg-blue-800 text-blue-100'}`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-gray-200 font-medium">{user.name}</div>
                  <div className="text-[10px] text-gray-600">@{user.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${roleColor(user.role)}`}>{user.role}</span>
                <span className={`text-[9px] ${user.active ? 'text-green-400' : 'text-gray-600'}`}>{user.active ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
