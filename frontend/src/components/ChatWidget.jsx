import React, { useState, useEffect } from 'react';
import { founderFlow } from '../flows/founderFlow';
import { investorFlow } from '../flows/investorFlow';

/* ─── Bucket display maps ───────────────────────── */
const BUCKET_LABEL = { hot: 'HOT', good: 'GOOD', maybe: 'MAYBE', low: 'LOW' };
const RESULT_MSG   = {
  hot:   'Great fit. Our team reaches out within 24 hours.',
  good:  'Looks promising. Expect to hear from us in 3–5 days.',
  maybe: 'We\'d love to learn more. We\'ll be in touch.',
  low:   'Thank you. We\'ll keep your profile on file.',
};

const API = 'http://localhost:5001/api/leads';

const optLabel = (o) => (typeof o === 'object' ? o.label : o);
const optValue = (o) => (typeof o === 'object' ? o.value : o);

function validate(q, val) {
  if (!val && q.required) return 'This field is required.';
  if (q.validation?.pattern && val && !q.validation.pattern.test(val.trim())) {
    return q.validation.message || 'Invalid input.';
  }
  return '';
}

/* ─── Header progress bar ─── */
function ProgressBar({ step, total, section }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="w-full shrink-0">
      {/* 3px height bar */}
      <div className="h-[3px] bg-[#F0F2F5] w-full">
        <div className="h-full bg-[#D64235] transition-all duration-350" style={{ width: `${pct}%` }} />
      </div>
      <div className="px-5 py-2 border-b border-[#E4E7EC]">
        <span className="font-sans text-[10px] text-[#94A3B8] tracking-widest uppercase">
          {section} · Q {step + 1} OF {total}
        </span>
      </div>
    </div>
  );
}

