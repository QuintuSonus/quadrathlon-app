import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import Button from '../core/Button';
import AudioService from '../../services/AudioService';
import GameHistoryList from '../game/GameHistoryList';

const FinalStandingsReveal = () => {
  const { state, dispatch } = useAppState();
  const [showAddGames, setShowAddGames] = useState(false);
  const [selectedAdditionalGames, setSelectedAdditionalGames] = useState(4);
  const [graphData, setGraphData] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [revealState, setRevealState] = useState('initial'); // initial, drawing, complete
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [visiblePlayers, setVisiblePlayers] = useState([]);
  const [showPlayerNames, setShowPlayerNames] = useState(false);
  const [randomizedPlayers, setRandomizedPlayers] = useState([]);
  const [currentPoints, setCurrentPoints] = useState({});
  const [animationProgress, setAnimationProgress] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [maxGameCount, setMaxGameCount] = useState(0);
  const animationTimerRef = useRef(null);
  const svgRef = useRef(null);
  const svgWidth = 800;
  const svgHeight = 400;
  const marginTop = 40;
  const marginRight = 40;
  const marginBottom = 40;
  const marginLeft = 60;
  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  // Process game data to get cumulative scores for each player
  useEffect(() => {
    if (state.games.length === 0) return;

    // Calculate max possible score for graph scaling
    const totalScores = { ...state.playerScores };
    const maxPlayerScore = Math.max(...Object.values(totalScores));
    setMaxScore(Math.ceil(maxPlayerScore * 1.1 / 1000) * 1000); // Round up to next 1000 and add 10% padding
    setMaxGameCount(state.games.length);

    // Get all player names
    const playerNames = Object.keys(state.playerScores);
    
    // Sort players by score (descending)
    const sortedPlayers = [...playerNames].sort(
      (a, b) => state.playerScores[b] - state.playerScores[a]
    );
    setRankings(sortedPlayers);

    // Create random order of players for reveal
    const shuffled = [...playerNames];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRandomizedPlayers(shuffled);

    // Process game data to get cumulative scores
    const gameData = [];
    let cumulativeScores = {
      "David": 0,
      "Manu": 0,
      "Antoine": 0, 
      "Quentin": 0
    };

    state.games.forEach((game, index) => {
      if (game.points) {
        // Add game points to cumulative scores
        Object.entries(game.points).forEach(([player, points]) => {
          cumulativeScores[player] = (cumulativeScores[player] || 0) + points;
        });
      }

      // Create data point for this game
      gameData.push({
        game: `Game ${index + 1}`,
        gameNumber: index + 1,
        ...Object.fromEntries(
          Object.entries(cumulativeScores).map(([player, score]) => [player, score])
        )
      });
    });

    setGraphData(gameData);
    setCurrentPoints({});
  }, [state.games, state.playerScores]);

  // Start the reveal process
  const startReveal = () => {
    if (revealState !== 'initial') return;
    
    setRevealState('drawing');
    setCurrentPlayerIndex(0);
    setVisiblePlayers([]);
    setShowPlayerNames(false);
    setAnimationProgress(0);
    setCurrentPoints({});
    
    // Play sound to start
    AudioService.playSelectionSound();
    
    // Start the first player animation (with a slight delay to ensure state is updated)
    setTimeout(() => {
      startPlayerAnimation(0);
    }, 100);
  };

  // Start animation for a specific player
  const startPlayerAnimation = (playerIndex) => {
    if (playerIndex >= randomizedPlayers.length) {
      // All players animated, reveal names
      setTimeout(() => {
        setShowPlayerNames(true);
        // Play winner sound
        AudioService.playRankingSound(1);
      }, 1000);
      return;
    }

    // Clear any existing animation timer
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    // Get the current player and add to visible players
    const player = randomizedPlayers[playerIndex];
    setVisiblePlayers(prev => [...prev, player]);
    setCurrentPlayerIndex(playerIndex);
    
    // Reset animation progress
    setAnimationProgress(0);
    
    // Start the animation with a timer instead of requestAnimationFrame
    let progress = 0;
    const animationStep = 2; // Speed of animation (higher = faster)
    const animationInterval = 30; // ms between steps (lower = faster)
    
    const animate = () => {
      progress += animationStep;
      if (progress <= 100) {
        setAnimationProgress(progress);
        animationTimerRef.current = setTimeout(animate, animationInterval);
      } else {
        // Animation complete
        setAnimationProgress(100);
        
        // Update current points
        setCurrentPoints(prev => ({
          ...prev,
          [player]: state.playerScores[player]
        }));
        
        // Play sound
        AudioService.playSelectionSound();
        
        // Delay before moving to next player
        setTimeout(() => {
          startPlayerAnimation(playerIndex + 1);
        }, 800);
      }
    };
    
    // Start the animation
    animationTimerRef.current = setTimeout(animate, 500);
  };

  // Clean up animation timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  // Handle adding more games
  const handleAddGames = () => {
    dispatch({
      type: ACTION_TYPES.EXTEND_SESSION,
      payload: {
        additionalGames: selectedAdditionalGames
      }
    });
  };

  // Start a new session
  const handleStartNew = () => {
    dispatch({
      type: ACTION_TYPES.CREATE_SESSION,
      payload: {
        plannedGames: 4
      }
    });
  };

  // Toggle add games panel
  const toggleAddGames = () => {
    setShowAddGames(!showAddGames);
  };

  // Get player color - uses anonymous colors until the final reveal
  const getPlayerColor = (player) => {
    // Original player colors (only show these after the reveal)
    const playerColors = {
      'David': '#4285F4',    // Blue
      'Manu': '#EA4335',     // Red
      'Antoine': '#FBBC05',  // Yellow
      'Quentin': '#34A853'   // Green
    };
    
    // Anonymous colors for the animation phase (different from player colors to avoid spoilers)
    const anonymousColors = [
      '#6C5CE7', // Purple
      '#E84393', // Pink
      '#00B894', // Teal
      '#FF9F43'  // Orange
    ];
    
    // If names are revealed, use the actual player colors
    if (showPlayerNames) {
      return playerColors[player] || '#888888';
    }
    
    // During animation, use the position in the randomized array to assign an anonymous color
    const playerIndex = randomizedPlayers.indexOf(player);
    if (playerIndex >= 0) {
      return anonymousColors[playerIndex % anonymousColors.length];
    }
    
    return '#888888'; // Fallback
  };

  // Get player rank for label display
  const getPlayerRank = (player) => {
    const rank = rankings.indexOf(player) + 1;
    const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
    return `${rank}${suffix}`;
  };

  // Format score for display
  const formatScore = (score) => {
    return score.toLocaleString();
  };

  // Generate path for player line
  const generatePlayerPath = (player) => {
    if (!graphData.length) return "";
    
    // Calculate x and y positions
    const xScale = chartWidth / (maxGameCount);
    const yScale = chartHeight / maxScore;
    
    // Create path
    let path = "";
    graphData.forEach((data, i) => {
      const x = marginLeft + i * xScale;
      const y = svgHeight - marginBottom - (data[player] * yScale);
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  // Generate y-axis labels
  const generateYAxisLabels = () => {
    const labels = [];
    const step = maxScore / 5;
    
    for (let i = 0; i <= 5; i++) {
      const value = i * step;
      const y = svgHeight - marginBottom - (value * chartHeight / maxScore);
      
      labels.push(
        <g key={`y-label-${i}`}>
          <line 
            x1={marginLeft - 5} 
            y1={y} 
            x2={marginLeft} 
            y2={y} 
            stroke="#666" 
          />
          <text 
            x={marginLeft - 10} 
            y={y} 
            textAnchor="end" 
            dominantBaseline="middle" 
            fontSize="12"
            fill="#666"
          >
            {formatScore(value)}
          </text>
          <line 
            x1={marginLeft} 
            y1={y} 
            x2={svgWidth - marginRight} 
            y2={y} 
            stroke="#ddd" 
            strokeDasharray="3,3" 
          />
        </g>
      );
    }
    
    return labels;
  };

  // Generate x-axis labels
  const generateXAxisLabels = () => {
    const labels = [];
    
    graphData.forEach((data, i) => {
      const xScale = chartWidth / (maxGameCount);
      const x = marginLeft + i * xScale;
      
      labels.push(
        <g key={`x-label-${i}`}>
          <line 
            x1={x} 
            y1={svgHeight - marginBottom} 
            x2={x} 
            y2={svgHeight - marginBottom + 5} 
            stroke="#666" 
          />
          <text 
            x={x} 
            y={svgHeight - marginBottom + 20} 
            textAnchor="middle" 
            fontSize="12"
            fill="#666"
          >
            Game {i + 1}
          </text>
        </g>
      );
    });
    
    return labels;
  };

  // Render the add games panel
  const renderAddGamesPanel = () => (
    <div className="add-games-panel">
      <h3>Add More Games</h3>
      
      <div className="games-selector">
        <div className="game-count-selector session-extension">
          <div className="selector-options">
            {[4, 8, 12].map(count => (
              <button
                key={count}
                className={`selector-option ${selectedAdditionalGames === count ? 'selected' : ''}`}
                onClick={() => setSelectedAdditionalGames(count)}
              >
                {count} Games
              </button>
            ))}
          </div>
        </div>
        
        <div className="extension-summary">
          <p>Current games: {state.games.length}</p>
          <p>Additional games: {selectedAdditionalGames}</p>
          <p className="extension-total">New total: {state.games.length + selectedAdditionalGames}</p>
        </div>
        
        <Button onClick={handleAddGames} primary>
          Add Games & Continue
        </Button>
        
        <Button onClick={toggleAddGames} style={{ marginTop: '10px' }}>
          Cancel
        </Button>
      </div>
    </div>
  );

  // Render score display for a player
  const renderPlayerScoreDisplay = (player, index) => {
    const isRevealed = visiblePlayers.includes(player);
    const playerIndex = randomizedPlayers.indexOf(player);
    // Use numeric index during animation, real name after reveal
    const displayName = showPlayerNames ? player : `Player ${playerIndex + 1}`;
    const color = getPlayerColor(player);
    const rank = showPlayerNames ? getPlayerRank(player) : '';
    const score = currentPoints[player] || 0;
    
    // Add transition effect when switching to real colors
    const transitionStyle = showPlayerNames ? 'all 0.5s ease-in-out' : 'none';
    
    return (
      <div 
        key={player} 
        className={`player-score-display ${isRevealed ? 'revealed' : ''} ${showPlayerNames ? 'named' : ''}`}
        style={{ 
          '--player-color': color,
          animation: isRevealed && !showPlayerNames ? 'pulse 1s infinite' : 'none',
          transition: transitionStyle
        }}
      >
        <div className="player-score-name">
          <span 
            className="player-color-indicator"
            style={{ 
              backgroundColor: color,
              transition: transitionStyle
            }}
          ></span>
          <span className="player-name">{displayName}</span>
          {showPlayerNames && <span className="player-rank">{rank}</span>}
        </div>
        <div className="player-score-value" style={{ color: color, transition: transitionStyle }}>
          {isRevealed ? formatScore(score) : '?'} pts
        </div>
      </div>
    );
  };

  return (
    <div className="final-standings">
      <h1>Final Standings</h1>
      
      {showAddGames ? (
        renderAddGamesPanel()
      ) : revealState === 'initial' ? (
        <div className="reveal-intro">
          <p>The moment of truth has arrived! See who won the Quadrathlon!</p>
          
          <div className="game-history-section">
            <h3>Game History</h3>
            <p>Review and edit game results before the final reveal:</p>
            <GameHistoryList
              games={state.games}
              currentGameIndex={state.games.length - 1}
            />
          </div>
          
          <div className="reveal-options">
            <Button onClick={toggleAddGames}>
              Add More Games First
            </Button>
            
            <Button onClick={startReveal} primary large>
              Reveal Final Results
            </Button>
          </div>
        </div>
      ) : (
        <div className="results-reveal-container">
          <div className="score-graph-container">
            <svg 
              ref={svgRef}
              width="100%" 
              height={svgHeight} 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="score-graph-svg"
            >
              {/* Chart Background */}
              <rect 
                x={marginLeft} 
                y={marginTop} 
                width={chartWidth} 
                height={chartHeight} 
                fill="#f9f9f9" 
                stroke="#ddd"
              />
              
              {/* Y-Axis */}
              <line 
                x1={marginLeft} 
                y1={marginTop} 
                x2={marginLeft} 
                y2={svgHeight - marginBottom} 
                stroke="#666" 
                strokeWidth="1"
              />
              <text 
                x={15} 
                y={svgHeight / 2} 
                transform={`rotate(-90, 15, ${svgHeight / 2})`}
                textAnchor="middle"
                fontSize="14"
                fill="#666"
              >
                Points
              </text>
              {generateYAxisLabels()}
              
              {/* X-Axis */}
              <line 
                x1={marginLeft} 
                y1={svgHeight - marginBottom} 
                x2={svgWidth - marginRight} 
                y2={svgHeight - marginBottom} 
                stroke="#666" 
                strokeWidth="1"
              />
              <text 
                x={svgWidth / 2} 
                y={svgHeight - 5} 
                textAnchor="middle"
                fontSize="14"
                fill="#666"
              >
                Games
              </text>
              {generateXAxisLabels()}
              
              {/* Player Score Lines */}
              {randomizedPlayers.map((player, index) => {
                const isVisible = visiblePlayers.includes(player);
                if (!isVisible) return null;
                
                const playerPath = generatePlayerPath(player);
                const isAnimating = index === currentPlayerIndex;
                const pathLength = 1000; // Approximate path length
                
                // Calculate how much of the path to show based on animation progress
                const dashOffset = isAnimating ? 
                  pathLength * (1 - animationProgress / 100) : 0;
                
                return (
                  <g key={player}>
                    <path
                      id={`path-${player}`}
                      d={playerPath}
                      fill="none"
                      stroke={getPlayerColor(player)}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: isAnimating ? pathLength : 'none',
                        strokeDashoffset: dashOffset,
                        opacity: 1
                      }}
                    />
                    
                    {/* Data points */}
                    {graphData.map((data, i) => {
                      const xScale = chartWidth / (maxGameCount);
                      const yScale = chartHeight / maxScore;
                      const x = marginLeft + i * xScale;
                      const y = svgHeight - marginBottom - (data[player] * yScale);
                      
                      // Only show dots up to the current animation progress for the currently animating player
                      const gameProgress = (i + 1) / graphData.length * 100;
                      if (isAnimating && gameProgress > animationProgress) {
                        return null;
                      }
                      
                      return (
                        <circle
                          key={`dot-${player}-${i}`}
                          cx={x}
                          cy={y}
                          r="5"
                          fill={getPlayerColor(player)}
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="player-scores-list">
            {randomizedPlayers.map((player, index) => 
              renderPlayerScoreDisplay(player, index)
            )}
          </div>
          
          {showPlayerNames && (
            <div className="final-actions">
              <Button onClick={toggleAddGames}>
                Add More Games
              </Button>
              
              <Button onClick={handleStartNew} primary>
                Start New Quadrathlon
              </Button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .results-reveal-container {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .score-graph-container {
          margin-bottom: 30px;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .score-graph-svg {
          max-width: 100%;
          height: auto;
        }
        
        .player-scores-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        
        .player-score-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          opacity: 0.7;
        }
        
        .player-score-display.revealed {
          opacity: 1;
          border-left: 5px solid var(--player-color);
        }
        
        .player-score-display.named {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
        }
        
        .player-score-name {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }
        
        .player-color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .player-score-value {
          font-weight: 700;
          font-family: monospace;
          color: var(--player-color, #333);
          font-size: 1.1rem;
        }
        
        .player-rank {
          font-size: 0.8rem;
          background-color: var(--player-color);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
        }
        
        .final-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 40px;
        }
        
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @media (max-width: 768px) {
          .player-scores-list {
            grid-template-columns: 1fr;
          }
          
          .final-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default FinalStandingsReveal;