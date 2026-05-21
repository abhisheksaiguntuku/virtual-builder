import React, { useState } from 'react';
import { Compass, CheckCircle2, AlertTriangle, Sparkles, HelpCircle, ArrowRight, Home, Info, ListCollapse } from 'lucide-react';

// Room Vastu Possibility Matrix Guide
const VASTU_MATRIX = {
  'Pooja Room': {
    best: ['North-East (Ishanya)'],
    good: ['East', 'North'],
    avoid: ['South-West (Nairutya)', 'South', 'South-East (Agneya)', 'Center (Brahmasthan)'],
    remedy: 'Pooja room should never share a wall with a toilet or be placed under stairs. Keep deities facing East or West.',
    prohibition: '❌ NEVER place under stairs, next to toilets, or in the South-West quadrant.',
    element: 'Water / Ether (Aakash)',
    scientific: 'Morning ultraviolet sunlight enters from the North-East, which acts as a natural disinfectant and provides optimal calm energy for meditation.'
  },
  'Kitchen': {
    best: ['South-East (Agneya)'],
    good: ['North-West (Vayavya)'],
    avoid: ['South-West (Nairutya)', 'North-East (Ishanya)', 'South-South-West (SSW)', 'Center'],
    remedy: 'Keep the cooking stove in the South-East corner and face East while cooking. Place the wash sink in the North-East corner.',
    prohibition: '⚠️ STRICTLY FORBIDDEN: DONT EVER put the kitchen in the South-West or South-South-West (SSW) zone as it burns family stability.',
    element: 'Fire (Agni)',
    scientific: 'Prevents indoor smoke from accumulating due to infrared wind direction and ensures pure morning sunlight cleanses the kitchen space.'
  },
  'Master Bedroom': {
    best: ['South-West (Nairutya)'],
    good: ['South', 'West'],
    avoid: ['North-East (Ishanya)', 'South-East (Agneya)', 'Center (Brahmasthan)'],
    remedy: 'Always sleep with your head pointing South to align with the Earth\'s magnetic field. Avoid mirrors directly reflecting the bed.',
    prohibition: '❌ NEVER position the master suite in the North-East (Ishanya) zone as it leads to high instability and health issues.',
    element: 'Earth (Prithvi)',
    scientific: 'South-West receives the lowest solar heat during noon, keeping the master suite stable, cool, and comfortable for rest.'
  },
  'Children\'s Bed / Study': {
    best: ['North-West (Vayavya)', 'West'],
    good: ['North', 'East'],
    avoid: ['South-West (Nairutya)', 'South-South-West (SSW)', 'Center'],
    remedy: 'Position the study desk so the student faces North or East while studying to boost concentration. Keep books in the NW.',
    prohibition: '⚠️ DONT EVER place the study room in the South-South-West zone as it leads to concentration loss.',
    element: 'Air (Vayu)',
    scientific: 'Optimal cross-ventilation in the NW zone keeps the air flowing, maintaining mental alertness and preventing lethargy.'
  },
  'Living Room / Hall': {
    best: ['North-East (Ishanya)', 'North', 'East'],
    good: ['North-West (Vayavya)'],
    avoid: ['South-West (Nairutya)'],
    remedy: 'Place heavy furniture and wardrobes in the South and West boundaries. House TV, power, and electronics in the South-East corner.',
    prohibition: '❌ Avoid placing heavy primary seating or main visual blocks in the absolute center (Brahmasthan).',
    element: 'Air / Space',
    scientific: 'Ensures the entrance area receives maximum morning solar illumination, which keeps guest reception spaces bright and welcoming.'
  },
  'Dining Room': {
    best: ['West (Varuna)'],
    good: ['East', 'North'],
    avoid: ['South-West (Nairutya)', 'South-East (Agneya)'],
    remedy: 'The dining table should be rectangular or square (avoid round tables) to ensure equal distribution of energy.',
    prohibition: '❌ NEVER place the dining area directly facing the entrance door or sharing a toilet wall.',
    element: 'Water / Earth',
    scientific: 'West receives passive evening light, creating a relaxed, shaded atmosphere perfect for digestion and evening family gatherings.'
  },
  'Guest Bedroom': {
    best: ['North-West (Vayavya)'],
    good: ['North', 'East'],
    avoid: ['South-West (Nairutya)', 'South'],
    remedy: 'Keep the guest bed in the South or West side of the room. Ensure the guest wardrobe is kept in the South-West corner.',
    prohibition: '❌ NEVER allocate the South-West master suite area to guests as it creates power struggles in the household.',
    element: 'Air (Vayu)',
    scientific: 'NW is ruled by Vayavya (wind). Guest stays are temporary, and this flowing quadrant ensures guests leave happily on time.'
  },
  'Bathroom / Toilet': {
    best: ['North-West (Vayavya)', 'West'],
    good: ['South-East', 'South'],
    avoid: ['North-East (Ishanya)', 'South-West (Nairutya)', 'Center (Brahmasthan)'],
    remedy: 'Keep the commode strictly in the South or West direction inside the bathroom. The flush tank should face North or South.',
    prohibition: '⚠️ STRICTLY FORBIDDEN: DONT EVER place a bathroom/sewer outlet in the North-East or South-West zones. It drains wealth and peace.',
    element: 'Water / Wind',
    scientific: 'Optimal hot evening winds dry up moisture, preventing the build-up of bacterial colonies and lingering odors.'
  },
  'Verandah / Balcony': {
    best: ['North-East (Ishanya)', 'East', 'North'],
    good: ['North-West'],
    avoid: ['South-West (Nairutya)'],
    remedy: 'Keep light flower pots in the North-East. Ensure the floor slope is directed towards the North or East.',
    prohibition: '❌ NEVER place heavy storage cabinets or block daylight in the North-East balcony.',
    element: 'Space / Air',
    scientific: 'Maximize open exposure to morning solar light, allowing beneficial UV rays to sanitize the entry porch naturally.'
  },
  'Staircase': {
    best: ['South-West (Nairutya)', 'South', 'West'],
    good: ['North-West (Vayavya)'],
    avoid: ['North-East (Ishanya)', 'Center (Brahmasthan)'],
    remedy: 'Staircase should always be climbed in a clockwise direction (turning to the right). Ensure an odd number of steps.',
    prohibition: '⚠️ STRICTLY FORBIDDEN: DONT EVER construct stairs in the North-East or Center, as it adds heavy vertical pressure on sacred energy grids.',
    element: 'Earth (Prithvi)',
    scientific: 'Adds heavy mass to the South-West boundary, protecting the structure from storm damage and extreme evening solar heating.'
  },
  'Overhead Water Tank': {
    best: ['South-West (Nairutya)', 'West'],
    good: ['South'],
    avoid: ['North-East (Ishanya)', 'South-East (Agneya)', 'Center'],
    remedy: 'Place the heavy water storage tank on a concrete platform at least 2 feet above the roof level in the SW corner.',
    prohibition: '⚠️ STRICTLY FORBIDDEN: NEVER place heavy water storage in the NE or SE. It leads to severe mental stress and accidents.',
    element: 'Earth / Water',
    scientific: 'Adds physical stabilization weight to the structural corner, mitigating seismic hazards while gravity-feeding water pressure.'
  },
  'Septic Tank / Drainage': {
    best: ['North-West (Vayavya)', 'North-North-West'],
    good: ['West'],
    avoid: ['North-East (Ishanya)', 'South-West (Nairutya)', 'Center (Brahmasthan)'],
    remedy: 'Ensure the outlet pipes slope naturally towards the North-West. Keep the pit independent of main building columns.',
    prohibition: '⚠️ STRICTLY FORBIDDEN: DONT EVER put the septic tank in the South-West or North-East. It represents direct elemental contamination.',
    element: 'Water / Earth',
    scientific: 'NW represents high wind currents, which helps disperse sewer gas vents away from residential living areas.'
  }
};

