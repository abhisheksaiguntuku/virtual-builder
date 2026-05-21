import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { askAI } from '../../services/api';

export default function AIAdvisor({ projectContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `👋 Hi! I'm your GharBanao AI Advisor powered by Llama 3.\n\nAsk me anything about your ${projectContext?.city || ''} project — materials, costs, Vastu, contractors, or construction tips!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setIsLoading(true);

    const result = await askAI(projectContext, q);
    setIsLoading(false);

    setMessages(prev => [
      ...prev,
      { role: 'ai', text: result.success ? result.answer : `❌ ${result.error || 'AI unavailable. Check your GROQ_API_KEY.'}` }
    ]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = [
    'Which cement brand is best?',
    'How to reduce cost?',
    'Is my roof budget enough?',
    'Best flooring for humid climate?'
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)',
          zIndex: 1000,
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(0deg) scale(0.9)' : 'scale(1)'
        }}
        title="Ask GharBanao AI"
      >
        {isOpen ? <X size={22} color="white" /> : <Bot size={22} color="white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '360px',
          maxHeight: '520px',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Bot size={20} color="white" />
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '0.95rem' }}>GharBanao AI Advisor</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={10} /> Powered by Llama 3 (Groq)
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user' ? '#6366f1' : 'var(--bg-color)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-color)',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Loader2 size={14} className="animate-spin" />
                <span style={{ fontSize: '0.8rem' }}>AI is thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions — only show if 1 message */}
          {messages.length === 1 && (
            <div style={{ padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    border: '1px solid #6366f133',
                    backgroundColor: '#6366f111',
                    color: '#818cf8',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end'
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about your project..."
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.4'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--border-color)',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s'
              }}
            >
              <Send size={16} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
