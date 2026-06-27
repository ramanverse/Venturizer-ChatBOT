import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [view, setView] = useState('landing');
  const [token, setToken] = useState(() => localStorage.getItem('venturizer_token'));
  const [showChat, setShowChat] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('venturizer_token');
    setToken(null);
    setView('landing');
  };

  if (view === 'dashboard') {
    return token
      ? <Dashboard token={token} onLogout={handleLogout} onBackToSite={() => setView('landing')} />
      : <Login onLoginSuccess={(t) => { setToken(t); setView('dashboard'); }} onBack={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 h-[56px] bg-[#0A0A0A] border-b border-[#141414] flex justify-between items-center px-8 z-30">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[13px] font-bold text-[#E8533A]">V</span>
          <span className="font-sans text-[10px] tracking-[3px] font-bold text-[#F5F5F5] uppercase">VENTURIZER</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView('dashboard')}
            className="font-sans text-[10px] tracking-widest text-[#666] hover:text-[#F5F5F5] transition-colors uppercase"
          >
            Dashboard
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="border border-[#222] px-4 py-1.5 font-sans text-[10px] tracking-widest hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-all rounded-sm uppercase"
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* Offset fixed nav */}
      <div className="h-[56px]" />

      {/* ── Hero — full viewport ── */}
      <section className="flex-1 min-h-[calc(100vh-56px)] flex flex-col items-center justify-center text-center px-8 anim-fade-up">
        <div className="mb-8">
          <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#555] border border-[#1A1A1A] py-1.5 px-3 rounded-sm">
            VENTURE CAPABILITY ECOSYSTEM
          </span>
        </div>

        <h1 className="font-sans font-bold text-[52px] leading-[1.1] tracking-[-1.5px] max-w-[640px] mb-6 text-[#F5F5F5]">
          Bridging Founders<br />
          <span className="text-[#E8533A]">and Capital.</span>
        </h1>

        <p className="text-[#555] text-[14px] leading-[1.8] max-w-[420px] mb-10">
          We support founders in their 0–100 Crore journey.<br />
          Apply below or speak with our qualification assistant.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setShowChat(true)}
            className="px-6 py-3 bg-[#F5F5F5] text-[#0A0A0A] font-sans text-[11px] tracking-widest hover:bg-white transition-colors rounded-sm uppercase font-bold"
          >
            Apply Now →
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="px-6 py-3 border border-[#1A1A1A] text-[#555] font-sans text-[11px] tracking-widest hover:text-[#F5F5F5] hover:border-[#333] transition-all rounded-sm uppercase"
          >
            Dashboard
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1A1A1A] px-8 py-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] font-bold text-[#E8533A]">V</span>
            <span className="font-sans text-[10px] tracking-[2px] font-bold text-[#333] uppercase">Venturizer</span>
          </div>
          <p className="font-sans text-[9px] text-[#333] tracking-widest uppercase">
            © 2026 Venturizer. All rights reserved.
          </p>
          <a
            href="mailto:connect@venturizer.in"
            className="font-sans text-[10px] text-[#444] hover:text-[#F5F5F5] tracking-wide transition-colors"
          >
            connect@venturizer.in
          </a>
        </div>
      </footer>

      {/* ── Floating Qualify Now button ── */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 h-[44px] px-6 bg-[#F5F5F5] text-[#0A0A0A] font-sans text-[11px] font-bold tracking-widest hover:bg-white transition-all z-30 rounded-full anim-ring-pulse"
        >
          Qualify Now ↗
        </button>
      )}

      {/* ── Chatbot Modal ── */}
      {showChat && (
        <ChatWidget onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
