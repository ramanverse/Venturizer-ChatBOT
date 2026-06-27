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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">
      {/* Back */}
      <button onClick={onBack} className="absolute top-6 left-8 font-sans text-[10px] text-[#444] hover:text-[#F5F5F5] transition-colors uppercase tracking-wider">
        ← Back to Site
      </button>

      <div className="w-full max-w-[360px] px-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-sans text-[20px] font-black text-[#E8533A]">V</span>
            <span className="font-sans text-[11px] tracking-[3px] font-bold text-[#F5F5F5] uppercase">VENTURIZER</span>
          </div>
          <p className="font-sans text-[10px] text-[#444] tracking-widest uppercase">Internal Operators Console</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label-bracket block mb-2">Email</label>
            <input
              className="vz-input"
              type="email"
              placeholder="admin@venturizer.co"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label-bracket block mb-2">Password</label>
            <input
              className="vz-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="font-sans text-[11px] text-[#E8533A] tracking-wider">✗ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F5F5F5] text-[#0A0A0A] font-sans text-[11px] font-bold tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50 rounded-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        {/* Demo access */}
        <div className="mt-6 text-center">
          <button
            onClick={handleDemo}
            disabled={loading}
            className="font-sans text-[10px] text-[#444] hover:text-[#F5F5F5] transition-colors uppercase tracking-wider"
          >
            Demo Access →
          </button>
        </div>

        <p className="text-center font-sans text-[9px] text-[#222] tracking-widest mt-12 uppercase">
          Venturizer ERP · Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
