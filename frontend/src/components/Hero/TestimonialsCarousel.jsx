import React, { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════
   TESTIMONIALS CAROUSEL – Shows rotating customer reviews
   Simple auto‑rotate every 5 s, with manual navigation.
   Designed to look premium and match the hero styling.
═════════════════════════════════════════════════════ */

const testimonials = [
  {
    quote: "The AI‑driven plan saved us months of design hassle – the 3D walkthrough felt like we were already inside our home!",
    name: "Rohit & Priya, Hyderabad",
    rating: 5,
  },
  {
    quote: "Accurate Vastu suggestions and real‑time pricing helped us stay within budget while keeping the house beautiful.",
    name: "Kumar Singh, Delhi",
    rating: 4,
  },
  {
    quote: "The color‑palette picker let us visualise our dream paint scheme instantly – the result was stunning.",
    name: "Ananya, Bangalore",
    rating: 5,
  },
];

export default function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);

  // Auto‑rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => setIdx(prev => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const { quote, name, rating } = testimonials[idx];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '24px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <p style={{ fontSize: '1.1rem', lineHeight: 1.4, color: '#e5e7eb', marginBottom: '12px' }}>
        “{quote}”
      </p>
      <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>{name}</p>
      <div style={{ color: '#fbbf24' }}>
        {Array.from({ length: rating }).map((_, i) => ( <span key={i}>★</span> ))}
        {Array.from({ length: 5 - rating }).map((_, i) => ( <span key={i}>☆</span> ))}
      </div>
    </div>
  );
}
