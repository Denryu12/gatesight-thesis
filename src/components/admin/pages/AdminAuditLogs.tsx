import { useState } from 'react';
import { useStore } from '../../../store/StoreContext';

export function AdminAuditLogs() {
  const { state } = useStore();
  const [search, setSearch] = useState('');

  const logs = state.auditLogs.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return a.who.toLowerCase().includes(s) || a.what.toLowerCase().includes(s) || a.target.toLowerCase().includes(s);
  });

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-100">Audit Log</h2>
      <p className="text-[10px] text-gray-500">Meaningful human/admin actions — separate from operational Event Log.</p>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by who, what, or target..."
        className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 placeholder-gray-700" />

      {logs.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-sm bg-gray-900/30 rounded-lg border border-gray-800">No audit entries found.</div>
      ) : (
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr className="text-left text-gray-500">
                <th className="px-2 py-1.5 font-medium">When</th>
                <th className="px-2 py-1.5 font-medium">Who</th>
                <th className="px-2 py-1.5 font-medium">What</th>
                <th className="px-2 py-1.5 font-medium">Target</th>
                <th className="px-2 py-1.5 font-medium">Resulting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/30">
                  <td className="px-2 py-1.5 text-gray-400">{log.when}</td>
                  <td className="px-2 py-1.5 text-gray-300 font-medium">{log.who}</td>
                  <td className="px-2 py-1.5 text-gray-200">{log.what}</td>
                  <td className="px-2 py-1.5 text-gray-400 font-mono">{log.target}</td>
                  <td className="px-2 py-1.5 text-gray-500">{log.resultingStatus || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
