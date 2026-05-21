import React, { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════
   LIVE MATERIAL PRICE TICKER – Simulated real‑time market
   Updates every 4‑5 seconds with random fluctuations.
   Shows bricks, cement, steel, sand, and a total index.
═════════════════════════════════════════════════════ */

const MATERIALS = [
  { key: 'bricks', label: 'Bricks', unit: 'pcs' },
  { key: 'cement', label: 'Cement (50 kg)', unit: 'bags' },
  { key: 'steel', label: 'Steel Rods', unit: 'kg' },
  { key: 'sand', label: 'Sand', unit: 'cft' },
];

function randomFluctuation(base) {
  const change = (Math.random() - 0.5) * 0.05 * base; // ±2.5% fluctuation
  return Math.round((base + change) * 100) / 100;
}

export default function LivePriceTicker() {
  const [prices, setPrices] = useState({
    bricks: 6, // Rs per brick
    cement: 350, // Rs per bag
    steel: 80, // Rs per kg
    sand: 45, // Rs per cft
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        bricks: randomFluctuation(prev.bricks),
        cement: randomFluctuation(prev.cement),
        steel: randomFluctuation(prev.steel),
        sand: randomFluctuation(prev.sand),
      }));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex', gap: '24px', padding: '16px',
      background: 'var(--surface-color)', borderRadius: '12px',
      border: '1px solid var(--border-color)',
      justifyContent: 'center', alignItems: 'center',
      marginBottom: '20px', flexWrap: 'wrap'
    }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
        ⚡ Live Market Rates:
      </div>
      {MATERIALS.map(m => (
        <div key={m.key} style={{ textAlign: 'center', padding: '0 12px', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.label}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f59e0b' }}>
            ₹{prices[m.key].toLocaleString()}/{m.unit}
          </div>
        </div>
      ))}
    </div>
  );
}
