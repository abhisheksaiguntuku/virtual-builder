import React from 'react';

export default function ShareButton({ url }) {
  const shareData = {
    title: 'My GharBanao AI Plan',
    text: 'Check out my house plan created with GharBanao AI',
    url: url || window.location.href,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.error('Share failed', e);
      }
    } else {
      // Fallback: copy to clipboard and open WhatsApp
      try {
        await navigator.clipboard.writeText(shareData.url);
        const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
        window.open(whatsapp, '_blank');
      } catch (e) {
        console.error('Fallback share failed', e);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        marginLeft: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      📤 Share Plan
    </button>
  );
}
