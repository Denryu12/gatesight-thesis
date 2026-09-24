import { useState } from 'react';
import { useStore } from '../../store/StoreContext';

export function AdminLogin() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(username, password, 'ADMIN_DESKTOP');
    if (!user) setError('Invalid username or password');
  };

  const quickLogin = (u: string, p: string) => {
    setError('');
    const user = login(u, p, 'ADMIN_DESKTOP');
    if (!user) setError('Login failed');
  };

  return (
    <div className="h-full bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-xs px-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-green-800 flex items-center justify-center mb-2">
            <svg className="w-7 h-7 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M5 5v12M19 5v12M3 13h18" />
            </svg>
          </div>
          <h1 className="text-green-100 font-bold text-base tracking-wide">GATESIGHT</h1>
          <p className="text-green-700 text-[9px] uppercase tracking-widest mt-0.5">Administrator Workstation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Admin01"
            className="w-full bg-gray-900 border border-gray-700 text-green-100 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-600 placeholder-gray-600"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="w-full bg-gray-900 border border-gray-700 text-green-100 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-600 placeholder-gray-600"
          />
          {error && <div className="text-red-400 text-xs">{error}</div>}
          <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold text-sm py-2.5 rounded-lg">
            Sign In
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => quickLogin('Admin01', 'admin')}
            className="w-full bg-gray-900/60 hover:bg-gray-800/60 border border-gray-800 text-gray-300 text-xs py-2 rounded-lg transition-colors flex items-center justify-between px-3"
          >
            <span>Admin01</span>
            <span className="text-gray-600">Tap to sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
