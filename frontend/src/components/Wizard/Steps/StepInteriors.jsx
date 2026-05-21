import React from 'react';
import { Palette } from 'lucide-react';

export default function StepInteriors({ data, update }) {
  const hallSizes = ['Compact (10x12)', 'Standard (12x16)', 'Large (16x20)'];
  const doorTypes = ['Teak Wood (Main) + Flush (Rooms)', 'WPC (Waterproof)', 'Solid Wood All'];
  const windowTypes = ['UPVC Sliding', 'Aluminum', 'Wooden Framed'];
  const exteriorTypes = ['Weatherproof Paint', 'Textured Elevation', 'Tiles/Cladding'];

  return (
    <div className="flex flex-col gap-6">
      <div style={{ textAlign: 'center' }}>
        <Palette size={48} color="var(--accent-color)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Interior & Exterior Details</h3>
        <p>Let's define your living space and finishes.</p>
      </div>

      <div className="input-group">
        <label className="input-label">Living Room (Hall) Size</label>
        <select 
          className="input-field"
          value={data.hallSize}
          onChange={(e) => update('hallSize', e.target.value)}
        >
          {hallSizes.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Doors Preference</label>
          <select 
            className="input-field"
            value={data.doors}
            onChange={(e) => update('doors', e.target.value)}
          >
            {doorTypes.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Windows Preference</label>
          <select 
            className="input-field"
            value={data.windows}
            onChange={(e) => update('windows', e.target.value)}
          >
            {windowTypes.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Exterior Finish</label>
        <select 
          className="input-field"
          value={data.exterior}
          onChange={(e) => update('exterior', e.target.value)}
        >
          {exteriorTypes.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

    </div>
  );
}
