import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Loader2, Sparkles } from 'lucide-react';
import { updateMilestone, getAINextStageTip } from '../../services/api';

const STAGE_COLORS = {
  m1: '#f59e0b',
  m2: '#f97316',
  m3: '#ef4444',
  m4: '#8b5cf6',
  m5: '#10b981'
};

export default function ConstructionTracker({ project, onProjectUpdate }) {
  const [loadingId, setLoadingId] = useState(null);
  const [aiTip, setAiTip] = useState(null);
  const [aiTipLoading, setAiTipLoading] = useState(false);
  const milestones = project?.milestones || [];
  const completedCount = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const projectContext = project?.formData || {
    city: project?.city, budget: project?.budget, qualityTier: project?.tier
  };

  const handleToggle = async (milestone, idx) => {
    if (!project?._id) return;
    setLoadingId(milestone.id);
    const result = await updateMilestone(project._id, milestone.id, !milestone.completed);
    setLoadingId(null);

    if (result.success && onProjectUpdate) {
      onProjectUpdate(result.plot);

      // Trigger AI tip when marking COMPLETE (not undoing)
      if (!milestone.completed) {
        const nextMilestone = milestones[idx + 1];
        if (nextMilestone) {
          setAiTipLoading(true);
          setAiTip(null);
          const tipResult = await getAINextStageTip(projectContext, milestone.title, nextMilestone.title);
          setAiTipLoading(false);
          if (tipResult.success) setAiTip({ text: tipResult.tip, nextStage: nextMilestone.title });
        }
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Construction Progress</h3>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            borderRadius: '999px',
            transition: 'width 0.6s ease-in-out'
          }} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>
          {completedCount} of {milestones.length} stages complete
        </p>
      </div>

      {/* AI Next Stage Tip */}
      {(aiTip || aiTipLoading) && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#6366f111',
          border: '1px solid #6366f133',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <Sparkles size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', color: '#818cf8', marginBottom: '6px', fontSize: '0.875rem' }}>
              AI Tip for Next Stage: {aiTip?.nextStage}
            </div>
            {aiTipLoading
              ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}><Loader2 size={13} className="animate-spin" /> Generating expert tip...</div>
              : <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-color)' }}>{aiTip?.text}</p>
            }
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          bottom: '20px',
          width: '2px',
          backgroundColor: 'var(--border-color)',
          zIndex: 0
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {milestones.map((milestone, idx) => {
            const isLoading = loadingId === milestone.id;
            const color = STAGE_COLORS[milestone.id] || '#6366f1';

            return (
              <div key={milestone.id} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                {/* Icon */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: milestone.completed ? color : 'var(--surface-color)',
                  border: `2px solid ${milestone.completed ? color : 'var(--border-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: milestone.completed ? `0 0 12px ${color}55` : 'none'
                }}>
                  {isLoading
                    ? <Loader2 size={18} className="animate-spin" color="white" />
                    : milestone.completed
                      ? <CheckCircle2 size={18} color="white" />
                      : <Circle size={18} color="var(--text-muted)" />
                  }
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  backgroundColor: milestone.completed ? `${color}11` : 'var(--surface-color)',
                  border: `1px solid ${milestone.completed ? color + '44' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        backgroundColor: `${color}22`,
                        color: color,
                        borderRadius: '999px',
                        textTransform: 'uppercase'
                      }}>Stage {idx + 1}</span>
                      <h4 style={{ margin: 0, fontSize: '1rem', textDecoration: milestone.completed ? 'line-through' : 'none', color: milestone.completed ? 'var(--text-muted)' : 'var(--text-color)' }}>
                        {milestone.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleToggle(milestone, idx)}
                      disabled={isLoading}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: `1px solid ${milestone.completed ? 'var(--border-color)' : color}`,
                        backgroundColor: milestone.completed ? 'transparent' : `${color}22`,
                        color: milestone.completed ? 'var(--text-secondary)' : color,
                        transition: 'all 0.2s'
                      }}
                    >
                      {isLoading ? '...' : milestone.completed ? 'Undo' : 'Mark Complete'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{milestone.description}</p>
                  {milestone.completed && milestone.completedAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '0.75rem', color: color }}>
                      <Clock size={12} />
                      Completed: {new Date(milestone.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
