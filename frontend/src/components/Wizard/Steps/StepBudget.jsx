import React from 'react';
import { IndianRupee } from 'lucide-react';

export default function StepBudget({ data, update }) {
  return (
    <div className="flex flex-col gap-6">
      <div style={{ textAlign: 'center' }}>
        <IndianRupee size={48} color="var(--accent-color)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>What is your estimated budget?</h3>
        <p>This helps us recommend the right materials (Budget vs Premium).</p>
      </div>

      <div className="input-group" style={{ marginTop: '32px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>₹ {data.budget} Lakhs</span>
          <span className="input-label">Max: ₹200L</span>
        </div>
        
        <input 
          type="range" 
          min="10" 
          max="200" 
          step="5"
          value={data.budget}
          onChange={(e) => update('budget', e.target.value)}
          className="range-slider"
        />
      </div>

      {data.budget > 50 && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px', color: 'var(--accent-color)', fontSize: '0.875rem' }}>
          💡 Tip: With a budget over ₹50L, we will recommend Premium Tier materials like AAC blocks and Imported Tiles.
        </div>
      )}
    </div>
  );
}
