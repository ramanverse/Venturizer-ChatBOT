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
      {/* 2px red fill bar */}
      <div className="h-[2px] bg-[#1E1E1E] w-full">
        <div className="h-full bg-[#E8533A] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="px-5 py-2">
        <span className="font-sans text-[10px] text-[#444] tracking-widest uppercase">
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
    <div className="flex justify-between items-center mt-auto pt-6 border-t border-[#1A1A1A]">
      <button onClick={onBack} className="font-sans text-[12px] text-[#444] hover:text-[#F5F5F5] transition-colors">
        ← Back
      </button>
      <button 
        onClick={onContinue || commitText} 
        className="font-sans text-[12px] text-[#F5F5F5] font-medium hover:text-white transition-colors"
      >
        Continue →
      </button>
    </div>
  );

  /* Render Header helper */
  const renderQHeader = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center text-[10px] font-medium">
        <span className="text-[#333]">Q {String(step + 1).padStart(2, '0')}</span>
        <span className="text-[#444] uppercase tracking-wider">{q.section}</span>
      </div>
      <p className="text-[17px] text-[#F5F5F5] font-medium leading-[1.5] mt-[10px]">{q.question}</p>
    </div>
  );

  /* ── select (single choice) ── */
  if (q.type === 'select') {
    return (
      <div className="flex-1 flex flex-col justify-between px-[20px] py-[24px]">
        <div>
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-[6px]">
            {q.options.map((opt) => {
              const lbl = optLabel(opt);
              const v   = optValue(opt);
              const selected = answers[q.id] === v;
              return (
                <button
                  key={v}
                  onClick={() => { onAnswer(q.id, v); onNext(); }}
                  className={`w-full text-left text-[13px] p-[10px_12px] border transition-all rounded-sm ${
                    selected
                      ? 'border-[#E8533A] text-[#F5F5F5] bg-[#141414]'
                      : 'border-[#1E1E1E] text-[#666] bg-[#141414] hover:border-[#333] hover:text-[#F5F5F5]'
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
      <div className="flex-1 flex flex-col justify-between px-[20px] py-[24px]">
        <div>
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-[6px]">
            {q.options.map((opt) => {
              const lbl = optLabel(opt);
              const v   = optValue(opt);
              const selected = multiSel.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => toggleMulti(v)}
                  className={`w-full text-left text-[13px] p-[10px_12px] border transition-all rounded-sm relative ${
                    selected
                      ? 'border-[#E8533A] text-[#F5F5F5] bg-[#141414]'
                      : 'border-[#1E1E1E] text-[#666] bg-[#141414] hover:border-[#333] hover:text-[#F5F5F5]'
                  }`}
                >
                  <span>{lbl}</span>
                  {selected && <span className="absolute top-1.5 right-2 text-[#E8533A] text-[9px]">✓</span>}
                </button>
              );
            })}
          </div>
          {error && <p className="text-[11px] text-[#E8533A] mt-2">{error}</p>}
        </div>
        <NavFooter onContinue={commitMulti} />
      </div>
    );
  }

  /* ── currency_amount ── */
  if (q.type === 'currency_amount') {
    return (
      <div className="flex-1 flex flex-col justify-between px-[20px] py-[24px]">
        <div>
          {renderQHeader()}
          <div className="flex items-center border-b border-[#2A2A2A] relative">
            <input
              className="bg-transparent border-none text-[#F5F5F5] text-[14px] py-[10px] w-full focus:outline-none"
              type="number"
              placeholder={q.placeholder || '0'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
            {/* Currency toggle pill */}
            <div className="absolute right-0 top-1.5 flex border border-[#222] rounded-sm bg-[#141414] text-[9px] font-mono overflow-hidden">
              {['INR', 'USD'].map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 ${currency === c ? 'bg-[#E8533A] text-[#F5F5F5]' : 'text-[#666]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[11px] text-[#E8533A] mt-2">{error}</p>}
        </div>
        <NavFooter onContinue={commitCurrency} />
      </div>
    );
  }

  /* ── conditional: paying customers ── */
  if (q.type === 'conditional_customers') {
    const isYes = hasCust === true || String(hasCust).toLowerCase() === 'true';
    return (
      <div className="flex-1 flex flex-col justify-between px-[20px] py-[24px]">
        <div className="overflow-y-auto max-h-[380px]">
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-[6px] mb-4">
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
                  className={`w-full text-center text-[13px] p-[10px_12px] border transition-all rounded-sm ${
                    selected
                      ? 'border-[#E8533A] text-[#F5F5F5] bg-[#141414]'
                      : 'border-[#1E1E1E] text-[#666] bg-[#141414] hover:border-[#333]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Conditional slide-in inputs */}
          {hasCust === true && (
            <div className="space-y-4 border-t border-[#1A1A1A] pt-4 anim-fade-up">
              <div>
                <label className="label-bracket block mb-1">How many customers?</label>
                <input
                  className="vz-input-line"
                  type="number"
                  placeholder="e.g. 20"
                  value={custCount}
                  onChange={e => setCustCount(e.target.value)}
                />
              </div>
              <div>
                <label className="label-bracket block mb-1">Monthly Recurring Revenue (MRR)</label>
                <div className="flex items-center border-b border-[#2A2A2A] relative">
                  <input
                    className="bg-transparent border-none text-[#F5F5F5] text-[14px] py-[10px] w-full focus:outline-none"
                    type="number"
                    placeholder="e.g. 50000"
                    value={mrr}
                    onChange={e => setMrr(e.target.value)}
                  />
                  <div className="absolute right-0 top-1.5 flex border border-[#222] rounded-sm bg-[#141414] text-[9px] font-mono overflow-hidden">
                    {['INR', 'USD'].map(c => (
                      <button
                        key={c}
                        onClick={() => setMrrCur(c)}
                        className={`px-2 py-1 ${mrrCur === c ? 'bg-[#E8533A] text-[#F5F5F5]' : 'text-[#666]'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && <p className="text-[11px] text-[#E8533A] mt-2">{error}</p>}
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
      <div className="flex-1 flex flex-col justify-between px-[20px] py-[24px]">
        <div className="overflow-y-auto max-h-[380px]">
          {renderQHeader()}
          <div className="grid grid-cols-2 gap-[6px] mb-4">
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
                  className={`w-full text-center text-[13px] p-[10px_12px] border transition-all rounded-sm ${
                    selected
                      ? 'border-[#E8533A] text-[#F5F5F5] bg-[#141414]'
                      : 'border-[#1E1E1E] text-[#666] bg-[#141414] hover:border-[#333]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Conditional expand inline */}
          {hasFund === true && (
            <div className="space-y-2 border-t border-[#1A1A1A] pt-4 anim-fade-up">
              <label className="label-bracket block mb-1">How much and from whom?</label>
              <textarea
                className="bg-transparent border-b border-[#2A2A2A] text-[#F5F5F5] text-[14px] py-[10px] w-full focus:outline-none h-[72px] resize-none"
                placeholder="e.g. Raised ₹20L from Angel Investors..."
                value={fundDet}
                onChange={e => setFundDet(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-[11px] text-[#E8533A] mt-2">{error}</p>}
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
      <div className="flex-1 flex flex-col justify-between px-[20px] py-[24px]">
        <div>
          {renderQHeader()}
          <textarea
            className="bg-transparent border border-b-[#2A2A2A] border-transparent text-[#F5F5F5] text-[14px] py-[10px] w-full focus:outline-none h-[72px] resize-none"
            placeholder={q.placeholder || 'Enter details...'}
            value={val}
            onChange={e => setVal(e.target.value)}
            autoFocus
          />
          {error && <p className="text-[11px] text-[#E8533A] mt-2">{error}</p>}
        </div>
        <NavFooter />
      </div>
    );
  }

  /* ── default: text / email / tel ── */
  return (
    <div className="flex-1 flex flex-col justify-between px-[20px] py-[24px]">
      <div>
        {renderQHeader()}
        <input
          className="vz-input-line"
          type={q.type === 'tel' ? 'tel' : q.type === 'number' ? 'number' : 'text'}
          placeholder={q.placeholder || 'Type here...'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commitText()}
          autoFocus
        />
        {error && <p className="text-[11px] text-[#E8533A] mt-2">{error}</p>}
      </div>
      <NavFooter />
    </div>
  );
}

/* ─── Welcome Screen ─── */
function WelcomeScreen({ onSelect }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center bg-[#0F0F0F] rounded-md">
      {/* Red V Logomark */}
      <span className="font-sans font-black text-[40px] text-[#E8533A] mb-4 select-none leading-none">V</span>

      <h2 className="text-lg font-bold text-[#F5F5F5] mb-2 leading-snug">Where do you fit in the ecosystem?</h2>
      <p className="font-sans text-[11px] text-[#555] tracking-wide mb-8">
        5 minutes. Honest answers. We'll handle the rest.
      </p>

      <div className="flex flex-col gap-2 w-full max-w-[320px]">
        <button
          onClick={() => onSelect('founder')}
          className="bg-[#141414] border border-[#222] hover:border-[#444] p-[18px_20px] text-left transition-all rounded-sm flex justify-between items-center group"
        >
          <div>
            <span className="font-sans text-[10px] text-[#E8533A] tracking-wider block font-bold mb-1">FOUNDER</span>
            <span className="text-[14px] text-[#F5F5F5]">I'm building a venture</span>
          </div>
          <span className="text-[#444] group-hover:text-white transition-colors text-sm">→</span>
        </button>

        <button
          onClick={() => onSelect('investor')}
          className="bg-[#141414] border border-[#222] hover:border-[#444] p-[18px_20px] text-left transition-all rounded-sm flex justify-between items-center group"
        >
          <div>
            <span className="font-sans text-[10px] text-[#E8533A] tracking-wider block font-bold mb-1">INVESTOR</span>
            <span className="text-[14px] text-[#F5F5F5]">I'm deploying capital</span>
          </div>
          <span className="text-[#444] group-hover:text-white transition-colors text-sm">→</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Score Result ─── */
function ScoreResult({ score, bucket, onRestart }) {
  const badgeColors = {
    hot:   'text-[#E8533A] border-[#E8533A]',
    good:  'text-[#888] border-[#888]',
    maybe: 'text-[#555] border-[#555]',
    low:   'text-[#333] border-[#333]',
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center anim-fade-up bg-[#0F0F0F] rounded-md">
      <div className="flex items-baseline justify-center mb-4">
        <span className="text-[60px] font-bold text-[#F5F5F5] leading-none">{score}</span>
        <span className="text-[18px] text-[#333] font-bold ml-1">/100</span>
      </div>

      <span className={`tag text-[10px] uppercase font-bold tracking-widest ${badgeColors[bucket] || badgeColors.low}`}>
        {BUCKET_LABEL[bucket] || bucket}
      </span>

      <p className="text-[13px] text-[#666] leading-[1.7] max-w-[280px] mt-4 font-sans text-center">
        {RESULT_MSG[bucket] || 'Thank you for your application.'}
      </p>

      <button onClick={onRestart} className="font-sans text-[12px] text-[#444] hover:text-[#F5F5F5] mt-7 transition-colors">
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
        className="fixed inset-0 bg-[#000000]/85 z-40 flex items-center justify-center"
        onClick={onClose}
      />

      {/* Widget Panel — centered */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[440px] h-[580px] max-h-[90vh] bg-[#0F0F0F] border border-[#1E1E1E] flex flex-col rounded-sm shadow-none select-none pointer-events-auto anim-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header (48px) */}
        <div className="h-[48px] border-b border-[#1A1A1A] px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-sans font-black text-sm text-[#E8533A]">V</span>
            <span className="font-sans text-[9px] tracking-[1.5px] text-[#555] font-bold uppercase">VENTURIZER</span>
          </div>
          <span className="font-sans text-[11px] text-[#555] uppercase">Lead Qualification</span>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors text-sm">✕</button>
        </div>

        {/* Progress Fill Bar */}
        {phase === 'flow' && currentQ && (
          <ProgressBar step={step} total={flow.length} section={currentQ.section || 'Details'} />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#0F0F0F]">
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
            <div className="flex-1 flex items-center justify-center bg-[#0F0F0F]">
              <div className="text-center px-6">
                <div className="label-bracket mb-3">PROCESSING APPLICATION</div>
                <div className="font-mono text-[10px] text-[#444] tracking-widest anim-pulse">
                  Running qualification engine...
                </div>
              </div>
            </div>
          )}

          {submitErr && !submitting && (
            <div className="flex-1 flex items-center justify-center px-6 bg-[#0F0F0F]">
              <div className="border border-[#1A1A1A] p-5 text-center">
                <p className="font-mono text-[10px] text-[#E8533A] tracking-wider mb-4">{submitErr}</p>
                <button onClick={() => { setSubmitErr(''); submitLead(); }} className="vz-btn text-[9px] px-4 py-2">RETRY</button>
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
