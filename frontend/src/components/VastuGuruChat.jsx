import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   AI VASTU GURU — Floating chat widget
   Always visible. Powered by Groq / offline fallback.
═══════════════════════════════════════════════════════ */

// Offline knowledge base for instant Vastu answers
const VASTU_KB = {
  kitchen: {
    keywords: ['kitchen', 'cook', 'stove', 'agni', 'fire'],
    answer: `🍳 **Kitchen Placement:**\n\n✅ **Best Direction:** South-East (Agni corner) — ideal for fire-related activities.\n⚠️ **Avoid:** North-East (water zone), Centre (Brahmasthana).\n\n🔑 **Vastu Tips:**\n• Cooking person should face East\n• Gas stove should be in SE corner\n• Sink (water) in NE corner is acceptable\n• Avoid black/dark colors in kitchen`
  },
  bedroom: {
    keywords: ['bedroom', 'bed', 'sleep', 'master', 'room'],
    answer: `🛏️ **Bedroom Placement:**\n\n✅ **Master Bedroom:** South-West (Nairitya) — Earth element gives stability & authority.\n✅ **Children's Room:** North-West — Wind element, good for growth.\n⚠️ **Avoid:** North-East for bedroom.\n\n🔑 **Vastu Tips:**\n• Head while sleeping should point South or East\n• Avoid mirrors facing the bed\n• Keep under-bed clutter-free`
  },
  pooja: {
    keywords: ['pooja', 'mandir', 'temple', 'prayer', 'worship', 'god', 'deity'],
    answer: `🙏 **Pooja Room Placement:**\n\n✅ **Best Direction:** North-East (Ishanya/Water element) — spiritually strongest zone.\n✅ **Also Good:** East or North walls.\n⚠️ **Strictly Avoid:** South, South-West.\n\n🔑 **Vastu Tips:**\n• Deity should face East/West, devotee faces same direction\n• Keep room clean and fragrant at all times\n• No footwear inside the pooja room\n• Light an oil lamp daily for positive energy`
  },
  toilet: {
    keywords: ['toilet', 'bathroom', 'wc', 'washroom', 'bath'],
    answer: `🚿 **Bathroom/Toilet Placement:**\n\n✅ **Best Direction:** West or North-West — for waste/water exit alignment.\n✅ **Also Acceptable:** South.\n⚠️ **Avoid:** North-East (sacred zone), East (Solar zone).\n\n🔑 **Vastu Tips:**\n• Toilet pot should face North or South, never East/West\n• Ensure good ventilation — window preferred in North or East\n• Keep bathroom door always closed`
  },
  entrance: {
    keywords: ['entrance', 'main door', 'gate', 'entry', 'door'],
    answer: `🚪 **Main Entrance Placement:**\n\n✅ **Best Directions:** North, North-East, East, East-North-East — attract wealth & positive energy.\n⚠️ **Avoid:** South-West (negative energy entry).\n\n🔑 **Vastu Tips:**\n• Main door should open clockwise (inward, left to right)\n• No obstruction directly facing main door\n• Place Ganesha idol to right of entrance\n• Threshold (doll/kolam) brings prosperity\n• Door should be taller than occupants`
  },
  living: {
    keywords: ['living', 'hall', 'drawing', 'guest', 'sitting'],
    answer: `🛋️ **Living Room Placement:**\n\n✅ **Best Direction:** North or East, or North-East zone.\n✅ **Also Good:** Center-North or Center-East of the plot.\n\n🔑 **Vastu Tips:**\n• Heavy sofa should be in South or West\n• TV unit in South-East corner\n• No mirror facing main door\n• Water features (aquarium) in North-East OK\n• Keep center of hall (Brahmasthana) empty`
  },
  staircase: {
    keywords: ['stair', 'staircase', 'steps', 'upstairs', 'floor'],
    answer: `🪜 **Staircase Placement:**\n\n✅ **Best Direction:** South, West, or South-West area.\n⚠️ **Avoid:** North-East (creates heavy energy in sacred zone).\n\n🔑 **Vastu Tips:**\n• Stairs should ascend clockwise (left to right when going up)\n• Odd number of steps preferred (15, 17, 21)\n• No toilet under staircase\n• Ensure steps are even — no broken or uneven risers`
  },
  north: {
    keywords: ['north', 'north facing', 'plot facing north'],
    answer: `🧭 **North Facing Plot:**\n\n✅ **Excellent!** North is ruled by Kubera (Lord of Wealth). This is one of the most auspicious facings.\n\n🔑 **Best Layout for North Facing:**\n• Main entrance in North or North-East\n• Master bedroom in South-West\n• Kitchen in South-East\n• Living room in North-East or North\n• Garden/open space in North or East\n• Vehicle parking in South-East or South`
  },
  east: {
    keywords: ['east', 'east facing'],
    answer: `🌅 **East Facing Plot:**\n\n✅ **Very Auspicious!** East is ruled by Indra (Sun God). Natural morning sunlight enters the house bringing health & vitality.\n\n🔑 **Best Layout for East Facing:**\n• Main entrance in East or East-North-East\n• Master bedroom in South-West\n• Kitchen in South-East corner\n• Pooja room in North-East\n• Avoid placing toilet in East or North-East\n• Open space/garden preferred in East and North`
  },
  cement: {
    keywords: ['cement', 'concrete', 'opc', 'ppc'],
    answer: `🧱 **Cement Prices — Vizianagaram (Today):**\n\n📊 Current Market Rates:\n• OPC 53 Grade (50kg): ₹385-400/bag\n• PPC Cement (50kg): ₹340-365/bag\n• Ultratech Premium: ₹395/bag\n• Birla A1: ₹375/bag\n\n🏪 **Local Suppliers:**\n• Sri Sai Cement & Steel Traders, Gajula Rega: Best bulk rates\n• Sri Ramachandra Cement Corp, Ring Road\n\n💡 Tip: Buy 50+ bags at once for 5-8% discount.`
  },
  cost: {
    keywords: ['cost', 'price', 'budget', 'rate', 'how much', 'rs', 'rupee', 'lakh'],
    answer: `💰 **Construction Cost in Vizianagaram (2025-26):**\n\n📊 Standard Grade: ₹1,500 - 1,700/sqft (all inclusive)\n🏆 Premium Grade: ₹1,800 - 2,200/sqft\n💎 Luxury Grade: ₹2,500 - 3,500/sqft\n\n📦 **Key Material Rates:**\n• Cement: ₹385/bag | Steel TMT: ₹58,200/MT\n• M-Sand: ₹42/cft | Red Bricks: ₹6/brick\n• Floor tiles (Kajaria): ₹65-120/sqft\n\n💡 Your budget auto-adjusts daily based on market index. Check the BOM & Cost tab for live estimates!`
  },
};

