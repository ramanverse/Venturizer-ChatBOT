import React, { useState, useEffect } from 'react';

const BUCKET_LABEL = { hot: 'HOT', good: 'GOOD', maybe: 'MAYBE', low: 'LOW' };
const BUCKET_CLASS = { hot: 'tag-alist', good: 'tag-tierb', maybe: 'tag-waiting', low: 'tag-archive' };
const STATUS_OPTIONS = ['new', 'contacted', 'enrolled', 'rejected'];
const STATUS_LABEL = { new: 'NEW', contacted: 'CONTACTED', rejected: 'REJECTED', enrolled: 'ENROLLED' };

const BREAKDOWN_MAP = {
  mvpStatus: 'MVP Status',
  traction: 'Paying Customers',
  mrrBonus: 'MRR Bonus',
  team: 'Team Size',
  fundingStage: 'Funding Stage',
  validation: 'Validation Evidence',
  backgroundTextQuality: 'Answer Quality',
  stageFocus: 'Stage Focus',
  chequeSize: 'Cheque Size',
  activeDeployment: 'Active Deployment',
  dealVolume: 'Deal Volume',
  supportValue: 'Support Value',
  thesisInterestTextQuality: 'Answer Quality',
};

export default function LeadProfile({ lead, token, onClose, onStatusChange }) {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState(lead.status || 'new');
  const [notes, setNotes]       = useState(lead.notes || '');
  const [noteSaved, setNoteSaved] = useState(false);
  const [updating, setUpdating]  = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/dashboard/leads/${lead.id}`, { headers });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        if (active) {
          setProfile(data);
          setStatus(data.status || 'new');
          setNotes(data.notes || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [lead.id, token]);

  const handleStatus = async (val) => {
    setStatus(val);
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5001/api/dashboard/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: val }),
      });
      if (res.ok) onStatusChange?.(lead.id, val);
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/dashboard/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
      }
    } catch (e) { console.error(e); }
  };

  const answers = profile?.session_answers || lead.session_answers || {};

  const Row = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
    return (
      <div className="flex gap-4 py-3 border-b border-[#1A1A1A]">
        <span className="font-mono text-[9px] tracking-widest text-[#444] w-36 shrink-0 pt-0.5">{label.toUpperCase()}</span>
        <span className="text-sm text-[#888] break-all">{displayValue}</span>
      </div>
    );
  };

  const PillBadges = ({ items }) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <span key={item} className="pill-label text-[8px] py-1 px-3">{item}</span>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[550px] bg-[#0A0A0A] border-l border-[#1A1A1A] z-50 flex flex-col anim-slide-in overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#1A1A1A] px-6 py-4 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#141414] border border-[#1A1A1A] flex items-center justify-center rounded-sm">
              <span className="font-sans text-sm font-bold text-[#444]">
                {(lead.full_name || '?').substring(0, 1).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F5F5]">{lead.full_name || '—'}</h2>
              <span className="type-pill">{(lead.user_type || '—').toUpperCase()}</span>
            </div>
          </div>
          <button onClick={onClose} className="font-sans text-[#444] hover:text-white text-xl transition-colors leading-none">✕</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="label-bracket mb-3">LOADING PROFILE</div>
              <div className="font-mono text-[9px] text-[#3a4a6a] tracking-widest anim-pulse">Reading records...</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Score + Status */}
            <div className="vz-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="label-bracket mb-2">SCORE</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#f0f0f0]">{profile?.qualification_score ?? lead.qualification_score ?? '—'}</span>
                    <span className="font-mono text-[10px] text-[#2a3a5c]">/100</span>
                  </div>
                  <span className={`tag mt-2 inline-block ${BUCKET_CLASS[profile?.score_bucket || lead.score_bucket] || 'tag-archive'}`}>
                    {BUCKET_LABEL[profile?.score_bucket || lead.score_bucket] || '—'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="label-bracket mb-2">STATUS</div>
                  <div className="seg-pills">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatus(s)}
                        disabled={updating}
                        className={`seg-pill text-[7px] ${status === s ? 'active' : ''}`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                  {updating && <span className="font-mono text-[8px] text-[#3a4a6a] block mt-1">saving...</span>}
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            {profile?.scoreBreakdown?.score_components && (
              <div>
                <div className="label-bracket mb-3">SCORE BREAKDOWN</div>
                <div className="vz-card">
                  {Object.entries(profile.scoreBreakdown.score_components)
                    .filter(([key]) => key !== 'textFields')
                    .map(([key, points]) => (
                    <div key={key} className="flex justify-between items-center px-4 py-3 border-b border-[#1A1A1A] last:border-0">
                      <span className="font-sans text-[10px] text-[#666] tracking-wider">
                        {BREAKDOWN_MAP[key] || key}
                      </span>
                      <span className={`font-mono text-xs font-bold ${ points > 0 ? 'text-[#F5F5F5]' : 'text-[#444]'}`}>
                        {points > 0 ? `+${points}` : points}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-4 py-3 bg-[#141414]">
                    <span className="font-sans text-[10px] text-[#888] tracking-wider font-bold uppercase">TOTAL</span>
                    <span className="font-mono text-sm font-black text-[#F5F5F5]">{profile?.qualification_score ?? '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact */}
            <div>
              <div className="label-bracket mb-3">CONTACT INFORMATION</div>
              <div>
                <Row label="Email" value={profile?.email || lead.email} />
                <Row label="Phone" value={profile?.phone || lead.phone} />
                <Row label="LinkedIn" value={profile?.linkedin_url || lead.linkedin_url} />
              </div>
            </div>

            {/* Founder / Investor details */}
            {lead.user_type === 'founder' ? (
              <div>
                <div className="label-bracket mb-3">FOUNDER PROFILE</div>
                <div>
                  <Row label="Startup Name" value={answers.startup_name} />
                  <Row label="Sector" value={answers.sector} />
                  <Row label="Problem" value={answers.problem_statement} />
                  <Row label="Solution" value={answers.solution} />
                  <Row label="MVP Status" value={answers.mvp_status} />
                  <Row label="Paying Customers" value={answers.has_paying_customers} />
                  <Row label="Customer Count" value={answers.customer_count} />
                  <Row label="MRR" value={answers.mrr ? `${answers.mrr} ${answers.mrr_currency || 'INR'}` : ''} />
                  <Row label="Traction" value={answers.traction_metric} />
                  <Row label="Co-founders" value={answers.co_founder_count} />
                  <Row label="Team Background" value={answers.team_background} />
                  <Row label="Funding Ask" value={answers.funding_ask ? `${answers.funding_ask} ${answers.funding_ask_currency || 'INR'}` : ''} />
                  <Row label="Funding Stage" value={answers.funding_stage} />
                  <Row label="Raised Before" value={answers.previous_funding} />
                  <Row label="Funding Details" value={answers.previous_funding_details} />
                  {Array.isArray(answers.validation_types) && answers.validation_types.length > 0 && (
                    <div className="py-3 border-b border-[#111a30]">
                      <span className="font-mono text-[9px] tracking-widest text-[#3a4a6a] block mb-2">VALIDATIONS</span>
                      <PillBadges items={answers.validation_types} />
                    </div>
                  )}
                  <Row label="Pitch / Fit" value={answers.pitch_statement} />
                </div>
              </div>
            ) : (
              <div>
                <div className="label-bracket mb-3">INVESTOR PROFILE</div>
                <div>
                  <Row label="Fund Name" value={answers.fund_name} />
                  {Array.isArray(answers.sectors) && answers.sectors.length > 0 && (
                    <div className="py-3 border-b border-[#111a30]">
                      <span className="font-mono text-[9px] tracking-widest text-[#3a4a6a] block mb-2">TARGET SECTORS</span>
                      <PillBadges items={answers.sectors} />
                    </div>
                  )}
                  <Row label="Stage Focus" value={answers.stage_focus} />
                  <Row label="Thesis" value={answers.investment_thesis} />
                  <Row label="Cheque Size" value={answers.cheque_size ? `${answers.cheque_size} ${answers.cheque_size_currency || 'INR'}` : ''} />
                  <Row label="Deals (2 yrs)" value={answers.deals_last_2_years} />
                  <Row label="Portfolio" value={answers.portfolio_companies} />
                  <Row label="Round Pref" value={answers.round_preference} />
                  {Array.isArray(answers.support_types) && answers.support_types.length > 0 && (
                    <div className="py-3 border-b border-[#111a30]">
                      <span className="font-mono text-[9px] tracking-widest text-[#3a4a6a] block mb-2">SUPPORT TYPES</span>
                      <PillBadges items={answers.support_types} />
                    </div>
                  )}
                  <Row label="Involvement" value={answers.involvement_level} />
                  <Row label="Deploying" value={answers.active_deployment} />
                  <Row label="Target Deals" value={answers.target_deals_6_months} />
                  <Row label="Interest" value={answers.venturizer_interest} />
                </div>
              </div>
            )}

            {/* Email History */}
            {profile?.emails && profile.emails.length > 0 && (
              <div>
                <div className="label-bracket mb-3">EMAIL HISTORY</div>
                <div className="space-y-2">
                  {profile.emails.map((e) => (
                    <div key={e.id} className="vz-card p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-[9px] text-[#3a4a6a] tracking-widest">{e.to_address}</span>
                        <span className="font-mono text-[8px] text-[#2a3a5c]">{new Date(e.sent_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#8b9cc7] mb-2">{e.subject}</p>
                      <pre className="font-mono text-[9px] text-[#4a5a7a] leading-relaxed whitespace-pre-wrap bg-[#060912] border border-[#111a30] p-3 max-h-24 overflow-auto">
                        {e.body}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div className="label-bracket mb-3">INTERNAL NOTES</div>
              <textarea
                className="vz-input resize-none h-24 leading-relaxed"
                placeholder="Add internal notes about this lead..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button onClick={handleSaveNotes} className="font-mono text-[10px] tracking-widest text-[#4a5a7a] hover:text-white transition-colors">
                  {noteSaved ? 'SAVED ✓' : 'SAVE NOTES'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Panel footer */}
        <div className="border-t border-[#1A1A1A] px-6 py-3 flex justify-between items-center shrink-0">
          <span className="font-sans text-[8px] text-[#222] tracking-widest uppercase">Venturizer Lead Engine v1.0</span>
          <span className="font-sans text-[9px] text-[#444] tracking-widest uppercase">{STATUS_LABEL[status] || status?.toUpperCase()}</span>
        </div>
      </div>
    </>
  );
}
