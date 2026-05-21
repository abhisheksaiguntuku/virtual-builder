import React, { useEffect, useState } from 'react';
import { getUserProjects } from '../../services/api';
import { MapPin, Calendar, IndianRupee, Layers, AlertCircle, Loader2, Compass, ChevronRight, Activity } from 'lucide-react';

export default function UserProjects({ user, onOpenProject }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setIsLoading(true);
    const response = await getUserProjects(user.id);
    setIsLoading(false);
    if (response.success) setProjects(response.plots);
    else setError(response.error || 'Failed to load projects');
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const getProgress = (milestones = []) => {
    if (!milestones.length) return 0;
    return Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100);
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <p>Please login to view your saved projects.</p>
    </div>
  );

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Projects</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Click any project to open its full Master Plan and Construction Tracker.</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-color)" />
        </div>
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-color)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <Layers size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No projects found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Go back to the wizard, generate a plan, and hit "Save Project"!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map(project => {
            const progress = getProgress(project.milestones);
            return (
              <div
                key={project._id}
                className="card"
                onClick={() => onOpenProject && onOpenProject(project)}
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{project.length}×{project.width} Plot</h3>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {project.tier} Tier
                    </span>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>

                {/* Meta Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <MapPin size={14} /> {project.city}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Compass size={14} /> {project.facing} Facing
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)', fontSize: '0.875rem', gridColumn: 'span 2' }}>
                    <IndianRupee size={14} /> Budget: ₹{project.budget} Lakhs
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', gridColumn: 'span 2' }}>
                    <Calendar size={12} /> Saved on {formatDate(project.createdAt)}
                  </div>
                </div>

                {/* Construction Progress */}
                {project.milestones?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Activity size={13} /> Construction Progress
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: progress === 100 ? 'var(--success-color)' : 'var(--primary-color)' }}>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: progress === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        borderRadius: '999px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