/* ─── Question Card ─────────────────────────────── */
function QuestionCard({ q, answers, onAnswer, onNext, onBack, step, total }) {
  const existing = answers[q.id] ?? '';
  const [val,      setVal]      = useState(existing);
  const [multiSel, setMultiSel] = useState(Array.isArray(existing) ? existing : []);
  const [amount,   setAmount]   = useState(answers[q.id] ?? '');
  const [currency, setCurrency] = useState(answers[q.id + '_currency'] ?? 'INR');
  
  // Conditional customer states
  const [hasCust,  setHasCust]  = useState(answers['has_paying_customers'] ?? null);
  const [custCount,setCustCount]= useState(answers['customer_count'] ?? '');
  const [mrr,      setMrr]      = useState(answers['mrr'] ?? '');
  const [mrrCur,   setMrrCur]   = useState(answers['mrr_currency'] ?? 'INR');

  // Conditional funding states
  const [hasFund,  setHasFund]  = useState(answers['previous_funding'] ?? null);
  const [fundDet,  setFundDet]  = useState(answers['funding_details'] ?? '');
  
  const [error,    setError]    = useState('');

  const commit = (value) => {
    const err = validate(q, value);
    if (err) { setError(`✗ ${err}`); return; }
    setError('');
    onAnswer(q.id, value);
    onNext();
  };

  const commitText = () => commit(typeof val === 'string' ? val.trim() : val);

  const toggleMulti = (opt) => {
    const v = optValue(opt);
    setMultiSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const commitMulti = () => {
    if (q.required && multiSel.length === 0) { setError('✗ Please select at least one option.'); return; }
    setError('');
    onAnswer(q.id, multiSel);
    onNext();
  };

  const commitCurrency = () => {
    if (!amount) { setError('✗ Please enter an amount.'); return; }
    setError('');
    onAnswer(q.id, amount);
    onAnswer(q.id + '_currency', currency);
    onNext();
  };

  const NavFooter = ({ onContinue }) => (
    <div className="flex justify-between items-center mt-auto pt-5 border-t border-[#E4E7EC]">
      <button onClick={onBack} className="font-sans text-[12px] text-[#94A3B8] hover:text-[#0F1D35] transition-colors bg-transparent border-none cursor-pointer">
        ← Back
      </button>
      <button 
        onClick={onContinue || commitText} 
        className="font-sans text-[12px] text-[#0F1D35] font-semibold hover:text-[#1B2B4B] transition-colors bg-transparent border-none cursor-pointer"
      >
        Continue →
      </button>
    </div>
  );

  /* Render Header helper */
  const renderQHeader = () => (
    <div className="mb-5">
      <div className="flex justify-between items-center text-[10px] font-medium">
        <span className="text-[#94A3B8]">Q {String(step + 1).padStart(2, '0')}</span>
        <span className="text-[#CBD5E1] uppercase tracking-wider font-bold">{q.section}</span>
      </div>
      <p className="text-[16px] text-[#0F1D35] font-semibold leading-[1.5] mt-3">{q.question}</p>
    </div>
  );

  /* ── select (single choice) ── */
  if (q.type === 'select') {
    return (
      <div className="flex-1 flex flex-col justify-between p-5 bg-[#FFFFFF]">
        <div>
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt) => {
              const lbl = optLabel(opt);
              const v   = optValue(opt);
              const selected = answers[q.id] === v;
              return (
                <button
                  key={v}
                  onClick={() => { onAnswer(q.id, v); onNext(); }}
                  className={`w-full text-left text-[13px] p-[10px_14px] border transition-all rounded-sm cursor-pointer ${
                    selected
                      ? 'border-[#0F1D35] text-[#0F1D35] bg-[#F0F2F5] font-medium'
                      : 'border-[#E4E7EC] text-[#4A5568] bg-[#FFFFFF] hover:border-[#94A3B8] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
        <NavFooter onContinue={() => {
          if (!answers[q.id]) { setError('✗ Please select an option.'); return; }
          onNext();
        }} />
      </div>
    );
  }

  /* ── multiselect ── */
  if (q.type === 'multiselect') {
    return (
      <div className="flex-1 flex flex-col justify-between p-5 bg-[#FFFFFF]">
        <div>
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt) => {
              const lbl = optLabel(opt);
              const v   = optValue(opt);
              const selected = multiSel.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => toggleMulti(v)}
                  className={`w-full text-left text-[13px] p-[10px_14px] border transition-all rounded-sm relative cursor-pointer ${
                    selected
                      ? 'border-[#0F1D35] text-[#0F1D35] bg-[#F0F2F5] font-medium'
                      : 'border-[#E4E7EC] text-[#4A5568] bg-[#FFFFFF] hover:border-[#94A3B8] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <span>{lbl}</span>
                  {selected && <span className="absolute top-2 right-2 text-[#D64235] text-[10px] font-bold">✓</span>}
                </button>
              );
            })}
          </div>
          {error && <p className="text-[11px] text-[#D64235] mt-2 font-medium">{error}</p>}
        </div>
        <NavFooter onContinue={commitMulti} />
      </div>
    );
  }

  /* ── currency_amount ── */
  if (q.type === 'currency_amount') {
    return (
      <div className="flex-1 flex flex-col justify-between p-5 bg-[#FFFFFF]">
        <div>
          {renderQHeader()}
          <div className="flex items-center border border-[#E4E7EC] rounded-sm bg-[#FFFFFF] relative px-3">
            <input
              className="bg-transparent border-none text-[#0F1D35] text-[14px] py-[10px] w-full focus:outline-none"
              type="number"
              placeholder={q.placeholder || '0'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
            {/* Currency toggle pill */}
            <div className="flex border border-[#E4E7EC] rounded-sm bg-[#FFFFFF] text-[10px] font-semibold overflow-hidden shrink-0">
              {['INR', 'USD'].map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 cursor-pointer transition-colors border-none ${
                    currency === c ? 'bg-[#0F1D35] text-white' : 'text-[#94A3B8]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[11px] text-[#D64235] mt-2 font-medium">{error}</p>}
        </div>
        <NavFooter onContinue={commitCurrency} />
      </div>
    );
  }

  /* ── conditional: paying customers ── */
  if (q.type === 'conditional_customers') {
    const isYes = hasCust === true || String(hasCust).toLowerCase() === 'true';
    return (
      <div className="flex-1 flex flex-col justify-between p-5 bg-[#FFFFFF]">
        <div className="overflow-y-auto max-h-[380px]">
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {['Yes', 'No'].map(opt => {
              const selected = hasCust !== null && ((opt === 'Yes' && isYes) || (opt === 'No' && !isYes));
              return (
                <button
                  key={opt}
                  onClick={() => {
                    const yes = opt === 'Yes';
                    setHasCust(yes);
                    onAnswer('has_paying_customers', yes);
                    if (!yes) {
                      onAnswer('customer_count', null);
                      onAnswer('mrr', null);
                      setError('');
                    }
                  }}
                  className={`w-full text-center text-[13px] p-[10px_12px] border transition-all rounded-sm cursor-pointer ${
                    selected
                      ? 'border-[#0F1D35] text-[#0F1D35] bg-[#F0F2F5] font-medium'
                      : 'border-[#E4E7EC] text-[#4A5568] bg-[#FFFFFF] hover:border-[#94A3B8] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Conditional slide-in inputs */}
          {hasCust === true && (
            <div className="space-y-4 border-t border-[#E4E7EC] pt-4 anim-fade-up">
              <div>
                <label className="label-bracket block mb-1">How many customers?</label>
                <input
                  className="vz-input"
                  type="number"
                  placeholder="e.g. 20"
                  value={custCount}
                  onChange={e => setCustCount(e.target.value)}
                />
              </div>
              <div>
                <label className="label-bracket block mb-1">Monthly Recurring Revenue (MRR)</label>
                <div className="flex items-center border border-[#E4E7EC] rounded-sm bg-white relative px-3">
                  <input
                    className="bg-transparent border-none text-[#0F1D35] text-[14px] py-[10px] w-full focus:outline-none"
                    type="number"
                    placeholder="e.g. 50000"
                    value={mrr}
                    onChange={e => setMrr(e.target.value)}
                  />
                  <div className="flex border border-[#E4E7EC] rounded-sm bg-white text-[10px] font-semibold overflow-hidden shrink-0">
                    {['INR', 'USD'].map(c => (
                      <button
                        key={c}
                        onClick={() => setMrrCur(c)}
                        className={`px-2.5 py-1 cursor-pointer transition-colors border-none ${
                          mrrCur === c ? 'bg-[#0F1D35] text-white' : 'text-[#94A3B8]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && <p className="text-[11px] text-[#D64235] mt-2 font-medium">{error}</p>}
        </div>
        <NavFooter onContinue={() => {
          if (hasCust === null) { setError('✗ Please make a choice.'); return; }
          if (hasCust === true) {
            if (!custCount || !mrr) { setError('✗ Please fill in all conditional inputs.'); return; }
            onAnswer('customer_count', custCount);
            onAnswer('mrr', mrr);
            onAnswer('mrr_currency', mrrCur);
          }
          onNext();
        }} />
      </div>
    );
  }

  /* ── conditional: previous funding ── */
  if (q.type === 'conditional_funding') {
    const isYes = hasFund === true || String(hasFund).toLowerCase() === 'true';
    return (
      <div className="flex-1 flex flex-col justify-between p-5 bg-[#FFFFFF]">
        <div className="overflow-y-auto max-h-[380px]">
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {['Yes', 'No'].map(opt => {
              const selected = hasFund !== null && ((opt === 'Yes' && isYes) || (opt === 'No' && !isYes));
              return (
                <button
                  key={opt}
                  onClick={() => {
                    const yes = opt === 'Yes';
                    setHasFund(yes);
                    onAnswer('previous_funding', yes);
                    if (!yes) {
                      onAnswer('funding_details', null);
                      setError('');
                    }
                  }}
                  className={`w-full text-center text-[13px] p-[10px_12px] border transition-all rounded-sm cursor-pointer ${
                    selected
                      ? 'border-[#0F1D35] text-[#0F1D35] bg-[#F0F2F5] font-medium'
                      : 'border-[#E4E7EC] text-[#4A5568] bg-[#FFFFFF] hover:border-[#94A3B8] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Conditional expand inline */}
          {hasFund === true && (
            <div className="space-y-2 border-t border-[#E4E7EC] pt-4 anim-fade-up">
              <label className="label-bracket block mb-1">How much and from whom?</label>
              <textarea
                className="vz-input h-[72px] resize-none"
                placeholder="e.g. Raised ₹20L from Angel Investors..."
                value={fundDet}
                onChange={e => setFundDet(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-[11px] text-[#D64235] mt-2 font-medium">{error}</p>}
        </div>
        <NavFooter onContinue={() => {
          if (hasFund === null) { setError('✗ Please make a choice.'); return; }
          if (hasFund === true) {
            if (!fundDet.trim()) { setError('✗ Please provide funding details.'); return; }
            onAnswer('funding_details', fundDet.trim());
          }
          onNext();
        }} />
      </div>
    );
  }

  /* ── textarea ── */
  if (q.type === 'textarea') {
    return (
      <div className="flex-1 flex flex-col justify-between p-5 bg-[#FFFFFF]">
        <div>
          {renderQHeader()}
          <textarea
            className="vz-input h-[72px] resize-none"
            placeholder={q.placeholder || 'Enter details...'}
            value={val}
            onChange={e => setVal(e.target.value)}
            autoFocus
          />
          {error && <p className="text-[11px] text-[#D64235] mt-2 font-medium">{error}</p>}
        </div>
        <NavFooter />
      </div>
    );
  }

  /* ── default: text / email / tel ── */
  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-[#FFFFFF]">
      <div>
        {renderQHeader()}
        <input
          className="vz-input"
          type={q.type === 'tel' ? 'tel' : q.type === 'number' ? 'number' : 'text'}
          placeholder={q.placeholder || 'Type here...'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commitText()}
          autoFocus
        />
        {error && <p className="text-[11px] text-[#D64235] mt-2 font-medium">{error}</p>}
      </div>
      <NavFooter />
    </div>
  );
}

/* ─── Welcome Screen ─── */
function WelcomeScreen({ onSelect }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center bg-[#FFFFFF]">
      {/* Red V Logomark */}
      <span className="font-sans font-black text-[40px] text-[#D64235] mb-4 select-none leading-none">V</span>

      <h2 className="text-xl font-semibold text-[#0F1D35] mb-1.5 leading-snug">Where do you fit?</h2>
      <p className="font-sans text-[13px] text-[#6B7280] mb-8">
        5 minutes. We'll handle the rest.
      </p>

      <div className="flex flex-col gap-2.5 w-full max-w-[320px]">
        <button
          onClick={() => onSelect('founder')}
          className="bg-[#FFFFFF] border border-[#E4E7EC] hover:border-[#0F1D35] p-[16px_20px] text-left transition-all rounded-md flex justify-between items-center group cursor-pointer"
        >
          <div>
            <span className="font-sans text-[10px] text-[#D64235] tracking-wider block font-bold mb-1 uppercase">FOUNDER</span>
            <span className="text-[14px] text-[#0F1D35] font-medium">I'm building a venture</span>
          </div>
          <span className="text-[#CBD5E1] group-hover:text-[#0F1D35] transition-colors text-sm font-bold">→</span>
        </button>

        <button
          onClick={() => onSelect('investor')}
          className="bg-[#FFFFFF] border border-[#E4E7EC] hover:border-[#0F1D35] p-[16px_20px] text-left transition-all rounded-md flex justify-between items-center group cursor-pointer"
        >
          <div>
            <span className="font-sans text-[10px] text-[#D64235] tracking-wider block font-bold mb-1 uppercase">INVESTOR</span>
            <span className="text-[14px] text-[#0F1D35] font-medium">I'm deploying capital</span>
          </div>
          <span className="text-[#CBD5E1] group-hover:text-[#0F1D35] transition-colors text-sm font-bold">→</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Score Result ─── */
function ScoreResult({ score, bucket, onRestart }) {
  const badgeColors = {
    hot:   'bg-[#FEF2F0] text-[#D64235] border-[#FECDC7]',
    good:  'bg-[#F0FDF4] text-[#16803C] border-[#BBF7D0]',
    maybe: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    low:   'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center anim-fade-up bg-[#FFFFFF]">
      <div className="flex items-baseline justify-center mb-4">
        <span className="text-[56px] font-bold text-[#0F1D35] leading-none">{score}</span>
        <span className="text-[18px] text-[#CBD5E1] font-bold ml-1">/100</span>
      </div>

      <span className={`tag text-[10px] uppercase font-bold tracking-widest ${badgeColors[bucket] || badgeColors.low}`}>
        {BUCKET_LABEL[bucket] || bucket}
      </span>

      <p className="text-[13px] text-[#6B7280] leading-[1.7] max-w-[280px] mt-4 font-sans text-center">
        {RESULT_MSG[bucket] || 'Thank you for your application.'}
      </p>

      <button onClick={onRestart} className="font-sans text-[12px] text-[#94A3B8] hover:text-[#0F1D35] mt-6 transition-colors underline cursor-pointer bg-transparent border-none">
        Start over
      </button>
    </div>
  );
}

/* ─── Main ChatWidget ───────────────────────────── */
export default function ChatWidget({ onClose, initialType }) {
  const [phase,      setPhase]      = useState(initialType ? 'flow' : 'welcome');
  const [leadType,   setLeadType]   = useState(initialType || null);
  const [step,       setStep]       = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [sessionId,  setSessionId]  = useState(null);
  const [result,     setResult]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');

  const flow = leadType === 'founder' ? founderFlow : (investorFlow || []);

  useEffect(() => {
    if (initialType) {
      startSession(initialType);
    }
  }, [initialType]);

  const startSession = async (type) => {
    try {
      const res = await fetch(`${API}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: type }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      return data.session_id;
    } catch (e) { console.error('Session start failed', e); }
  };

  const selectType = async (type) => {
    setLeadType(type);
    await startSession(type);
    setPhase('flow');
    setStep(0);
  };

  const handleNext = () => {
    if (step < flow.length - 1) {
      setStep(s => s + 1);
    } else {
      submitLead();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else { setPhase('welcome'); setLeadType(null); }
  };

  const submitLead = async () => {
    setSubmitting(true);
    setSubmitErr('');
    try {
      const res = await fetch(`${API}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Submission failed');
      }
      const data = await res.json();
      setResult(data);
      setPhase('result');
    } catch (e) {
      setSubmitErr(e.message || 'Something went wrong. Please try again.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setPhase('welcome'); setLeadType(null);
    setStep(0); setAnswers({}); setSessionId(null); setResult(null); setSubmitErr('');
  };

  const currentQ = phase === 'flow' ? flow[step] : null;

  return (
    <>
      {/* Backdrop — centers the modal */}
      <div 
        className="fixed inset-0 bg-[#0F1D35]/30 backdrop-blur-[2px] z-40 flex items-center justify-center"
        onClick={onClose}
      />

      {/* Widget Panel — centered */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[400px] h-[580px] max-h-[90vh] bg-[#FFFFFF] border border-[#E4E7EC] flex flex-col rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.08)] select-none pointer-events-auto transition-transform duration-280"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (52px) */}
          <div className="h-[52px] border-b border-[#E4E7EC] px-5 flex items-center justify-between shrink-0 bg-[#F7F8FA] rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-sm text-[#D64235]">V</span>
              <span className="font-sans text-[11px] tracking-[1.5px] text-[#0F1D35] font-bold uppercase">VENTURIZER</span>
              <span className="text-[11px] text-[#94A3B8] font-normal">| Lead Qualification</span>
            </div>
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F1D35] transition-colors text-sm cursor-pointer border-none bg-transparent font-bold">✕</button>
          </div>

          {/* Progress Fill Bar */}
          {phase === 'flow' && currentQ && (
            <ProgressBar step={step} total={flow.length} section={currentQ.section || 'Details'} />
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#FFFFFF] rounded-b-lg">
            {phase === 'welcome' && <WelcomeScreen onSelect={selectType} />}

            {phase === 'flow' && currentQ && (
              <QuestionCard
                key={`${step}-${currentQ.id}`}
                q={currentQ}
                answers={answers}
                onAnswer={(key, val) => {
                  setAnswers(p => ({ ...p, [key]: val }));
                  if (sessionId) {
                    fetch(`${API}/answer`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ session_id: sessionId, key, value: val }),
                    }).catch(e => console.error('Answer save failed', e));
                  }
                }}
                onNext={handleNext}
                onBack={handleBack}
                step={step}
                total={flow.length}
              />
            )}

            {submitting && (
              <div className="flex-1 flex items-center justify-center bg-[#FFFFFF]">
                <div className="text-center px-6">
                  <div className="label-bracket mb-3">PROCESSING APPLICATION</div>
                  <div className="font-sans text-[12px] text-[#94A3B8] tracking-widest anim-pulse">
                    Running qualification engine...
                  </div>
                </div>
              </div>
            )}

            {submitErr && !submitting && (
              <div className="flex-1 flex items-center justify-center px-6 bg-[#FFFFFF]">
                <div className="border border-[#E4E7EC] p-5 text-center rounded-sm">
                  <p className="font-mono text-[11px] text-[#D64235] tracking-wider mb-4">{submitErr}</p>
                  <button onClick={() => { setSubmitErr(''); submitLead(); }} className="vz-btn text-[10px] px-4 py-2">RETRY</button>
                </div>
              </div>
            )}

            {phase === 'result' && result && !submitting && (
              <ScoreResult score={result.score} bucket={result.bucket} onRestart={restart} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
