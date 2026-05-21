import React, { useState, useRef } from 'react';
import { Settings, Info, RotateCcw, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

const INITIAL_ROOMS = [
  { id: 'living', name: 'Living Room', direction: 'NE', xPct: 0.02, yPct: 0.02, wPct: 0.48, hPct: 0.42, color: '#dbeafe', textColor: '#1e40af' },
  { id: 'kitchen', name: 'Kitchen', direction: 'SE', xPct: 0.54, yPct: 0.02, wPct: 0.44, hPct: 0.30, color: '#fef9c3', textColor: '#854d0e' },
  { id: 'pooja', name: 'Pooja Room', direction: 'NE', xPct: 0.54, yPct: 0.34, wPct: 0.18, hPct: 0.20, color: '#fff7ed', textColor: '#9a3412' },
  { id: 'toilet1', name: 'Toilet', direction: 'NW', xPct: 0.74, yPct: 0.34, wPct: 0.24, hPct: 0.20, color: '#ccfbf1', textColor: '#065f46' },
  { id: 'master', name: 'Master Bedroom', direction: 'SW', xPct: 0.02, yPct: 0.48, wPct: 0.46, hPct: 0.38, color: '#fce7f3', textColor: '#9d174d' },
  { id: 'bed2', name: 'Bedroom 2', direction: 'NW', xPct: 0.52, yPct: 0.57, wPct: 0.44, hPct: 0.30, color: '#ede9fe', textColor: '#5b21b6' },
  { id: 'passage', name: 'Passage / Hall', direction: 'Centre', xPct: 0.02, yPct: 0.88, wPct: 0.96, hPct: 0.10, color: '#f1f5f9', textColor: '#475569' },
];

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export default function FloorPlan2D({ data }) {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  
  // Vastu compliance state
  const [vastuAlert, setVastuAlert] = useState(null); // { roomName, problem, optimalZone, originalState, targetState }
  const [lastOverriddenAlert, setLastOverriddenAlert] = useState(null);

  const plotL = data?.plotLength || 40;
  const plotW = data?.plotWidth || 60;
  const facing = data?.plotFacing || 'East';

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Vastu Rule Analyzer based on positions
  const analyzeVastu = (roomId, x, y) => {
    // Determine target Vastu zone based on relative X/Y coordinates
    let zone = 'Centre';
    if (x < 0.4 && y < 0.4) zone = 'NE';
    else if (x >= 0.4 && y < 0.4) zone = 'SE';
    else if (x < 0.4 && y >= 0.4) zone = 'SW';
    else if (x >= 0.4 && y >= 0.4) zone = 'NW';

    if (roomId === 'pooja' && zone !== 'NE') {
      return {
        isViolated: true,
        problem: `Pooja Room placed in the ${zone} corner. Religious shrines must reside exclusively in the North-East (Ishanya) corner to harness pure solar positive energy.`,
        optimalZone: 'NE'
      };
    }
    if (roomId === 'kitchen' && zone !== 'SE') {
      return {
        isViolated: true,
        problem: `Kitchen placed in the ${zone} corner. Under Vastu principles, the hearth (Agni) must reside in the South-East to prevent health and financial imbalances.`,
        optimalZone: 'SE'
      };
    }
    if (roomId === 'master' && zone !== 'SW') {
      return {
        isViolated: true,
        problem: `Master Bedroom placed in the ${zone} corner. The family head's room must be in the South-West (Nairutya) corner to foster stability, strength, and authority.`,
        optimalZone: 'SW'
      };
    }
    if (roomId === 'toilet1' && (zone === 'NE' || zone === 'SE')) {
      return {
        isViolated: true,
        problem: `Toilet/Washroom placed in the destructive ${zone} corner. Restrooms in the North-East or South-East cause significant Vastu Dosha, purging fortune and positive life-force.`,
        optimalZone: 'NW'
      };
    }
    return { isViolated: false };
  };

  const handleUpdateRoomCoords = (id, field, value) => {
    const originalState = [...rooms];
    
    // Prepare updated state
    const nextRooms = rooms.map(r => {
      if (r.id === id) {
        const updatedRoom = { ...r, [field]: parseFloat(value) };
        // Dynamically compute absolute facing direction indicator
        let zone = 'Centre';
        if (updatedRoom.xPct < 0.4 && updatedRoom.yPct < 0.4) zone = 'NE';
        else if (updatedRoom.xPct >= 0.4 && updatedRoom.yPct < 0.4) zone = 'SE';
        else if (updatedRoom.xPct < 0.4 && updatedRoom.yPct >= 0.4) zone = 'SW';
        else if (updatedRoom.xPct >= 0.4 && updatedRoom.yPct >= 0.4) zone = 'NW';
        updatedRoom.direction = zone;
        return updatedRoom;
      }
      return r;
    });

    const targetRoom = nextRooms.find(r => r.id === id);

    // Run Vastu check
    const check = analyzeVastu(id, targetRoom.xPct, targetRoom.yPct);
    if (check.isViolated) {
      // Trigger Red Alert Vastu Popup modal
      setVastuAlert({
        roomName: targetRoom.name,
        problem: check.problem,
        optimalZone: check.optimalZone,
        originalState,
        targetState: nextRooms,
        field,
        value
      });
    } else {
      setRooms(nextRooms);
    }
  };

  const handleAcceptViolation = () => {
    if (vastuAlert) {
      setRooms(vastuAlert.targetState);
      setVastuAlert(null);
    }
  };

  const handleRevertViolation = () => {
    if (vastuAlert) {
      setRooms(vastuAlert.originalState);
      setVastuAlert(null);
    }
  };

  const resetLayout = () => {
    setRooms(INITIAL_ROOMS);
    setSelectedRoomId(null);
    setVastuAlert(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* VASTU RED ALERT MODAL POPUP */}
      {vastuAlert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            maxWidth: '520px', width: '100%',
            borderRadius: '16px',
            border: '3px solid #ef4444',
            boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
            overflow: 'hidden',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <ShieldAlert size={28} className="animate-bounce" />
              <div>
                <h4 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>Inauspicious Vastu Alert!</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Scriptural Discrepancy Found</p>
              </div>
            </div>

            <div style={{ padding: '24px', color: '#1e293b' }}>
              <div style={{ 
                display: 'flex', gap: '12px', 
                backgroundColor: '#fef2f2', border: '1px solid #fecaca', 
                padding: '16px', borderRadius: '10px', marginBottom: '20px' 
              }}>
                <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontWeight: '500', color: '#991b1b' }}>
                  {vastuAlert.problem}
                </p>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                Vastu Shastra balances primary elements (Earth, Water, Fire, Air, Space). Proceeding with this position might bring scriptural imbalances. Do you want to enforce these custom dimensions?
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleRevertViolation}
                  style={{
                    padding: '10px 18px', borderRadius: '8px',
                    border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
                    color: '#475569', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
                  }}
                >
                  Revert to Vastu Ideal Zone
                </button>
                <button 
                  onClick={handleAcceptViolation}
                  style={{
                    padding: '10px 18px', borderRadius: '8px',
                    border: 'none', backgroundColor: '#ef4444',
                    color: '#ffffff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
                  }}
                >
                  Override & Keep Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            2D Interactive Floor Planner
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Click any room to adjust dimensions & positions. Drag sliders to customized sizes!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={resetLayout} 
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={12} /> Reset Layout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px', alignItems: 'start' }}>
        
        {/* Main Canvas Floor Plan Frame */}
        <div style={{ position: 'relative', backgroundColor: 'var(--surface-color)', borderRadius: '16px', border: '2px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
          
          {/* Compass */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(30,41,59,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '2px solid #334155', zIndex: 10 }}>
            <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.9rem', lineHeight: 1 }}>N</div>
            <div style={{ color: '#64748b', fontSize: '0.6rem' }}>↑</div>
            <div style={{ color: '#94a3b8', fontSize: '0.6rem' }}>S</div>
          </div>

          {/* Plot outer boundary */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: `${(plotL / plotW) * 75}%`, border: '3px solid #334155', borderRadius: '4px', backgroundColor: '#f8fafc', overflow: 'hidden', minHeight: '380px' }} id="floor-plan-canvas">

            {/* Plot dimensions label */}
            <div style={{ position: 'absolute', top: '50%', left: '-28px', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '0.7rem', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
              {plotL} ft
            </div>
            <div style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
              {plotW} ft
            </div>

            {/* Render Rooms */}
            {rooms.map(room => {
              const isSelected = room.id === selectedRoomId;
              return (
                <div 
                  key={room.id} 
                  onClick={() => setSelectedRoomId(room.id)}
                  style={{
                    position: 'absolute',
                    left: `${room.xPct * 100}%`,
                    top: `${room.yPct * 100}%`,
                    width: `${room.wPct * 100}%`,
                    height: `${room.hPct * 100}%`,
                    backgroundColor: room.color,
                    border: isSelected ? '3px solid #6366f1' : '2px solid rgba(0,0,0,0.25)',
                    boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    transition: 'border 0.15s ease, box-shadow 0.15s ease',
                    zIndex: isSelected ? 2 : 1
                  }}
                >
                  <div style={{ fontSize: 'clamp(0.55rem, 1.2vw, 0.8rem)', fontWeight: '700', color: room.textColor, textAlign: 'center', lineHeight: 1.2 }}>
                    {room.name}
                  </div>
                  {room.id !== 'passage' && (
                    <div style={{ fontSize: 'clamp(0.45rem, 0.9vw, 0.65rem)', color: room.textColor, opacity: 0.7, marginTop: '2px' }}>
                      {room.direction}
                    </div>
                  )}

                  {/* Door symbol */}
                  {room.id !== 'passage' && (
                    <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '16%', height: '8px', borderTop: '2px solid #334155', borderRight: '2px solid #334155', borderRadius: '0 0 8px 0' }} />
                  )}

                  {/* Window symbols on walls */}
                  {(room.id === 'living' || room.id === 'master' || room.id === 'bed2' || room.id === 'kitchen') && (
                    <div style={{ position: 'absolute', top: 0, left: '30%', width: '30%', height: '6px', backgroundColor: '#38bdf8', borderBottom: '2px solid #0284c7' }} />
                  )}
                </div>
              );
            })}

            {/* Entry door at bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: '46%', width: '8%', height: '10px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '90%', height: '4px', background: 'linear-gradient(90deg,#334155,#64748b,#334155)', borderRadius: '2px' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '8px', left: '46%', fontSize: '0.6rem', color: '#64748b', fontWeight: '600', transform: 'translateX(-10%)' }}>
              MAIN ENTRY ({facing})
            </div>

            {/* Staircase symbol */}
            <div style={{ position: 'absolute', left: '50.5%', top: '55%', width: '2%', height: '30%', borderLeft: '2px dashed #94a3b8' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ position: 'absolute', left: 0, top: `${i * 16.6}%`, width: '10px', height: '2px', backgroundColor: '#94a3b8' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Dimension controls */}
        <div style={{ 
          backgroundColor: 'var(--surface-color)', 
          borderRadius: '16px', border: '2px solid var(--border-color)', 
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' 
        }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              🔧 Dimension Controls
            </span>
          </div>

          {selectedRoom ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: '700', color: selectedRoom.textColor }}>
                {selectedRoom.name}
              </h4>

              {/* Slider for Width */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Width: {Math.round(selectedRoom.wPct * plotW)} ft
                </label>
                <input 
                  type="range" min="0.10" max="0.80" step="0.01" 
                  value={selectedRoom.wPct}
                  onChange={(e) => handleUpdateRoomCoords(selectedRoom.id, 'wPct', e.target.value)}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              {/* Slider for Height */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Length: {Math.round(selectedRoom.hPct * plotL)} ft
                </label>
                <input 
                  type="range" min="0.10" max="0.80" step="0.01" 
                  value={selectedRoom.hPct}
                  onChange={(e) => handleUpdateRoomCoords(selectedRoom.id, 'hPct', e.target.value)}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              {/* Slider for X Position */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  X Shift (Left to Right)
                </label>
                <input 
                  type="range" min="0.0" max="0.85" step="0.01" 
                  value={selectedRoom.xPct}
                  onChange={(e) => handleUpdateRoomCoords(selectedRoom.id, 'xPct', e.target.value)}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              {/* Slider for Y Position */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Y Shift (Top to Bottom)
                </label>
                <input 
                  type="range" min="0.0" max="0.85" step="0.01" 
                  value={selectedRoom.yPct}
                  onChange={(e) => handleUpdateRoomCoords(selectedRoom.id, 'yPct', e.target.value)}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <Info size={24} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              Click any room segment on the 2D layout to calibrate sizes.
            </div>
          )}
        </div>
      </div>
      
      {/* Scriptural Vastu compliance status footer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {[
          { icon: '🙏', text: 'Pooja Room in NE — optimal prayers corner' },
          { icon: '🍳', text: 'Kitchen in SE — Agni elements balanced' },
          { icon: '🛏️', text: 'Master Bed in SW — family stability' },
          { icon: '🌿', text: 'Toilet in NW — pure hygienic layout' },
        ].map((note, i) => (
          <div key={i} style={{ padding: '8px 12px', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.1)', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
            <span>{note.icon}</span>
            <span>{note.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
