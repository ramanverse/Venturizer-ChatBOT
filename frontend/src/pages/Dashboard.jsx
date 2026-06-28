import React, { useState, useEffect } from 'react';

export default function Dashboard({ token, onLogout, onBackToSite }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(
        `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}:${String(now.getUTCSeconds()).padStart(2,'0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#4A5568] flex font-sans select-none">

      {/* ── Sidebar (220px fixed) ── */}
      <aside className="w-[220px] bg-[#0F1D35] border-r border-white/10 flex flex-col py-5 shrink-0 z-20">
        {/* Top brand */}
        <div className="px-6 pb-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToSite}>
            <span className="font-sans text-[16px] font-black text-[#D64235]">V</span>
            <span className="font-sans text-[11px] tracking-[2px] font-bold text-white uppercase">VENTURIZER</span>
          </div>
          <span className="font-sans text-[10px] font-semibold text-white/50 bg-white/10 px-1.5 py-0.5 rounded-sm">ERP</span>
        </div>

        {/* Navigation placeholder space */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="h-9 px-3 flex items-center gap-3 text-white border-l-2 border-[#D64235] bg-white/5 rounded-sm">
            <span className="text-[13px] font-semibold">Console View</span>
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="px-4 border-t border-white/10 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse" />
            <span className="font-sans text-[11px] font-medium text-white/70">System online</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full h-9 flex items-center justify-center gap-2 text-white/50 hover:text-white rounded-sm border border-white/10 hover:bg-white/5 transition-all text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
            title="Logout"
          >
            <span>Logout ↗</span>
          </button>
          <span className="font-mono text-[9px] text-white/20 tracking-widest text-center uppercase block">ERP version 1.0</span>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F7F8FA]">

        {/* Top bar (56px tall) */}
        <header className="h-[56px] bg-[#FFFFFF] border-b border-[#E4E7EC] px-8 flex justify-between items-center shrink-0">
          <h1 className="text-[15px] font-semibold tracking-wide text-[#0F1D35]">
            VENTURIZER ERP
          </h1>
          <div className="flex items-center gap-3 select-none">
            <span className="w-2 h-2 rounded-full bg-[#16803C] anim-pulse" />
            <span className="font-mono text-[11px] text-[#94A3B8] tracking-wider uppercase font-semibold">Live</span>
            <span className="font-mono text-[11px] text-[#CBD5E1] font-semibold">{utcTime} UTC</span>
          </div>
        </header>

        {/* Empty dashboard canvas inside the frame */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center p-10 bg-white border border-[#E4E7EC] rounded-lg max-w-md shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <span className="font-sans text-[20px] font-bold text-[#0F1D35] block mb-2">Main Panel Cleared</span>
            <p className="text-[13px] text-[#6B7280] leading-relaxed">
              As requested, all widgets, analytics modules, and record views have been removed. Only the main ERP console frame remains active.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
