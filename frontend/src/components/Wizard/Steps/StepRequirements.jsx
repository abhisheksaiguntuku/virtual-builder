import React, { useState } from 'react';
import { Home, Building2, Car, Droplets, Bath, Layers, Sparkles, Loader2 } from 'lucide-react';

const SPECIAL_REQS = [
  { id: 'Pooja Room',        icon: '🙏', label: 'Pooja Room' },
  { id: 'Home Office',       icon: '💼', label: 'Home Office / Study' },
  { id: 'Guest Room',        icon: '🛏️', label: 'Guest Room' },
  { id: 'Store Room',        icon: '📦', label: 'Store Room' },
  { id: 'Servant Quarter',   icon: '🏠', label: 'Servant Quarter' },
  { id: 'Garden / Terrace',  icon: '🌿', label: 'Garden / Terrace' },
  { id: 'Gym Room',          icon: '💪', label: 'Gym Room' },
  { id: 'Theatre Room',      icon: '🎬', label: 'Home Theatre' },
];

const counter = (label, value, onDec, onInc, min = 0, max = 10) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button onClick={onDec} disabled={value <= min}
        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--surface-color)', cursor: value > min ? 'pointer' : 'not-allowed', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}>−</button>
      <span style={{ fontWeight: '700', fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>{value}</span>
      <button onClick={onInc} disabled={value >= max}
        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--accent-color)', background: 'var(--accent-color)', cursor: value < max ? 'pointer' : 'not-allowed', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>+</button>
    </div>
  </div>
);

