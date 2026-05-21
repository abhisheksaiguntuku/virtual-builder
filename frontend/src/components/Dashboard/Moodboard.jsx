import React from 'react';
import { Sparkles, Layers, Award } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   MOODBOARD – Premium AI-driven interior style generator
   Displays matching palettes, texture details, and vibes.
═════════════════════════════════════════════════════ */

const MOODBOARDS = {
  'Modern Minimalist': {
    palette: [
      { name: 'Pure Chalk', hex: '#f8fafc', text: '#475569' },
      { name: 'Warm Putty', hex: '#e2e8f0', text: '#475569' },
      { name: 'Raw Linen', hex: '#cbd5e1', text: '#1e293b' },
      { name: 'Slate Highlight', hex: '#475569', text: '#f8fafc' },
    ],
    textures: [
      { name: 'Matte Clay Plaster', desc: 'Soft-textured mineral wall finish with non-reflective depth.', bg: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)' },
      { name: 'Bleached Oak', desc: 'Slightly white-washed natural oak planks for floors/cupboards.', bg: 'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 10px, #cbd5e1 10px, #cbd5e1 20px)' },
      { name: 'Brushed Stainless Steel', desc: 'Sleek metal accents for profiles, handles, and task lights.', bg: 'linear-gradient(90deg, #94a3b8, #e2e8f0, #94a3b8)' },
    ],
    accents: ['Concealed warm cove lights (2700K)', 'Rimless minimalist switch plates', 'Handleless J-pull cabinets'],
  },
  'Royal / Classical Teak': {
    palette: [
      { name: 'Polished Teak', hex: '#78350f', text: '#fef3c7' },
      { name: 'Imperial Gold', hex: '#d97706', text: '#78350f' },
      { name: 'Royal Ivory', hex: '#fef3c7', text: '#78350f' },
      { name: 'Crimson Accent', hex: '#991b1b', text: '#fef3c7' },
    ],
    textures: [
      { name: 'Heritage Teak Wood', desc: 'Deep grain varnished premium teak wood paneling.', bg: 'repeating-linear-gradient(0deg, #78350f, #78350f 15px, #451a03 15px, #451a03 30px)' },
      { name: 'Polished Brass / Gold Leaf', desc: 'Traditional handles and intricate border details.', bg: 'linear-gradient(135deg, #fbbf24, #d97706, #fbbf24)' },
      { name: 'Plush Royal Velvet', desc: 'Heavy drape fabrics in deep crimson or warm beige.', bg: 'radial-gradient(circle, #991b1b, #7f1d1d)' },
    ],
    accents: ['Intricate hand-carved pillars', 'Warm halogen chandelier ambient lights', 'Classic brass frame switchboards'],
  },
  'Scandinavian Light Wood': {
    palette: [
      { name: 'Birch White', hex: '#fafaf9', text: '#44403c' },
      { name: 'Pale Ash', hex: '#f5f5f4', text: '#44403c' },
      { name: 'Muted Sage', hex: '#d9f99d', text: '#3f6212' },
      { name: 'Charcoal Contrast', hex: '#292524', text: '#fafaf9' },
    ],
    textures: [
      { name: 'Natural Ash Wood', desc: 'Extremely light, clean-grained timber for dining/study.', bg: 'repeating-linear-gradient(90deg, #f5f5f4, #f5f5f4 8px, #e7e5e4 8px, #e7e5e4 16px)' },
      { name: 'Textured Bouclé / Linen', desc: 'Cozy, high-texture fabrics for upholstery and curtains.', bg: 'radial-gradient(circle, #fafaf9, #e7e5e4)' },
      { name: 'Matte Slate Grey Tile', desc: 'Large format kitchen floor tiles with natural stone feel.', bg: 'linear-gradient(135deg, #78716c, #44403c)' },
    ],
    accents: ['Hygge cozy ambient warm lighting', 'Matte black architectural spotlights', 'Open birch shelves'],
  },
  'Contemporary Gloss Luxury': {
    palette: [
      { name: 'Stygian Black', hex: '#0f172a', text: '#f1f5f9' },
      { name: 'Golden Profile', hex: '#eab308', text: '#0f172a' },
      { name: 'High-Gloss White', hex: '#f8fafc', text: '#0f172a' },
      { name: 'Emperador Bronze', hex: '#7c2d12', text: '#ffedd5' },
    ],
    textures: [
      { name: 'Black Emperador Marble', desc: 'Mirror finish dark marble with gold and copper veins.', bg: 'radial-gradient(circle at top left, #1e293b, #0f172a)' },
      { name: 'Gold Anodized Aluminium', desc: 'High-end sleek metal profile handles and dividers.', bg: 'linear-gradient(90deg, #ca8a04, #eab308, #ca8a04)' },
      { name: 'Ultra-Gloss Acrylic Lacquer', desc: 'Highly reflective solid color surfaces for cabinets.', bg: 'linear-gradient(135deg, #f8fafc, #cbd5e1)' },
    ],
    accents: ['Custom indirect blue/orange LED glow', 'Flush crystal linear ceiling fittings', 'Push-to-open high-gloss facades'],
  },
};

export default function Moodboard({ style }) {
  const currentMood = MOODBOARDS[style] || MOODBOARDS['Modern Minimalist'];

  return (
    <div style={{
      marginTop: '16px',
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: 'var(--surface-color)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={18} color="#2563eb" />
        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>AI Moodboard & Spec Sheet: {style}</h4>
      </div>

      {/* Color Palette Row */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
          🎨 Recommended Color Swatches
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
          {currentMood.palette.map((color, i) => (
            <div key={i} style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ backgroundColor: color.hex, height: '45px' }} />
              <div style={{ padding: '6px 8px', fontSize: '0.72rem', fontWeight: '700', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', textAlign: 'center' }}>
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{color.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{color.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Textures Grid */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
          🧱 Textures & Materials
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {currentMood.textures.map((texture, i) => (
            <div key={i} style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                background: texture.bg,
                border: '1px solid var(--border-color)',
                flexShrink: 0,
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }} />
              <div>
                <h5 style={{ margin: '0 0 2px', fontSize: '0.8rem', fontWeight: '700' }}>{texture.name}</h5>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{texture.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accents List */}
      <div style={{
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Layers size={14} color="#10b981" />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-color)' }}>💡 Recommended Accents & Fittings</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {currentMood.accents.map((acc, i) => (
            <li key={i}>{acc}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
