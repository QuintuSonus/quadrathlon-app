import React, { useEffect } from 'react';

/**
 * ThemeProvider Component
 * Injects modern styling and theming to the application
 */
const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Add modern styling
    const styleElement = document.createElement('style');
    styleElement.id = 'quadrathlon-modern-theme';
    
    // Modern theme CSS
    styleElement.textContent = `
      /* Base theme variables */
      :root {
        /* Primary color palette */
        --primary-color: #4361EE;
        --primary-hover: #3A56D4;
        --primary-light: #D6E0FF;
        --primary-dark: #2B3FC2;
        
        /* Secondary colors */
        --secondary-color: #7209B7;
        --secondary-light: #9D4EDD;
        --secondary-hover: #6710A1;

        /* Accent colors for players */
        --player1-color: #4CC9F0; /* David - Blue */
        --player2-color: #F72585; /* Manu - Pink */
        --player3-color: #FF9E00; /* Antoine - Orange */
        --player4-color: #38B000; /* Quentin - Green */
        
        /* UI colors */
        --success-color: #10B981;
        --warning-color: #FBBF24;
        --danger-color: #EF4444;
        --info-color: #60A5FA;
        
        /* Neutral colors */
        --bg-color: #F8FAFC;
        --card-bg: #FFFFFF;
        --text-primary: #1E293B;
        --text-secondary: #64748B;
        --text-tertiary: #94A3B8;
        --border-color: #E2E8F0;
        --divider-color: #F1F5F9;
        
        /* Color RGB values for opacity */
        --primary-color-rgb: 67, 97, 238;
        --secondary-color-rgb: 114, 9, 183;
        --player1-color-rgb: 76, 201, 240;
        --player2-color-rgb: 247, 37, 133;
        --player3-color-rgb: 255, 158, 0;
        --player4-color-rgb: 56, 176, 0;
        --success-color-rgb: 16, 185, 129;
        --warning-color-rgb: 251, 191, 36;
        --danger-color-rgb: 239, 68, 68;
        --info-color-rgb: 96, 165, 250;
        
        /* Spacings */
        --space-2xs: 0.25rem;  /* 4px */
        --space-xs: 0.5rem;    /* 8px */
        --space-sm: 0.75rem;   /* 12px */
        --space-md: 1rem;      /* 16px */
        --space-lg: 1.5rem;    /* 24px */
        --space-xl: 2rem;      /* 32px */
        --space-2xl: 3rem;     /* 48px */
        
        /* Borders */
        --radius-sm: 0.375rem; /* 6px */
        --radius-md: 0.5rem;   /* 8px */
        --radius-lg: 0.75rem;  /* 12px */
        --radius-xl: 1rem;     /* 16px */
        --radius-full: 9999px;
        
        /* Shadows */
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        
        /* Transitions */
        --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
        --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
        --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Google font imports */
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Montserrat:wght@600;700;800&display=swap');
      
      /* Global styling */
      body {
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: var(--bg-color);
        background-image: 
          linear-gradient(to bottom, rgba(67, 97, 238, 0.03), rgba(67, 97, 238, 0.02)),
          radial-gradient(circle at 30% 20%, rgba(76, 201, 240, 0.05) 0%, transparent 25%),
          radial-gradient(circle at 80% 70%, rgba(114, 9, 183, 0.05) 0%, transparent 25%);
        color: var(--text-primary);
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .app-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: var(--space-md);
      }
      
      .main-content {
        background-color: var(--card-bg);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        padding: var(--space-xl);
        margin-top: var(--space-md);
        position: relative;
        overflow: hidden;
      }
      
      .main-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        line-height: 1.2;
        color: var(--text-primary);
        margin-bottom: var(--space-md);
      }
      
      h1 {
        font-size: 2.5rem;
        margin-bottom: var(--space-xl);
        position: relative;
        display: inline-block;
      }
      
      h1::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 50%;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        border-radius: var(--radius-full);
      }
      
      .app-title {
        font-size: 2.75rem;
        font-weight: 800;
        text-align: center;
        margin-bottom: var(--space-2xl);
        position: relative;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
      }
      
      /* Enhanced buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        font-size: 0.9375rem;
        padding: 0.625rem 1.25rem;
        border-radius: var(--radius-md);
        border: none;
        cursor: pointer;
        transition: var(--transition-normal);
        background-color: var(--bg-color);
        color: var(--text-secondary);
        box-shadow: var(--shadow-sm);
        min-height: 2.75rem;
        gap: 0.5rem;
      }
      
      .btn:hover:not(:disabled) {
        background-color: var(--border-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .btn-primary {
        background-color: var(--primary-color);
        color: white;
      }
      
      .btn-primary:hover:not(:disabled) {
        background-color: var(--primary-hover);
      }
      
      .btn-large {
        font-size: 1.125rem;
        padding: 0.75rem 1.5rem;
        min-height: 3.25rem;
      }
      
      /* Navigation */
      .navigation-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-md) 0;
        margin-bottom: var(--space-lg);
      }
      
      .nav-logo {
        font-family: 'Montserrat', sans-serif;
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--primary-color);
        position: relative;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .nav-logo::before {
        content: '🎮';
        margin-right: var(--space-xs);
      }
      
      /* Setup screen */
      .setup-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .setup-section {
        margin-bottom: var(--space-xl);
        padding: var(--space-lg);
        background-color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        position: relative;
        overflow: hidden;
        width: 100%;
      }
      
      .setup-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
      }
      
      /* Player cards */
      .player-card {
        position: relative;
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        background-color: white;
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: center;
        transition: var(--transition-normal);
        border: 2px solid transparent;
        overflow: hidden;
      }
      
      .player-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 100%;
        background-color: var(--player-color, var(--primary-color));
        transition: var(--transition-normal);
      }
      
      .player-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-lg);
      }
      
      /* Game progress */
      .progress-bar {
        height: 10px;
        background-color: var(--border-color);
        border-radius: var(--radius-full);
        overflow: hidden;
        box-shadow: var(--shadow-inner);
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        transition: width 0.5s ease-out;
        border-radius: var(--radius-full);
        position: relative;
        overflow: hidden;
      }
      
      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.2) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0.2) 75%,
          transparent 75%
        );
        background-size: 20px 20px;
        animation: progress-animation 1s linear infinite;
      }
      
      @keyframes progress-animation {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 20px 0;
        }
      }
      
      /* Scoring tools */
      .scoring-tool {
        background-color: white;
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        box-shadow: var(--shadow-md);
        margin-bottom: var(--space-lg);
        transition: var(--transition-normal);
        border: 1px solid var(--border-color);
      }
      
      .scoring-tool:hover {
        box-shadow: var(--shadow-lg);
      }
      
      .score-display {
        font-size: 2.5rem;
        text-align: center;
        margin: var(--space-lg) 0;
        font-weight: 700;
        font-family: monospace;
        color: var(--text-primary);
        background-color: var(--bg-color);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-inner);
      }
      
      /* Game type cards */
      .game-type-selector {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
      }
      
      .type-card {
        background-color: white;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--space-xl) var(--space-lg);
        cursor: pointer;
        transition: var(--transition-normal);
        text-align: center;
        box-shadow: var(--shadow-sm);
      }
      
      .type-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-light);
      }
      
      .type-card.selected {
        border-color: var(--primary-color);
        background-color: rgba(var(--primary-color-rgb), 0.05);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.3), var(--shadow-md);
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .main-content {
          padding: var(--space-md);
        }
        
        .app-container {
          padding: var(--space-xs);
        }
        
        .game-type-selector {
          grid-template-columns: 1fr;
        }
        
        h1 {
          font-size: 2rem;
        }
        
        .app-title {
          font-size: 2.25rem;
        }
      }
      
      /* Animations */
      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.4);
        }
        70% {
          transform: scale(1.02);
          box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb), 0);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0);
        }
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Cleanup function
    return () => {
      const existingStyle = document.getElementById('quadrathlon-modern-theme');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  
  return <>{children}</>;
};

export default ThemeProvider;