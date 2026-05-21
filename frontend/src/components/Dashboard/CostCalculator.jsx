import React, { useState } from 'react';
import { IndianRupee, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { getAICostOptimizations } from '../../services/api';

export default function CostCalculator({ data, apiData, selectedMaterials, marketIndex, marketPercent, liveCosts }) {
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const result = await getAICostOptimizations(data, apiData);
    setIsOptimizing(false);
    if (result.success) setAiSuggestions(result.suggestions);
    else setAiSuggestions('Could not get suggestions. Check your GROQ_API_KEY.');
  };

  const formatRupee = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  const quantities = apiData?.costData?.quantities || apiData?.quantities || {};

  return (
    <div className="flex flex-col gap-6" style={{ color: 'var(--text-color)' }}>
      {/* Live Daily Pricing Indicator Alert */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: marketPercent >= 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(22, 163, 74, 0.05)',
        border: `1px solid ${marketPercent >= 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(22, 163, 74, 0.15)'}`,
        marginBottom: '10px'
      }}>
        <AlertCircle size={18} color={marketPercent >= 0 ? '#ef4444' : '#16a34a'} />
        <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>
          📈 Live Commodities Pricing Ticker: today's market index is{' '}
          <strong style={{ color: marketPercent >= 0 ? '#ef4444' : '#16a34a' }}>
            {marketPercent >= 0 ? '+' : ''}{marketPercent}% ({marketIndex}x base)
          </strong>
          . All structural base rates and package indices have been updated to live local wholesale prices.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Bill of Materials (BOM) & Real-Time Cost</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tailored to your customized 3D plan & live commodity rates</p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: 'white', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: '600'
          }}
        >
          {isOptimizing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {isOptimizing ? 'Optimizing...' : 'AI Cost Optimizer'}
        </button>
      </div>

      {/* AI Suggestions Panel */}
      {aiSuggestions && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#6366f111',
          border: '1px solid #6366f133',
          borderRadius: '12px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#818cf8', fontWeight: '600' }}>
            <Sparkles size={16} /> AI Cost Optimization Suggestions
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>{aiSuggestions}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '24px', backgroundColor: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Estimated Total Cost</p>
          <h3 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: '0 0 4px' }}>{formatRupee(liveCosts.adjustedTotal)}</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '8px', fontWeight: '600', color: liveCosts.adjustedTotal > (data.budget * 100000) ? 'var(--danger-color)' : 'var(--success-color)' }}>
            Target Budget: ₹{data.budget} Lakhs ({liveCosts.adjustedTotal > (data.budget * 100000) ? `${Math.round((liveCosts.adjustedTotal - data.budget * 100000) / 100000)} Lakhs OVER` : 'Under Budget! ✔️'})
          </p>
        </div>
        
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Calculated Carpet Area</p>
          <h3 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: '0 0 4px' }}>{Math.round(liveCosts.area)} sq.ft</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Quality Tier: {data.qualityTier}</p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>Material / Finish Category</th>
              <th style={{ padding: '12px' }}>Selected Brand / Spec</th>
              <th style={{ padding: '12px' }}>Quantity</th>
              <th style={{ padding: '12px' }}>Estimated Cost</th>
              <th style={{ padding: '12px' }}>Dynamic Market Status</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Structural Materials scaled by Live Index */}
            {Object.entries(quantities)
              .filter(([mat]) => ['cement', 'steel', 'sand', 'aggregate', 'bricks'].includes(mat))
              .map(([mat, matData]) => {
                const baseVal = apiData?.costData?.costBreakdown?.materials?.[mat] || apiData?.costData?.costBreakdown?.[mat] || 50000;
                const indexCost = baseVal * marketIndex;
                return (
                  <tr key={mat} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', textTransform: 'capitalize', fontWeight: '600' }}>{mat} (Structural)</td>
                    <td style={{ padding: '12px', fontSize: '0.875rem' }}>{matData.brand || 'Standard Wholesale'}</td>
                    <td style={{ padding: '12px' }}>{(matData.qty || matData).toLocaleString('en-IN')} {matData.unit || 'units'}</td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(indexCost)}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: marketPercent >= 0 ? '#ef4444' : '#16a34a' }}>
                      {marketPercent >= 0 ? '📈 Up today' : '📉 Down today'}
                    </td>
                  </tr>
                );
              })}

            {/* 2. Premium Finishes selected in 3D */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Floor Finishing (3D Selected)</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.floor?.label}</td>
              <td style={{ padding: '12px' }}>{Math.round(liveCosts.area)} sqft</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.floorOverlay)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Walls & Paint (3D Selected)</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.wall?.label}</td>
              <td style={{ padding: '12px' }}>{Math.round(liveCosts.area * 2.5)} sqft area</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.wallOverlay)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Doors & Framing (3D Selected)</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.door?.label}</td>
              <td style={{ padding: '12px' }}>6 units</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.doorOverlay)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Ceiling / Slab Option (3D Selected)</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.roof?.label}</td>
              <td style={{ padding: '12px' }}>{Math.round(liveCosts.area)} sqft</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.roofOverlay)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            {/* Packages */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Modular Switchboards</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.switches?.label}</td>
              <td style={{ padding: '12px' }}>1 Package</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.switchesCost)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Conduits & Wiring</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.wiring?.label}</td>
              <td style={{ padding: '12px' }}>1 Package</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.wiringCost)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Electronics package</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.electronics?.label}</td>
              <td style={{ padding: '12px' }}>1 Package</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.electronicsCost)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>Taps & Bath Utilities</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>{selectedMaterials?.utilities?.label}</td>
              <td style={{ padding: '12px' }}>1 Package</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.utilitiesCost)}</td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>🎨 Custom choice</td>
            </tr>

            {/* Fittings and Labor */}
            <tr style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600', color: '#6366f1' }}>Premium Modular Fittings</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>Hettich / Hafele / Blum (Soft-close)</td>
              <td style={{ padding: '12px' }}>{liveCosts.hardwareQty} sets</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.hardwareCost)}</td>
              <td style={{ padding: '12px', fontSize: '0.875rem', color: 'var(--success-color)' }}>💡 Soft-close channels</td>
            </tr>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }} colSpan={3}>Labour & Contracting (35%)</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{formatRupee(liveCosts.adjustedLaborTotal)}</td>
              <td style={{ padding: '12px', fontSize: '0.875rem' }}>Direct hiring rate</td>
            </tr>
            <tr style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <td style={{ padding: '12px', fontWeight: '600', color: 'var(--warning-color)' }} colSpan={3}>Contingency Buffer (10%)</td>
              <td style={{ padding: '12px', fontWeight: '600', color: 'var(--warning-color)' }}>{formatRupee(liveCosts.adjustedContingency)}</td>
              <td style={{ padding: '12px' }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