function getOfflineAnswer(userMsg) {
  const msg = userMsg.toLowerCase();
  for (const key of Object.keys(VASTU_KB)) {
    const entry = VASTU_KB[key];
    if (entry.keywords.some(kw => msg.includes(kw))) {
      return entry.answer;
    }
  }
  // Generic fallback
  return `🧭 **Vastu Guru says:**\n\nGreat question! For personalized Vastu guidance specific to your plot in Vizianagaram:\n\n✅ Key principles to remember:\n• Northeast (Ishanya) — sacred, keep open or place pooja room\n• Southeast (Agni) — kitchen and fire elements\n• Southwest (Nairitya) — master bedroom, heavy structures\n• Northwest (Vayu) — guest rooms, vehicle parking\n• Brahmasthana (center) — keep open, no pillars/toilets\n\nAsk me about any specific room or direction! 🙏`;
}

export default function VastuGuruChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '🙏 **Namaste! I am Vastu Guru AI.**\n\nAsk me anything about:\n• Room placement & directions\n• Material costs in Vizianagaram\n• Vastu dos and don\'ts\n• Construction tips\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); endRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  }, [messages, open]);

  const sendMsg = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `You are Vastu Guru, an expert in Indian Vastu Shastra and construction in Vizianagaram. Answer concisely and helpfully: ${text}`, projectContext: 'Vastu and construction query' })
      });
      const json = await res.json();
      setMessages(m => [...m, { role: 'bot', text: json.answer || getOfflineAnswer(text) }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: getOfflineAnswer(text) }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '🍳 Where to put kitchen?',
    '🛏️ Best bedroom direction?',
    '🏠 North facing plot tips?',
    '💰 Construction cost 2025?',
  ];

  return (
    <>
      {/* Floating bubble */}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
        {!open && (
          <button
            className="chat-bubble-btn"
            onClick={() => setOpen(true)}
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
              border: '3px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', position: 'relative',
            }}
            title="Ask Vastu Guru AI"
          >
            <span style={{ fontSize: '1.6rem' }}>🧭</span>
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '22px', height: '22px', borderRadius: '50%',
                background: '#ef4444', color: 'white', fontSize: '0.68rem',
                fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>{unread}</span>
            )}
          </button>
        )}

        {/* Chat Panel */}
        {open && (
          <div className="chat-panel-enter" style={{
            width: '360px', height: '520px',
            borderRadius: '20px', overflow: 'hidden',
            background: 'linear-gradient(180deg,#0f172a,#131c31)',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(37,99,235,0.3))',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  boxShadow: '0 0 12px rgba(124,58,237,0.5)'
                }}>🧭</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'white' }}>Vastu Guru AI</div>
                  <div style={{ fontSize: '0.65rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    Online — Ask anything about Vastu
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end', gap: '8px'
                }}>
                  {msg.role === 'bot' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🧭</div>
                  )}
                  <div style={{
                    maxWidth: '82%', padding: '10px 13px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.05)',
                    border: msg.role === 'bot' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    fontSize: '0.8rem', lineHeight: '1.55', color: 'white',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🧭</div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(j => (
                      <span key={j} className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick question chips */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickQuestions.map((q, i) => (
                  <button key={i} onClick={() => { setInput(q.replace(/^[^\s]+\s/, '')); }}
                    style={{
                      padding: '5px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600',
                      background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                      color: '#93c5fd', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.12)'}
                  >{q}</button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div style={{
              padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)',
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                placeholder="Ask about Vastu, costs, rooms..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.82rem', outline: 'none',
                }}
              />
              <button onClick={sendMsg} disabled={loading || !input.trim()}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px', border: 'none',
                  background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'rgba(255,255,255,0.05)',
                  color: 'white', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
