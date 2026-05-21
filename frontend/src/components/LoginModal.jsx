import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT token from Google to get user info
      const token = credentialResponse.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));

      const userData = {
        id: payload.sub,           // Google's unique user ID
        name: payload.name,
        email: payload.email,
        photo: payload.picture,
        city: ''
      };

      // Save user to MongoDB via backend
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess({ ...userData, id: data.user._id || userData.id });
        onClose();
      } else {
        alert('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        padding: '40px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏠</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'white', fontWeight: '700' }}>
          Welcome to <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GharBanao.AI</span>
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Sign in to save your Master Plans, track construction, and access your projects from anywhere.
        </p>

        {/* Google Sign-In Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google Sign-In failed. Please try again.')}
            theme="filled_blue"
            size="large"
            text="signin_with_google"
            shape="pill"
            width="320"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>SECURE & FREE</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>✅ No password needed</span>
          <span>✅ Real name & photo</span>
          <span>✅ Secure</span>
        </div>

        <p style={{ fontSize: '0.7rem', marginTop: '20px', color: 'var(--text-muted)' }}>
          By signing in, you agree to GharBanao AI's Terms of Service.
        </p>
      </div>
    </div>
  );
}
