import React, { useState } from 'react';

export default function Login({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/dashboard/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      localStorage.setItem('venturizer_token', data.token);
      onLoginSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/dashboard/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@venturizer.co', password: 'adminpassword' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      localStorage.setItem('venturizer_token', data.token);
      onLoginSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center font-sans relative select-none">
      {/* Back Link */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-8 font-sans text-[12px] font-semibold text-[#94A3B8] hover:text-[#0F1D35] transition-colors bg-transparent border-none cursor-pointer uppercase tracking-wider"
      >
        ← Back to Site
      </button>

      {/* Card */}
      <div className="w-[380px] bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg p-10 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        {/* Logo */}
        <div className="text-center">
          <span className="font-sans text-[28px] font-black text-[#D64235] block mb-1">V</span>
          <span className="font-sans text-[12px] tracking-[3px] font-bold text-[#0F1D35] uppercase block">VENTURIZER ERP</span>
          <span className="font-sans text-[11px] text-[#94A3B8] block mt-1">Internal Admin Console</span>
        </div>

        {/* Divider */}
        <div className="border-b border-[#E4E7EC] my-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Email</label>
            <input
              className="vz-input w-full"
              type="email"
              placeholder="admin@venturizer.co"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Password</label>
            <input
              className="vz-input w-full"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="font-sans text-[11px] text-[#D64235] tracking-wider font-semibold">✗ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] bg-[#0F1D35] text-white font-sans text-[12px] font-semibold tracking-widest uppercase hover:bg-[#1B2B4B] transition-colors disabled:opacity-50 rounded-sm cursor-pointer border-none"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo access */}
        <div className="mt-5 text-center">
          <button
            onClick={handleDemo}
            disabled={loading}
            className="font-sans text-[12px] text-[#94A3B8] hover:text-[#0F1D35] transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            Demo Access →
          </button>
        </div>

        <p className="text-center font-sans text-[11px] text-[#CBD5E1] tracking-widest mt-6 uppercase">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
