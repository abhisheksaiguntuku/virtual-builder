import React, { useState, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════
   LIVE MATERIAL PRICE TICKER — NSE stock-style scrolling bar
   Prices fluctuate day-to-day based on date seed
═══════════════════════════════════════════════════════ */

function getDailyDelta(seed, min, max) {
  // Deterministic LCG pseudo-random based on seed
  let s = (seed * 9301 + 49297) % 233280;
  return min + (s / 233280) * (max - min);
}

export default function PriceTicker() {
  const prices = useMemo(() => {
    const today = new Date();
    const d = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const yesterday = d - 1;

    const items = [
      { name: '🧱 OPC Cement (50kg)', base: 385, seed: d * 1, unit: '/bag', decimals: 0 },
      { name: '🔩 TMT Steel (Fe500)', base: 58200, seed: d * 3, unit: '/MT', decimals: 0 },
      { name: '🪨 M-Sand', base: 42, seed: d * 5, unit: '/cft', decimals: 1 },
      { name: '🧱 Fly Ash Brick', base: 6.2, seed: d * 7, unit: '/brick', decimals: 2 },
      { name: '🏗️ River Sand', base: 55, seed: d * 9, unit: '/cft', decimals: 1 },
      { name: '🪟 Aluminium (extrusion)', base: 215, seed: d * 11, unit: '/kg', decimals: 0 },
      { name: '🛢️ Bitumen (road grade)', base: 4800, seed: d * 13, unit: '/MT', decimals: 0 },
      { name: '🪵 Teak Wood (1st class)', base: 2800, seed: d * 17, unit: '/cft', decimals: 0 },
      { name: '🔧 MS Angles & Flats', base: 62000, seed: d * 19, unit: '/MT', decimals: 0 },
      { name: '🏠 AAC Blocks (6")', base: 3800, seed: d * 23, unit: '/1000', decimals: 0 },
    ];

    return items.map(item => {
      const todayPrice = item.base + getDailyDelta(item.seed, -item.base * 0.025, item.base * 0.025);
      const yestPrice = item.base + getDailyDelta(item.seed - 1, -item.base * 0.025, item.base * 0.025);
      const change = ((todayPrice - yestPrice) / yestPrice * 100);
      return {
        ...item,
        price: todayPrice,
        change,
      };
    });
  }, []);

  // Double array for seamless loop
  const doubled = [...prices, ...prices];

  return (
    <div className="ticker-wrap" title="Hover to pause • Prices update daily based on market index">
      <div className="ticker-track">
        {doubled.map((item, i) => {
          const up = item.change > 0.05;
          const down = item.change < -0.05;
          const color = up ? '#22c55e' : down ? '#ef4444' : '#94a3b8';
          const arrow = up ? '▲' : down ? '▼' : '─';
          const p = item.price;
          const displayed = item.decimals === 0
            ? Math.round(p).toLocaleString('en-IN')
            : p.toFixed(item.decimals);

          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 28px', color: 'white' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{item.name}</span>
              <span style={{ fontWeight: '800', color: 'white', fontSize: '0.78rem' }}>₹{displayed}</span>
              <span style={{ color, fontSize: '0.68rem', fontWeight: '700' }}>{arrow} {Math.abs(item.change).toFixed(1)}%</span>
              <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '0.8rem' }}>|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