export default function StepRequirements({ data, update }) {
  const bhkOptions = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK+'];
  const tiers = [
    { id: 'Budget',   emoji: '💰', desc: '₹1,200–1,500/sqft' },
    { id: 'Standard', emoji: '🏠', desc: '₹1,600–2,200/sqft' },
    { id: 'Premium',  emoji: '✨', desc: '₹2,500–4,000/sqft' },
  ];

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState('');

  const handleAIEnhance = async () => {
    const raw = data.additionalInfo || '';
    if (!raw.trim()) return;
    setIsEnhancing(true);
    setEnhanceError('');
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: data,
          question: `You are a construction assistant. The user has typed a description of their house requirements in informal language (possibly with typos or mixed language). Please rewrite it clearly in professional English, fixing grammar and spelling, and organizing key points as bullet points. Keep it concise and focused on construction needs.\n\nUser input: "${raw}"`
        })
      });
      const json = await res.json();
      if (json.answer) update('additionalInfo', json.answer);
      else setEnhanceError('AI could not process. Please try again.');
    } catch {
      setEnhanceError('Backend offline. Make sure server is running.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const toggleSpecial = (req) => {
    const curr = data.specialReqs || [];
    update('specialReqs', curr.includes(req) ? curr.filter(r => r !== req) : [...curr, req]);
  };

  const cnt = (key) => Number(data[key] || 0);
  const set = (key, val, min = 0, max = 10) => update(key, Math.min(max, Math.max(min, val)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <Home size={48} color="var(--accent-color)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>House Requirements</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tell us exactly how you want your home built.</p>
      </div>

      {/* Row 1: Area + BHK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="input-group">
          <label className="input-label">Built-up Area (sq.ft)</label>
          <input type="number" className="input-field" placeholder="e.g. 1500"
            value={data.builtUpArea} onChange={(e) => update('builtUpArea', e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Rooms (BHK)</label>
          <select className="input-field" value={data.bhk} onChange={(e) => update('bhk', e.target.value)}>
            {bhkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Floors + Type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="input-group">
          <label className="input-label">🏗️ Number of Floors</label>
          <select className="input-field" value={data.floors || '1'} onChange={(e) => update('floors', e.target.value)}>
            <option value="G">Ground Floor Only (G)</option>
            <option value="G+1">Ground + 1 Floor (G+1)</option>
            <option value="G+2">Ground + 2 Floors (G+2)</option>
            <option value="G+3">Ground + 3 Floors (G+3)</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">🏘️ House Type</label>
          <select className="input-field" value={data.houseType || 'Independent'} onChange={(e) => update('houseType', e.target.value)}>
            <option value="Independent">Independent House</option>
            <option value="Duplex">Duplex Villa</option>
            <option value="Triplex">Triplex</option>
            <option value="Row House">Row House</option>
          </select>
        </div>
      </div>

      {/* Bathroom Details */}
      <div>
        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Bath size={15} /> Bathroom Configuration
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {counter('Total Bathrooms / Toilets', cnt('totalBathrooms'), () => set('totalBathrooms', cnt('totalBathrooms') - 1, 1), () => set('totalBathrooms', cnt('totalBathrooms') + 1, 1, 8), 1, 8)}
          {counter('Attached Bathrooms (with bedrooms)', cnt('attachedBathrooms'), () => set('attachedBathrooms', cnt('attachedBathrooms') - 1), () => set('attachedBathrooms', cnt('attachedBathrooms') + 1, 0, cnt('totalBathrooms')))}
          {counter('Common Bathrooms', cnt('commonBathrooms'), () => set('commonBathrooms', cnt('commonBathrooms') - 1), () => set('commonBathrooms', cnt('commonBathrooms') + 1))}
        </div>
      </div>

      {/* Water Tanks */}
      <div>
        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Droplets size={15} /> Water Tank Configuration
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {counter('Underground Sump Tanks', cnt('undergroundTanks'), () => set('undergroundTanks', cnt('undergroundTanks') - 1), () => set('undergroundTanks', cnt('undergroundTanks') + 1, 0, 4))}
          {counter('Overhead Water Tanks', cnt('overheadTanks'), () => set('overheadTanks', cnt('overheadTanks') - 1), () => set('overheadTanks', cnt('overheadTanks') + 1, 0, 4))}
        </div>
      </div>

      {/* Parking & Below Ground */}
      <div>
        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Car size={15} /> Parking & Ground Level
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {counter('Car Parking / Car Shed', cnt('carParking'), () => set('carParking', cnt('carParking') - 1), () => set('carParking', cnt('carParking') + 1, 0, 6))}
          {counter('Two-Wheeler Parking', cnt('bikeParking'), () => set('bikeParking', cnt('bikeParking') - 1), () => set('bikeParking', cnt('bikeParking') + 1, 0, 10))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          {[
            { id: 'Basement', icon: '⬇️', label: 'Basement' },
            { id: 'Stilt Parking', icon: '🏗️', label: 'Stilt Parking (pillar base)' },
            { id: 'Lift', icon: '🛗', label: 'Lift / Elevator Provision' },
            { id: 'Generator Room', icon: '⚡', label: 'Generator Room' },
          ].map(item => (
            <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${(data.specialReqs || []).includes(item.id) ? 'var(--accent-color)' : 'var(--border-color)'}`, backgroundColor: (data.specialReqs || []).includes(item.id) ? 'rgba(37,99,235,0.08)' : 'var(--bg-color)' }}>
              <input type="checkbox" checked={(data.specialReqs || []).includes(item.id)} onChange={() => toggleSpecial(item.id)} style={{ accentColor: 'var(--accent-color)' }} />
              <span style={{ fontSize: '0.8rem' }}>{item.icon} {item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quality Tier */}
      <div className="input-group">
        <label className="input-label">💎 Material Quality Tier</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {tiers.map(tier => (
            <button key={tier.id}
              onClick={() => update('qualityTier', tier.id)}
              style={{
                padding: '12px 8px', borderRadius: '10px', cursor: 'pointer',
                border: `2px solid ${data.qualityTier === tier.id ? 'var(--accent-color)' : 'var(--border-color)'}`,
                backgroundColor: data.qualityTier === tier.id ? 'rgba(37,99,235,0.08)' : 'var(--bg-color)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}>
              <span style={{ fontSize: '1.3rem' }}>{tier.emoji}</span>
              <span style={{ fontWeight: '700', fontSize: '0.875rem', color: data.qualityTier === tier.id ? 'var(--accent-color)' : 'var(--text-color)' }}>{tier.id}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{tier.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Special Rooms */}
      <div className="input-group">
        <label className="input-label">🏠 Additional Special Rooms</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {SPECIAL_REQS.map(req => (
            <label key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${(data.specialReqs || []).includes(req.id) ? 'var(--accent-color)' : 'var(--border-color)'}`, backgroundColor: (data.specialReqs || []).includes(req.id) ? 'rgba(37,99,235,0.08)' : 'var(--bg-color)' }}>
              <input type="checkbox" checked={(data.specialReqs || []).includes(req.id)} onChange={() => toggleSpecial(req.id)} style={{ accentColor: 'var(--accent-color)' }} />
              <span style={{ fontSize: '0.8rem' }}>{req.icon} {req.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* AI-Powered Additional Information */}
      <div style={{ marginTop: '4px' }}>
        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Sparkles size={14} color="#8b5cf6" />
          Additional Information
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>(Describe in your own words — AI will correct & structure it)</span>
        </label>

        <div style={{ position: 'relative' }}>
          <textarea
            className="input-field"
            rows={4}
            placeholder={`Example: I want 3BHK but 2 rooms downstairs and 1 guest room on top. Need a big kitchen connected to dining. Master bedroom with walk-in wardrobe. Car shed for 2 cars in front. Terrace on top with garden...`}
            value={data.additionalInfo || ''}
            onChange={(e) => update('additionalInfo', e.target.value)}
            style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem', lineHeight: '1.6', paddingBottom: '40px' }}
          />

          {/* AI Enhance Button inside textarea */}
          <button
            onClick={handleAIEnhance}
            disabled={isEnhancing || !data.additionalInfo?.trim()}
            style={{
              position: 'absolute', bottom: '10px', right: '10px',
              padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none', color: 'white', cursor: isEnhancing ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              opacity: !data.additionalInfo?.trim() ? 0.5 : 1
            }}
          >
            {isEnhancing ? <><Loader2 size={12} className="animate-spin" /> Enhancing...</> : <><Sparkles size={12} /> AI Enhance</>}
          </button>
        </div>

        {enhanceError && (
          <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '4px' }}>⚠️ {enhanceError}</p>
        )}

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          💡 Type in Telugu, Hindi or broken English — click <strong>AI Enhance</strong> to auto-correct & structure your requirements professionally.
        </p>
      </div>
    </div>
  );
}
