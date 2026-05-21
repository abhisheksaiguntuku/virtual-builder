import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════
   SMART QUANTITY CALCULATOR – Auto compute material needs
   Based on plot dimensions and built‑up area; shows
   bricks, cement bags, steel rods, sand volume.
   Simple heuristic formulas for demo purposes.
═══════════════════════════════════════════════════════ */

export default function QuantityCalculator({ data }) {
  const [plotLength, setPlotLength] = useState(Number(data.plotLength) || 40);
  const [plotWidth, setPlotWidth] = useState(Number(data.plotWidth) || 60);
  const [builtUp, setBuiltUp] = useState(Number(data.builtUpArea) || 1200);
  const [floors, setFloors] = useState(data.floors || 'G+1');

  // Simple heuristics – not engineering‑grade
  const floorCount = floors.includes('+') ? parseInt(floors.split('+')[1]) + 1 : 1;
  const totalBuiltUp = builtUp * floorCount;
  const areaSqFt = plotLength * plotWidth * 0.09 * 0.09; // convert to sq ft (approx)

  const bricks = Math.round(totalBuiltUp * 10); // ~10 bricks per sq ft floor
  const cementBags = Math.round(totalBuiltUp / 100); // 1 bag per 100 sq ft
  const steelKg = Math.round(totalBuiltUp * 2); // 2 kg per sq ft
  const sandCft = Math.round(totalBuiltUp * 0.5); // 0.5 cft per sq ft

  return (
    <div style={{ padding: '24px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: '800' }}>🧮 Smart Quantity Calculator</h3>
      <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
        <label>
          Plot Length (m)
          <input type="number" min={5} max={200} value={plotLength} onChange={e => setPlotLength(Number(e.target.value))}
            style={{ width: '100%', marginTop: '4px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)' }} />
        </label>
        <label>
          Plot Width (m)
          <input type="number" min={5} max={200} value={plotWidth} onChange={e => setPlotWidth(Number(e.target.value))}
            style={{ width: '100%', marginTop: '4px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)' }} />
        </label>
        <label>
          Built‑up Area per floor (sq ft)
          <input type="number" min={100} max={5000} value={builtUp} onChange={e => setBuiltUp(Number(e.target.value))}
            style={{ width: '100%', marginTop: '4px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)' }} />
        </label>
        <label>
          Floors (e.g., G, G+1, G+2)
          <input type="text" value={floors} onChange={e => setFloors(e.target.value.toUpperCase())}
            style={{ width: '100%', marginTop: '4px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)' }} />
        </label>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
        <p style={{ margin: '4px 0', color: 'var(--text-color)', fontSize: '0.9rem' }}><strong>Estimated Bricks:</strong> {bricks.toLocaleString()}</p>
        <p style={{ margin: '4px 0', color: 'var(--text-color)', fontSize: '0.9rem' }}><strong>Cement Bags (50 kg):</strong> {cementBags}</p>
        <p style={{ margin: '4px 0', color: 'var(--text-color)', fontSize: '0.9rem' }}><strong>Steel Rods (kg):</strong> {steelKg}</p>
        <p style={{ margin: '4px 0', color: 'var(--text-color)', fontSize: '0.9rem' }}><strong>Sand (cft):</strong> {sandCft}</p>
      </div>
    </div>
  );
}
