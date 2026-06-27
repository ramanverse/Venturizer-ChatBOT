import React, { useState, useEffect } from 'react';
import LeadProfile from './LeadProfile';

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
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-14 hover:w-44 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col items-center py-4 shrink-0 transition-all duration-200 group z-20">
        {/* Logo */}
        <div
          className="w-8 h-8 border border-[#1A1A1A] flex items-center justify-center mb-6 cursor-pointer rounded-sm"
          onClick={onBackToSite}
          title="Back to site"
        >
          <span className="font-sans text-[10px] font-bold text-[#E8533A]">V</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout */}
        <div className="flex flex-col items-center w-full px-2 gap-1">
          <button
            onClick={onLogout}
            className="w-full h-9 flex items-center justify-center gap-3 text-[#444] hover:text-[#888] rounded-sm border border-transparent transition-colors"
            title="Logout"
          >
            <span>↗</span>
            <span className="text-[10px] tracking-wider uppercase hidden group-hover:inline">Logout</span>
          </button>
          <span className="font-mono text-[7px] text-[#222] tracking-widest mt-2 uppercase">ERP v1.0</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">

        {/* Top bar */}
        <header className="h-[56px] border-b border-[#1A1A1A] px-8 flex justify-between items-center shrink-0">
          <h1 className="text-[13px] font-bold tracking-wider uppercase text-[#F5F5F5]">
            VENTURIZER ERP
          </h1>
          <div className="flex items-center gap-4 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 anim-pulse inline-block" />
              <span className="font-mono text-[9px] text-[#444] tracking-widest">LIVE</span>
              <span className="font-mono text-[9px] text-[#333] tracking-widest">{utcTime} UTC</span>
            </div>
          </div>
        </header>

        {/* Empty body */}
        <div className="flex-1" />

      </main>
    </div>
  );
}
