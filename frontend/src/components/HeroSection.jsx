import React, { useEffect, useRef, useState } from 'react';

/* ══════════════════════════════════════════════════════
   HERO SECTION — Animated landing before the wizard
══════════════════════════════════════════════════════ */

// Animated stat counter
function StatCounter({ end, label, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 20);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '20px 28px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', backdropFilter: 'blur(10px)',
      transition: 'transform 0.3s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        fontSize: '2rem', fontWeight: '900', lineHeight: 1,
        background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </div>
      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

// Floating particle star
function Star({ style }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%',
      background: 'white', animation: 'twinkle 3s ease-in-out infinite',
      ...style
    }} />
  );
}

export default function HeroSection({ onGetStarted }) {
  const [typedText, setTypedText] = useState('');
  const phrases = [
    'Perfect Dream Home',
    'Vastu-Perfect Floor Plan',
    'Luxury G+1 Duplex',
    'Budget-Optimized House',
    'Future-Ready Smart Home',
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const current = phrases[phraseIdx];
    const speed = isDeleting ? 40 : 70;
    const timer = setTimeout(() => {
      if (!isDeleting && charIdx < current.length) {
        setTypedText(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (isDeleting && charIdx > 0) {
        setTypedText(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else if (!isDeleting && charIdx === current.length) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else {
        setIsDeleting(false);
        setPhraseIdx(i => (i + 1) % phrases.length);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, phraseIdx]);

  const features = [
    { icon: '🧭', label: 'Vastu AI Analysis', desc: '100% scientifically validated room placement' },
    { icon: '💰', label: 'Live Pricing', desc: 'Real-time material cost updates daily' },
    { icon: '🏠', label: '3D Walkthrough', desc: 'Walk inside your house before it\'s built' },
    { icon: '🤝', label: 'Trusted Vendors', desc: 'Verified local suppliers within 100km' },
  ];

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1a1040 70%, #0a0f1e 100%)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px',
    }}>
      {/* Glowing orbs background */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', animation: 'orb-pulse 6s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'orb-pulse 7s ease-in-out infinite 1s', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      {/* Twinkling stars */}
      {[
        { top: '8%', left: '12%', width: 2, height: 2, animationDelay: '0s' },
        { top: '15%', left: '70%', width: 3, height: 3, animationDelay: '0.5s' },
        { top: '25%', left: '45%', width: 2, height: 2, animationDelay: '1s' },
        { top: '60%', left: '8%', width: 2, height: 2, animationDelay: '1.5s' },
        { top: '75%', left: '85%', width: 3, height: 3, animationDelay: '0.8s' },
        { top: '40%', left: '92%', width: 2, height: 2, animationDelay: '0.3s' },
        { top: '85%', left: '30%', width: 2, height: 2, animationDelay: '2s' },
        { top: '5%', left: '55%', width: 2, height: 2, animationDelay: '1.2s' },
      ].map((s, i) => (
        <Star key={i} style={{ top: s.top, left: s.left, width: s.width, height: s.height, animationDelay: s.animationDelay, opacity: 0.5 }} />
      ))}

      {/* Badge */}
      <div className="hero-animate-1" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        backgroundColor: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.35)',
        borderRadius: '999px', padding: '6px 16px', marginBottom: '28px',
        fontSize: '0.78rem', fontWeight: '700', color: '#93c5fd', letterSpacing: '0.05em'
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
        🏆 India's #1 AI Home Planning Platform — Powered by Vastu & AI
      </div>

      {/* Main heading */}
      <h1 className="hero-animate-2" style={{
        fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: '900',
        textAlign: 'center', lineHeight: 1.1, marginBottom: '20px', maxWidth: '800px',
        color: 'white', letterSpacing: '-1px',
      }}>
        Build Your{' '}
        <span className="gradient-text">{typedText}</span>
        <span style={{ borderRight: '3px solid #60a5fa', animation: 'pulse-glow 1s ease-in-out infinite', marginLeft: 2 }}>&nbsp;</span>
      </h1>

      {/* Subheading */}
      <p className="hero-animate-3" style={{
        fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8',
        textAlign: 'center', maxWidth: '580px', lineHeight: 1.7, marginBottom: '40px'
      }}>
        AI-powered construction planner with real-time Vastu analysis, live material prices,
        3D walkthrough, and verified local vendors — all in one place.
      </p>

      {/* CTA buttons */}
      <div className="hero-animate-4" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
        <button
          onClick={onGetStarted}
          className="pulse-glow-btn"
          style={{
            padding: '16px 36px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700',
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            border: 'none', color: 'white', cursor: 'pointer', letterSpacing: '0.02em',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
          🏗️ Start Building My Plan — FREE
        </button>
        <button
          onClick={onGetStarted}
          style={{
            padding: '16px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
        >
          🎬 Watch 3D Demo
        </button>
      </div>

      {/* Stats row */}
      <div className="hero-animate-4" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
        gap: '16px', width: '100%', maxWidth: '700px', marginBottom: '64px'
      }}>
        <StatCounter end={2450} label="Houses Planned" suffix="+" />
        <StatCounter end={98} label="Vastu Accuracy" suffix="%" />
        <StatCounter end={12} label="Crores Saved" prefix="₹" suffix="Cr+" />
        <StatCounter end={500} label="Trusted Vendors" suffix="+" />
      </div>

      {/* Feature pills */}
      <div className="hero-animate-5" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
        gap: '16px', width: '100%', maxWidth: '860px',
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ fontSize: '1.6rem' }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', marginBottom: '2px' }}>{f.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll arrow */}
      <div style={{
        marginTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        color: '#475569', fontSize: '0.72rem', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: 'pointer', animation: 'float 2s ease-in-out infinite',
      }} onClick={onGetStarted}>
        <span>SCROLL TO BUILD YOUR PLAN</span>
        <span style={{ fontSize: '1.4rem' }}>↓</span>
      </div>
    </div>
  );
}
