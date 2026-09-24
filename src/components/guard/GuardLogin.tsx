import { useState } from 'react';
import { useStore } from '../../store/StoreContext';

export function GuardLogin() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(username, password, 'GUARD_PHONE');
    if (!user) {
      setError('Invalid username or password');
    }
  };

  const quickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
    const user = login(u, p, 'GUARD_PHONE');
    if (!user) setError('Login failed');
  };

  return (
    <div className="h-full bg-gradient-to-b from-green-950 to-gray-950 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 flex flex-col items-center">
        <div className="w-14 h-14 rounded-xl bg-green-800 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M5 5v12M19 5v12M3 13h18" />
          </svg>
        </div>
        <h1 className="text-green-100 font-bold text-lg tracking-wide">GATESIGHT</h1>
        <p className="text-green-700 text-[10px] uppercase tracking-widest mt-1">Guard Application</p>
      </div>

      {/* Login form */}
      <div className="flex-1 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] text-green-700 uppercase tracking-wider font-semibold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-700 text-green-100 text-sm rounded-lg px-3 py-2.5 mt-1 focus:outline-none focus:border-green-600 placeholder-gray-600"
              placeholder="Guard01"
            />
          </div>
          <div>
            <label className="text-[10px] text-green-700 uppercase tracking-wider font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-700 text-green-100 text-sm rounded-lg px-3 py-2.5 mt-1 focus:outline-none focus:border-green-600 placeholder-gray-600"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Quick login buttons */}
        <div className="mt-6">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 text-center">Demo Accounts</div>
          <div className="space-y-2">
            {[
              { u: 'Guard01', p: 'guard', label: 'Guard01' },
              { u: 'Guard02', p: 'guard', label: 'Guard02' },
              { u: 'Guard03', p: 'guard', label: 'Guard03' },
            ].map((acc) => (
              <button
                key={acc.u}
                onClick={() => quickLogin(acc.u, acc.p)}
                className="w-full bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800 text-gray-300 text-xs py-2 rounded-lg transition-colors flex items-center justify-between px-3"
              >
                <span>{acc.label}</span>
                <span className="text-gray-600">Tap to sign in</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pb-4 text-[8px] text-gray-700 uppercase tracking-widest">
        Prototype Simulation
      </div>
    </div>
  );
}
