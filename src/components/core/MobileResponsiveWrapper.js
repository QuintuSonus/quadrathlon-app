import React, { useEffect } from 'react';

const MobileResponsiveWrapper = ({ children }) => {
  useEffect(() => {
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    
    // Add our mobile responsive styles
    const responsiveStyle = document.createElement('style');
    responsiveStyle.textContent = `
      /* Mobile Responsive Enhancements for Quadrathlon Gaming App */

      /* ===== Core Mobile Improvements ===== */
      :root {
        /* Additional responsive variables */
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 16px;
        --spacing-lg: 24px;
        --spacing-xl: 32px;
      }

      /* Base container adjustments */
      .app-container {
        width: 100%;
        padding: 10px;
        max-width: 100%;
      }

      .main-content {
        padding: 15px;
        margin-top: 10px;
        overflow-x: hidden; /* Prevent horizontal scrolling on mobile */
      }

      /* Typography adjustments for mobile */
      h1 {
        font-size: 1.8rem;
        margin-bottom: 20px;
      }

      h2 {
        font-size: 1.5rem;
      }

      h3 {
        font-size: 1.2rem;
      }

      /* ===== Navigation Improvements ===== */
      .navigation-bar {
        padding: 10px 15px;
        position: sticky;
        top: 0;
        z-index: 100;
        background-color: white;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      /* ===== Button Enhancements ===== */
      .btn {
        min-height: 44px; /* Minimum touch target size */
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        margin: 5px 0;
        font-size: 1rem;
      }

      /* Horizontal button container for when we need buttons side by side */
      .button-row {
        display: flex;
        gap: 10px;
        width: 100%;
        flex-wrap: wrap;
      }

      .button-row .btn {
        flex: 1;
        min-width: 120px; /* Ensure buttons have reasonable minimum width */
      }

      /* Game count selector for mobile */
      .selector-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 8px;
      }

      .selector-option {
        padding: 12px 5px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }

      /* Player display for mobile */
      .player-display {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }

      .player-card {
        padding: 10px;
        width: 100%;
      }

      /* Scoring tools layout */
      @media (max-width: 768px) {
        .button-group, .ranking-actions, .team-controls, .final-actions, .reveal-options {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 10px;
        }
        
        .scoring-tools {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .scoring-tool {
          margin-bottom: 10px;
          padding: 15px;
        }
        
        /* Game type selection on mobile */
        .game-type-selector {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        
        /* Tournament bracket for mobile */
        .tournament-brackets {
          flex-direction: column;
        }
        
        /* Team views for mobile */
        .teams-container {
          flex-direction: column;
        }
        
        .team-card {
          max-width: 100%;
          width: 100%;
        }
        
        /* Method selection for mobile */
        .method-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }
        
        /* Timer controls for mobile */
        .preset-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
        }
        
        /* Results screen adjustments */
        .player-scores-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        /* Modal improvements */
        .ranking-modal {
          width: 100%;
          max-width: 100%;
          height: 100%;
          max-height: 100%;
          border-radius: 0;
        }
        
        .modal-footer {
          flex-direction: column;
          gap: 8px;
        }
        
        .modal-footer .btn {
          width: 100%;
        }
        
        /* Player scores and stats tables */
        @media (max-width: 480px) {
          .player-score-header, .score-header,
          .player-score-row, .team-score-row {
            grid-template-columns: 1fr; /* Stack columns on very small screens */
            text-align: left;
          }
          
          .player-score-value, .team-score-value {
            text-align: left;
            padding-left: 15px;
            border-left: 3px solid #eee;
            margin-top: 5px;
          }
          
          .player-name, .team-name {
            font-weight: 600;
            font-size: 1.1rem;
          }
        }
      }
    `;
    document.head.appendChild(responsiveStyle);
    
    // Clean up when component unmounts
    return () => {
      if (responsiveStyle.parentNode) {
        responsiveStyle.parentNode.removeChild(responsiveStyle);
      }
    };
  }, []);

  return <>{children}</>;
};

export default MobileResponsiveWrapper;
