import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';

const NavigationBar = () => {
  const { state, dispatch } = useAppState();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll effect for navigation bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const goToHome = () => {
    dispatch({
      type: ACTION_TYPES.CHANGE_SCREEN,
      payload: {
        screen: 'setup'
      }
    });
  };
  
  return (
    <header className={`navigation-bar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo">
        <span className="logo-icon">🎮</span>
        <span className="logo-text">Quadrathlon</span>
      </div>
      
      <div className="nav-links">
        <span 
          className={`nav-link ${state.ui.currentScreen === 'setup' ? 'active' : ''}`} 
          onClick={goToHome}
        >
          Home
        </span>
        
        {state.games.length > 0 && (
          <div className="game-status">
            <span className="game-count">
              Game {state.session.currentGameIndex + 1}/{state.session.plannedGames}
            </span>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .navigation-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-lg);
          transition: var(--transition-normal);
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-lg);
        }
        
        .navigation-bar.scrolled {
          box-shadow: var(--shadow-md);
          background-color: rgba(255, 255, 255, 0.95);
        }
        
        .nav-logo {
          display: flex;
          align-items: center;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--primary-color);
        }
        
        .logo-icon {
          margin-right: var(--space-xs);
          font-size: 1.75rem;
        }
        
        .logo-text {
          background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        
        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        
        .nav-link {
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-fast);
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .nav-link:hover {
          background-color: var(--primary-light);
          color: var(--primary-color);
        }
        
        .nav-link.active {
          background-color: var(--primary-light);
          color: var(--primary-color);
          font-weight: 600;
        }
        
        .game-status {
          padding: var(--space-xs) var(--space-sm);
          background-color: var(--bg-color);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
          .navigation-bar {
            padding: var(--space-sm) var(--space-md);
          }
          
          .nav-logo {
            font-size: 1.25rem;
          }
          
          .logo-icon {
            font-size: 1.5rem;
          }
          
          .game-status {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default NavigationBar;