// Gajula Rega narrow-plot actual blueprints data
const BLUEPRINT_PLANS = {
  ground: {
    title: "Ground Floor Plan Archetype (Gajula Rega, Vizianagaram)",
    dimensions: "13'-6\" Width x 61'-0\" Length",
    area: "823.5 Sq.Ft.",
    facing: "North-Facing Road",
    rooms: [
      { name: "Verandah / Entrance", dims: "13.5' x 5.0'", vastuZone: "North-East (Ishanya)", rating: "Excellent (Best Zone)", desc: "Main entrance veranda with stairs.", distance: "0 - 5 ft from Road" },
      { name: "Bedroom 1 (Guest)", dims: "9.0' x 10.0'", vastuZone: "North (Kubera)", rating: "Good", desc: "Guest room aligned with Northern wind.", distance: "5 - 15 ft from Road" },
      { name: "Hall (Living Room)", dims: "12.0' x 9.6'", vastuZone: "Center-East (Surya)", rating: "Good", desc: "Spacious central family lounge.", distance: "15 - 25 ft from Road" },
      { name: "Bedroom 2 (Family)", dims: "9.0' x 8.6'", vastuZone: "West (Varuna)", rating: "Acceptable", desc: "Cozy middle bedroom.", distance: "25 - 34 ft from Road" },
      { name: "Kitchen", dims: "9.0' x 7.0'", vastuZone: "South-East (Agneya)", rating: "Excellent (Fire Zone)", desc: "Located ideally in the Agni quadrant.", distance: "34 - 41 ft from Road" }
    ]
  },
  first: {
    title: "Proposed 1st Floor Plan Archetype (Duplex Upgrade)",
    dimensions: "14.5' Width x 51.8' Length",
    area: "751 Sq.Ft.",
    facing: "North-Facing Balcony",
    rooms: [
      { name: "Balcony / Deck", dims: "14.5' x 5.0'", vastuZone: "North (Ishanya)", rating: "Excellent", desc: "Wide open-to-sky terrace deck.", distance: "0 - 5 ft from Staircase" },
      { name: "Children's Bedroom", dims: "12.0' x 11.8'", vastuZone: "North-West (Vayavya)", rating: "Good (Air Zone)", desc: "Perfect for children/study room.", distance: "5 - 17 ft from Staircase" },
      { name: "Family Lounge", dims: "17.0' x 9.4'", vastuZone: "Center (Brahmasthan)", rating: "Acceptable", desc: "Large open lounge with visual skylight.", distance: "17 - 26 ft from Staircase" },
      { name: "Common Toilet", dims: "5.2' x 6.6'", vastuZone: "West (Varuna)", rating: "Good (Best for Drainage)", desc: "Positioned on West wall with proper duct.", distance: "26 - 32 ft from Staircase" },
      { name: "Master Bedroom", dims: "19.0' x 11.8'", vastuZone: "South-West (Nairutya)", rating: "Excellent (Heavy Earth Zone)", desc: "Spacious luxury suite for absolute peace.", distance: "32 - 51.8 ft from Staircase" }
    ]
  }
};

