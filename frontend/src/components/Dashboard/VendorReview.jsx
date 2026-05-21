import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   VENDOR REVIEW – Allows users to rate & comment a vendor.
   Reviews are persisted in localStorage keyed by vendor name.
   Existing reviews are displayed below the form.
═════════════════════════════════════════════════════ */

export default function VendorReview({ vendorName }) {
  const storageKey = `vendorReviews_${vendorName}`;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Load saved reviews
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setReviews(JSON.parse(saved));
  }, [vendorName]);

  const addReview = () => {
    if (!rating || !comment.trim()) return;
    const newReview = { rating, comment, date: new Date().toISOString() };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setRating(0);
    setComment('');
    setShowForm(false);
  };

  const renderStars = (val, onClickHandler = null) => (
    <div style={{ color: '#fbbf24', display: 'flex', gap: '3px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{ cursor: onClickHandler ? 'pointer' : 'default', opacity: i < val ? 1 : 0.3, fontSize: '1.1rem' }}
          onClick={() => onClickHandler && onClickHandler(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Reviews ({reviews.length})
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '3px 8px',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-color)',
            fontSize: '0.7rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rating:</span>
            {renderStars(rating, setRating)}
          </div>
          <textarea
            placeholder="Write your review here..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: 'var(--text-color)',
              fontSize: '0.78rem',
              resize: 'none',
              outline: 'none',
            }}
          />
          <button
            onClick={addReview}
            disabled={!rating || !comment.trim()}
            style={{
              alignSelf: 'flex-end',
              padding: '4px 10px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: '700',
              opacity: (!rating || !comment.trim()) ? 0.5 : 1
            }}
          >
            Submit
          </button>
        </div>
      )}

      {/* Existing reviews list */}
      {reviews.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
          {reviews.map((r, idx) => (
            <div key={idx} style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {renderStars(r.rating)}
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {new Date(r.date).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-color)', lineHeight: '1.3' }}>
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
