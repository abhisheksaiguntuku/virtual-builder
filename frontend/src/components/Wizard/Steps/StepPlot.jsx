import React from 'react';
import { Compass } from 'lucide-react';

export default function StepPlot({ data, update }) {
  const directions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

  return (
    <div className="flex flex-col gap-6">
      <div style={{ textAlign: 'center' }}>
        <Compass size={48} color="var(--accent-color)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Plot Details</h3>
        <p>We need this for the 2D layout generation and Vastu correction.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Length (ft)</label>
          <input 
            type="number" 
            className="input-field" 
            placeholder="e.g. 40"
            value={data.plotLength}
            onChange={(e) => update('plotLength', e.target.value)}
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Width (ft)</label>
          <input 
            type="number" 
            className="input-field" 
            placeholder="e.g. 60"
            value={data.plotWidth}
            onChange={(e) => update('plotWidth', e.target.value)}
          />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Plot Facing Direction</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {directions.map(dir => (
            <button
              key={dir}
              className={`btn ${data.plotFacing === dir ? 'btn-accent' : 'btn-outline'}`}
              style={{ padding: '8px', fontSize: '0.875rem' }}
              onClick={() => update('plotFacing', dir)}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
      
      {data.plotLength && data.plotWidth && (
         <div style={{ textAlign: 'center', marginTop: '8px', color: 'var(--text-secondary)' }}>
           Total Plot Area: <strong>{data.plotLength * data.plotWidth} sq.ft</strong>
         </div>
      )}
    </div>
  );
}