export default function VastuDashboard({ data, apiData }) {
  const [selectedPlanTab, setSelectedPlanTab] = useState('ground');
  const [selectedMatrixRoom, setSelectedMatrixRoom] = useState('Kitchen');

  const activePlan = BLUEPRINT_PLANS[selectedPlanTab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Compass size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.45rem', margin: 0, fontWeight: '700' }}>Master Vastu Compliance Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Real-time element analysis and interactive narrow-plot blueprint library.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', padding: '6px 12px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            Facing: {data.plotFacing || 'North'}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', padding: '6px 12px', backgroundColor: '#10b981', borderRadius: '8px', color: 'white' }}>
            Vastu Score: 96%
          </span>
        </div>
      </div>

      {/* MATRIX AND DETAILS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* LEFT COLUMN: VASTU MATRIX POSSIBILITIES */}
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Room Placement Matrix & Options
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              Click any room type below to view best, neutral, and forbidden directions with remedial actions.
            </p>
          </div>

          {/* Room Selection Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.keys(VASTU_MATRIX).map(room => (
              <button
                key={room}
                onClick={() => setSelectedMatrixRoom(room)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600',
                  border: `1px solid ${selectedMatrixRoom === room ? '#2563eb' : 'var(--border-color)'}`,
                  backgroundColor: selectedMatrixRoom === room ? 'rgba(37,99,235,0.08)' : 'transparent',
                  color: selectedMatrixRoom === room ? '#2563eb' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {room}
              </button>
            ))}
          </div>

          {/* Matrix Display Card */}
          {selectedMatrixRoom && (
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.95rem', color: '#2563eb' }}>{selectedMatrixRoom} Guide</strong>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '6px' }}>
                  Core Element: {VASTU_MATRIX[selectedMatrixRoom].element}
                </span>
              </div>

              {/* Best Directions (Green) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase' }}>✅ BEST / IDEAL DIRECTIONS</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {VASTU_MATRIX[selectedMatrixRoom].best.map((dir, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', padding: '4px 10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontWeight: '600' }}>
                      {dir}
                    </span>
                  ))}
                </div>
              </div>

              {/* Acceptable Directions (Amber) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase' }}>⚠️ NEUTRAL / ACCEPTABLE</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {VASTU_MATRIX[selectedMatrixRoom].good.map((dir, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', padding: '4px 10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '6px', fontWeight: '600' }}>
                      {dir}
                    </span>
                  ))}
                </div>
              </div>

              {/* Avoid Completely (Red) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>❌ AVOID COMPLETELY (FORBIDDEN)</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {VASTU_MATRIX[selectedMatrixRoom].avoid.map((dir, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', padding: '4px 10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontWeight: '600' }}>
                      {dir}
                    </span>
                  ))}
                </div>
              </div>

              {/* Remedy / Advice */}
              <div style={{ padding: '10px 12px', backgroundColor: 'rgba(37,99,235,0.05)', borderLeft: '3px solid #2563eb', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                💡 <strong>Important Guideline:</strong> {VASTU_MATRIX[selectedMatrixRoom].remedy}
              </div>

              {/* Strict Vastu Prohibition */}
              {VASTU_MATRIX[selectedMatrixRoom].prohibition && (
                <div style={{ padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', fontSize: '0.75rem', color: '#ef4444', lineHeight: '1.4', fontWeight: 'bold' }}>
                  🚫 <strong>Strict Prohibition:</strong> {VASTU_MATRIX[selectedMatrixRoom].prohibition}
                </div>
              )}

              {/* Scientific & Architectural Rationale */}
              {VASTU_MATRIX[selectedMatrixRoom].scientific && (
                <div style={{ padding: '10px 12px', backgroundColor: 'rgba(99, 102, 241, 0.06)', borderLeft: '3px solid #6366f1', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  🔬 <strong>Scientific/Practical Logic:</strong> {VASTU_MATRIX[selectedMatrixRoom].scientific}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ELEMENT COMPASS FLOW */}
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌀 Element Balances & Quadrant Mapping
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              The optimal elemental flow for a luxury narrow layout to ensure peak health and harmony.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { zone: "North-East (Ishanya)", element: "Water", desc: "Pooja, Main Entrance", status: "Perfect Balance" },
              { zone: "South-East (Agneya)", element: "Fire", desc: "Kitchen, Geysers, Power", status: "Active Fire" },
              { zone: "South-West (Nairutya)", element: "Earth", desc: "Master Bed, Heavy Closets", status: "High Stability" },
              { zone: "North-West (Vayavya)", element: "Air", desc: "Guest Bed, Toilets, Dining", status: "Flowing Energy" }
            ].map((el, idx) => (
              <div key={idx} style={{ padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>{el.zone}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', margin: '2px 0' }}>{el.element} Element</div>
                <div style={{ fontSize: '#475569', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Used for: {el.desc}</div>
                <div style={{ fontSize: '0.65rem', marginTop: '6px', color: '#10b981', fontWeight: 'bold' }}>✓ {el.status}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* GAJULA REGA BLUEPRINT ARCHIVE ARCHETYPE (Image 2 & 3) */}
      <div style={{ backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Toggle between Ground Floor and First Floor */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ margin: '0 0 2px', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📐 Vizianagaram Gajula Rega Blueprint Reference Library
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              Visual rendering and Vastu compliance breakdown of the narrow-plot layouts (Image 2 & 3).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedPlanTab('ground')}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600',
                border: `1px solid ${selectedPlanTab === 'ground' ? '#2563eb' : 'var(--border-color)'}`,
                backgroundColor: selectedPlanTab === 'ground' ? '#2563eb' : 'transparent',
                color: selectedPlanTab === 'ground' ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              🏢 Ground Floor Plan (Image 2)
            </button>
            <button
              onClick={() => setSelectedPlanTab('first')}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600',
                border: `1px solid ${selectedPlanTab === 'first' ? '#2563eb' : 'var(--border-color)'}`,
                backgroundColor: selectedPlanTab === 'first' ? '#2563eb' : 'transparent',
                color: selectedPlanTab === 'first' ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              🏢 Proposed 1st Floor Plan (Image 3)
            </button>
          </div>
        </div>

        {/* Blueprint Specs Card */}
        <div style={{ padding: '14px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PROJECT LOCATION</span><div style={{ fontSize: '0.9rem', fontWeight: '700' }}>Gajula Rega, Vizianagaram</div></div>
          <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PLOT DIMENSIONS</span><div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{activePlan.dimensions}</div></div>
          <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL PLANNED AREA</span><div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{activePlan.area}</div></div>
          <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>COMPASS ORIENTATION</span><div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{activePlan.facing}</div></div>
        </div>

        {/* Dynamic Architectural Floor Plan Vector Drawing */}
        <div style={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', border: '1px solid #1e293b' }}>
          <div style={{ width: '100%', minWidth: '700px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* Compass bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', padding: '0 8px' }}>
              <span>⬅️ WEST SIDE</span>
              <span style={{ color: '#ef4444' }}>🚪 NORTH ENTRANCE (ROAD SIDE)</span>
              <span>EAST SIDE ➡️</span>
            </div>

            {/* Narrow Floorplan Layout Draw */}
            <div style={{ display: 'flex', border: '3px solid #64748b', borderRadius: '8px', overflow: 'hidden', height: '140px', backgroundColor: '#1e293b' }}>
              {activePlan.rooms.map((room, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: idx === 0 ? 1 : idx === 2 ? 2.2 : 1.6,
                    borderRight: idx === activePlan.rooms.length - 1 ? 'none' : '2px solid #475569',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: idx % 2 === 0 ? '#1e293b' : '#0f172a',
                    position: 'relative'
                  }}
                >
                  {/* Grid overlay */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                  
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700', marginTop: '2px' }}>{room.dims}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{room.vastuZone}</div>
                    <div style={{ display: 'inline-block', fontSize: '0.58rem', fontWeight: '800', color: room.rating.includes('Excellent') ? '#10b981' : room.rating.includes('Good') ? '#38bdf8' : '#f59e0b', marginTop: '4px' }}>
                      ● {room.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rear label */}
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.72rem', fontWeight: 'bold', marginTop: '4px' }}>
              ⬇️ SOUTH REAR BOUNDARY (BACKYARD)
            </div>

          </div>
        </div>

        {/* Detailed Room Vastu Analysis Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Room Name</th>
                <th style={{ padding: '10px' }}>Dimensions</th>
                <th style={{ padding: '10px' }}>Vastu Direction Zone</th>
                <th style={{ padding: '10px' }}>Compliance Rating</th>
                <th style={{ padding: '10px' }}>Distance / Position</th>
                <th style={{ padding: '10px' }}>Description & Purpose</th>
              </tr>
            </thead>
            <tbody>
              {activePlan.rooms.map((room, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px', fontWeight: '700' }}>{room.name}</td>
                  <td style={{ padding: '12px', color: '#2563eb', fontWeight: 'bold' }}>{room.dims}</td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{room.vastuZone}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', backgroundColor: room.rating.includes('Excellent') ? 'rgba(16, 185, 129, 0.1)' : room.rating.includes('Good') ? 'rgba(37, 99, 235, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: room.rating.includes('Excellent') ? '#10b981' : room.rating.includes('Good') ? '#2563eb' : '#f59e0b' }}>
                      {room.rating}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{room.distance}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{room.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
