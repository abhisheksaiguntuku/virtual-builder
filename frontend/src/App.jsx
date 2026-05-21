import React, { useState, useEffect } from 'react';
import WizardContainer from './components/Wizard/WizardContainer';
import LoginModal from './components/LoginModal';
import UserProjects from './components/Dashboard/UserProjects';
import ResultDashboard from './components/Dashboard/ResultDashboard';
import HeroSection from './components/HeroSection';
import VastuGuruChat from './components/VastuGuruChat';
import PriceTicker from './components/PriceTicker';
import { Home, User as UserIcon, LayoutDashboard, PlusCircle, Sun, Moon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('hero'); // 'hero' | 'wizard' | 'projects' | 'saved-project'
  const [activeProject, setActiveProject] = useState(null);
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check local storage for persistent login on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gharbanao_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedTheme = localStorage.getItem('gharbanao_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('gharbanao_theme', next);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('gharbanao_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('hero');
    setActiveProject(null);
    localStorage.removeItem('gharbanao_user');
  };

  const handleOpenProject = (project) => {
    setActiveProject(project);
    setCurrentView('saved-project');
  };

  const handleBackToProjects = () => {
    setActiveProject(null);
    setCurrentView('projects');
  };

  const handleGetStarted = () => {
    setCurrentView('wizard');
    // Smooth scroll to wizard
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const showHeader = currentView !== 'hero';
  const showTicker = currentView !== 'hero';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>

      {/* ── PRICE TICKER (always on top when not on hero) ── */}
      {showTicker && <PriceTicker />}

      {/* ── HEADER ── */}
      {showHeader && (
        <header style={{
          backgroundColor: 'rgba(10,15,30,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '14px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              onClick={() => setCurrentView('hero')}
            >
              <span style={{ fontSize: '1.5rem' }}>🏠</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
                GharBanao<span style={{ color: '#60a5fa' }}>.AI</span>
              </span>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Theme Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {theme === 'dark' ? <Moon size={14} color="#94a3b8" /> : <Sun size={14} color="#f59e0b" />}
                <button
                  className={`theme-toggle-btn ${theme === 'light' ? 'light' : ''}`}
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                />
                {theme === 'light' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#94a3b8" />}
              </div>

              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setActiveProject(null);
                      setCurrentView(currentView === 'projects' || currentView === 'saved-project' ? 'wizard' : 'projects');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', fontSize: '0.8rem', color: 'white',
                      borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)',
                      cursor: 'pointer', borderRadius: '8px', fontWeight: '600'
                    }}
                  >
                    {currentView === 'projects' || currentView === 'saved-project'
                      ? <><PlusCircle size={14} /> New Plan</>
                      : <><LayoutDashboard size={14} /> My Projects</>
                    }
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user.photo && (
                      <img src={user.photo} alt={user.name} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #2563eb' }} />
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: '700' }}>
                      {user.name?.toUpperCase().split(' ')[0] || user.name?.toUpperCase()}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={handleLogout}
                    style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsLoginModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <UserIcon size={15} /> Sign In
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ── MAIN CONTENT ── */}
      {currentView === 'hero' ? (
        <HeroSection onGetStarted={handleGetStarted} />
      ) : (
        <main style={{ padding: '28px 16px' }}>
          {currentView === 'saved-project' && activeProject ? (
            <ResultDashboard
              data={activeProject.formData}
              apiData={activeProject.apiData}
              user={user}
              openLoginModal={() => setIsLoginModalOpen(true)}
              onBack={handleBackToProjects}
              savedProject={activeProject}
            />
          ) : currentView === 'projects' && user ? (
            <UserProjects user={user} onOpenProject={handleOpenProject} />
          ) : (
            <WizardContainer user={user} openLoginModal={() => setIsLoginModalOpen(true)} />
          )}
        </main>
      )}

      {/* ── VASTU GURU CHAT (always visible except hero) ── */}
      {currentView !== 'hero' && <VastuGuruChat />}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
