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
    <div className="min-h-screen bg-[#FFFFFF] text-[#4A5568] flex flex-col font-sans select-none justify-between">

      {/* ── Navbar (fixed, 60px) ── */}
      <nav className="fixed top-0 left-0 right-0 h-[60px] bg-[#FFFFFF] border-b border-[#E4E7EC] flex justify-between items-center px-8 z-30">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[16px] font-black text-[#D64235]">V</span>
          <span className="font-sans text-[13px] tracking-[2px] font-bold text-[#1B2B4B] uppercase">VENTURIZER</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView('dashboard')}
            className="font-sans text-[13px] font-medium text-[#4A5568] hover:text-[#0F1D35] transition-colors bg-transparent border-none cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="bg-[#0F1D35] text-[#FFFFFF] hover:bg-[#1B2B4B] px-5 py-2 font-sans text-[12px] font-semibold transition-colors rounded-sm uppercase tracking-wider cursor-pointer border-none"
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* Spacer to offset fixed nav */}
      <div className="h-[60px]" />

      {/* ── Hero Section (100vh) ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20 bg-[#FFFFFF] max-w-[700px] mx-auto anim-fade-up">
        <div>
          <span className="pill-label">
            VENTURE CAPABILITY ECOSYSTEM
          </span>
        </div>

        <h1 className="font-sans font-bold text-[52px] leading-[1.1] tracking-[-1.5px] text-[#0F1D35] mt-6 mb-6">
          Bridging Founders<br />
          <span className="text-[#D64235]">and Capital.</span>
        </h1>

        <p className="text-[#4A5568] text-[15px] leading-[1.8] max-w-[500px] mb-9">
          We support founders in their 0–100 Crore journey.
          Apply below or speak with our qualification assistant.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowChat(true)}
            className="px-6 py-3 bg-[#0F1D35] text-[#FFFFFF] font-sans text-[12px] font-semibold tracking-wider hover:bg-[#1B2B4B] transition-colors rounded-sm uppercase cursor-pointer border-none"
          >
            Apply Now →
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="px-6 py-3 border border-[#CBD5E1] text-[#4A5568] font-sans text-[12px] font-semibold tracking-wider hover:border-[#0F1D35] hover:text-[#0F1D35] transition-all rounded-sm uppercase cursor-pointer bg-white"
          >
            Dashboard
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0F1D35] text-[#FFFFFF] px-8 py-10 w-full shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[16px] font-black text-[#D64235]">V</span>
            <span className="font-sans text-[13px] tracking-[2px] font-bold text-[#FFFFFF] uppercase">VENTURIZER</span>
          </div>
          <p className="font-sans text-[11px] text-[#94A3B8] text-center">
            © 2026 Venturizer. All rights reserved.
          </p>
          <a href="mailto:connect@venturizer.in" className="font-sans text-[12px] text-[#94A3B8] hover:text-[#FFFFFF] transition-colors">
            connect@venturizer.in
          </a>
        </div>
      </footer>

      {/* ── Trigger button (floating bottom-right) ── */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-[160px] h-[44px] bg-[#0F1D35] text-[#FFFFFF] font-sans text-[13px] font-semibold tracking-wider hover:bg-[#1B2B4B] transition-all z-30 rounded-full flex items-center justify-center anim-ring-pulse border-none cursor-pointer"
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
