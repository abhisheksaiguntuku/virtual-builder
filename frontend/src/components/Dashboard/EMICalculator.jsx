import React, { useState, useMemo } from 'react';
import { TrendingDown, TrendingUp, Calculator, IndianRupee, Percent, Calendar } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   HOME LOAN EMI CALCULATOR
   Bank comparison, donut chart, prepayment savings
═══════════════════════════════════════════════════════ */

const BANKS = [
  { name: 'SBI Home Loan', rate: 8.50, logo: '🏦' },
  { name: 'HDFC Bank', rate: 8.75, logo: '🔵' },
  { name: 'ICICI Bank', rate: 9.00, logo: '🟠' },
  { name: 'LIC Housing Finance', rate: 8.65, logo: '🟢' },
  { name: 'Axis Bank', rate: 9.15, logo: '🟣' },
  { name: 'Canara Bank', rate: 8.45, logo: '🟡' },
];

function calcEMI(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function DonutChart({ principal, totalInterest }) {
  const total = principal + totalInterest;
  const pPct = (principal / total) * 100;
  const iPct = 100 - pPct;

  // SVG donut
  const r = 70;
  const cx = 90; const cy = 90;
  const circ = 2 * Math.PI * r;
  const pDash = (pPct / 100) * circ;
  const iDash = (iPct / 100) * circ;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <svg width={180} height={180} style={{ flexShrink: 0 }}>
        {/* Background */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={20} />
        {/* Principal arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563eb" strokeWidth={20}
          strokeDasharray={`${pDash} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        {/* Interest arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7c3aed" strokeWidth={20}
          strokeDasharray={`${iDash} ${circ}`}
          strokeDashoffset={circ / 4 - pDash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={13} fontWeight="800">
          ₹{(total / 100000).toFixed(1)}L
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize={9}>
          Total Outflow
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#2563eb' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Principal Amount</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>₹{(principal / 100000).toFixed(2)}L</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#7c3aed' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Interest</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f87171' }}>₹{(totalInterest / 100000).toFixed(2)}L</div>
          </div>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#475569', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
          Interest = {iPct.toFixed(1)}% of total outflow
        </div>
      </div>
    </div>
  );
}

export default function EMICalculator({ defaultBudget = 30 }) {
  const [loanAmt, setLoanAmt] = useState(Math.round(defaultBudget * 0.8));
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [extraEMI, setExtraEMI] = useState(5000);
  const [selectedBank, setSelectedBank] = useState(0);

  const emi = useMemo(() => calcEMI(loanAmt * 100000, rate, tenure * 12), [loanAmt, rate, tenure]);
  const totalPaid = emi * tenure * 12;
  const totalInterest = totalPaid - loanAmt * 100000;

  // Prepayment savings
  const prepayMonths = useMemo(() => {
    const p = loanAmt * 100000;
    const r = rate / 100 / 12;
    let balance = p;
    let months = 0;
    while (balance > 0 && months < tenure * 12 * 2) {
      const interest = balance * r;
      const principal = emi + extraEMI - interest;
      balance -= principal;
      months++;
    }
    return months;
  }, [loanAmt, rate, emi, extraEMI, tenure]);

  const prepayInterest = useMemo(() => calcEMI(loanAmt * 100000, rate, prepayMonths) * prepayMonths - loanAmt * 100000, [loanAmt, rate, prepayMonths]);
  const interestSaved = Math.max(0, totalInterest - prepayInterest);
  const monthsSaved = tenure * 12 - prepayMonths;

  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px' }}>🏦 Home Loan EMI Calculator</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          Calculate EMI, compare banks, and see how prepayment saves lakhs in interest.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Loan Amount */}
          <div style={{ padding: '16px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>🏠 Loan Amount</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#2563eb' }}>₹{loanAmt} Lakhs</span>
            </div>
            <input type="range" min={5} max={200} step={1} value={loanAmt}
              onChange={e => setLoanAmt(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>₹5L</span><span>₹200L</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div style={{ padding: '16px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>📊 Interest Rate</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#f59e0b' }}>{rate.toFixed(2)}% p.a.</span>
            </div>
            <input type="range" min={6} max={15} step={0.05} value={rate}
              onChange={e => setRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>6%</span><span>15%</span>
            </div>
          </div>

          {/* Tenure */}
          <div style={{ padding: '16px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>📅 Loan Tenure</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#a78bfa' }}>{tenure} Years</span>
            </div>
            <input type="range" min={1} max={30} step={1} value={tenure}
              onChange={e => setTenure(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#a78bfa' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>1 Yr</span><span>30 Yrs</span>
            </div>
          </div>

          {/* EMI Result Hero */}
          <div style={{
            padding: '20px', borderRadius: '14px', textAlign: 'center',
            background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.15))',
            border: '1px solid rgba(37,99,235,0.3)',
            boxShadow: '0 4px 20px rgba(37,99,235,0.1)'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Monthly EMI</div>
            <div style={{
              fontSize: '2.4rem', fontWeight: '900',
              background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {fmt(emi)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>per month for {tenure} years</div>
          </div>
        </div>

        {/* Right: Summary & Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Donut Chart */}
          <div style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h5 style={{ margin: '0 0 14px', fontSize: '0.85rem', fontWeight: '800' }}>💰 Principal vs Interest Breakdown</h5>
            <DonutChart principal={loanAmt * 100000} totalInterest={totalInterest} />
          </div>

          {/* Prepayment Calculator */}
          <div style={{ padding: '16px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)' }}>
            <h5 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '800', color: '#22c55e' }}>⚡ Prepayment Savings Calculator</h5>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Extra EMI/month</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#22c55e' }}>₹{extraEMI.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min={0} max={50000} step={1000} value={extraEMI}
              onChange={e => setExtraEMI(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#22c55e', marginBottom: '12px' }} />
            {extraEMI > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Interest Saved</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#22c55e' }}>₹{(interestSaved / 100000).toFixed(1)}L</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Loan Closed Early</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#22c55e' }}>{Math.floor(monthsSaved / 12)}y {monthsSaved % 12}m</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Comparison Table */}
      <div style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <h5 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: '800' }}>🏦 Bank Rate Comparison — {loanAmt}L for {tenure} Years</h5>
        <div style={{ display: 'grid', gap: '8px' }}>
          {BANKS.map((bank, i) => {
            const bankEMI = calcEMI(loanAmt * 100000, bank.rate, tenure * 12);
            const isSelected = i === selectedBank;
            const diff = bankEMI - emi;
            return (
              <div key={i} onClick={() => { setSelectedBank(i); setRate(bank.rate); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                  background: isSelected ? 'rgba(37,99,235,0.1)' : 'var(--surface-color)',
                  border: `1px solid ${isSelected ? '#2563eb' : 'var(--border-color)'}`,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{bank.logo}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>{bank.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{bank.rate}% p.a. floating</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: isSelected ? '#2563eb' : 'var(--text-color)' }}>{fmt(bankEMI)}/mo</div>
                  {Math.abs(diff) > 10 && (
                    <div style={{ fontSize: '0.65rem', color: diff > 0 ? '#ef4444' : '#22c55e', fontWeight: '700' }}>
                      {diff > 0 ? '▲' : '▼'} {fmt(Math.abs(diff))}/mo vs current
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          * Rates are indicative. Click a bank to apply that rate to your calculator. Always verify current rates on the bank's official website before applying.
        </p>
      </div>
    </div>
  );
}
