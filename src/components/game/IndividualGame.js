import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import PlayerDisplay from '../setup/PlayerDisplay';
import ScoringMethodSelector from '../scoring/ScoringMethodSelector';
import StopwatchTool from '../scoring/StopwatchTool';
import CountdownTimer from '../scoring/CountdownTimer';
import CounterTool from '../scoring/CounterTool';
import ManualScoreInput from '../scoring/ManualScoreInput';
import Button from '../core/Button';
import RandomizationService from '../../services/RandomizationService';
import AudioService from '../../services/AudioService';

const IndividualGame = ({ game }) => {
  console.log("IndividualGame rendered, game:", game.id);
  const componentIdRef = useRef(Math.random().toString(36).substr(2, 9)); // Unique ID
  
  const { state, dispatch } = useAppState();
  const [currentStep, setCurrentStep] = useState('play'); // 'play', 'rank'
  const [playerOrder, setPlayerOrder] = useState(game.playerOrder || []);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playedPlayers, setPlayedPlayers] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [playerScores, setPlayerScores] = useState(game.scores || {});
  const [activeScoreTools, setActiveScoreTools] = useState(game.scoringMethods || []);
  const [rankings, setRankings] = useState(game.rankings || []);
  const [toolScores, setToolScores] = useState({});
  
  // Add state for persistent timer configuration
  const [sessionCountdownDuration, setSessionCountdownDuration] = useState(60000);
  
  // Log component lifecycle
  useEffect(() => {
    console.log(`[IndGame ${componentIdRef.current}] Component mounted`);
    return () => {
      console.log(`[IndGame ${componentIdRef.current}] Component unmounted`);
    };
  }, []);
  
  // Track player changes
  useEffect(() => {
    console.log(`[IndGame ${componentIdRef.current}] selectedPlayer changed to:`, selectedPlayer);
  }, [selectedPlayer]);
  
  // Track tool scores
  useEffect(() => {
    console.log(`[IndGame ${componentIdRef.current}] toolScores:`, toolScores);
  }, [toolScores]);
  
  // Get all players from state
  const allPlayers = state.session.players;
  
  // Players that haven't played yet
  const availablePlayers = allPlayers.filter(p => !playedPlayers.includes(p));
  
  // This is the function that was missing - it handles real-time score updates
  const handleToolValueUpdate = (tool, value) => {
    console.log(`[IndGame ${componentIdRef.current}] Tool value update - ${tool}:`, value);
    setToolScores(prev => {
      const newScores = {
        ...prev,
        [tool]: value
      };
      console.log(`[IndGame ${componentIdRef.current}] Updated toolScores:`, newScores);
      return newScores;
    });
  };
  
  // New function to handle countdown duration changes
  const handleCountdownDurationChange = (duration) => {
    console.log(`[IndGame ${componentIdRef.current}] Countdown duration changed to:`, duration);
    setSessionCountdownDuration(duration);
  };
  
  // Handle random player selection
  const handleRandomizePlayer = () => {
    if (isSelecting || availablePlayers.length === 0) return;
    
    console.log(`[IndGame ${componentIdRef.current}] Starting player randomization`);
    setIsSelecting(true);
    
    // Start the selection animation
    let counter = 0;
    const cycleInterval = setInterval(() => {
      const cyclePlayer = allPlayers[counter % allPlayers.length];
      setSelectedPlayer(cyclePlayer);
      counter++;
      
      // Play the selection sound
      if (counter % 3 === 0) {
        AudioService.playSelectionSound();
      }
    }, 150);
    
    // After 2 seconds, stop on a random player
    setTimeout(() => {
      clearInterval(cycleInterval);
      
      const finalPlayer = RandomizationService.selectRandomPlayer(
        availablePlayers
      );
      
      console.log(`[IndGame ${componentIdRef.current}] Selected player:`, finalPlayer);
      setSelectedPlayer(finalPlayer);
      
      // Play final selection sound
      AudioService.playSelectionSound();
      
      // Update player order
      const newPlayerOrder = [...playerOrder];
      if (!newPlayerOrder.includes(finalPlayer)) {
        newPlayerOrder.push(finalPlayer);
      }
      setPlayerOrder(newPlayerOrder);
      
      // Update the game in state
      dispatch({
        type: ACTION_TYPES.UPDATE_GAME,
        payload: {
          id: game.id,
          updates: {
            playerOrder: newPlayerOrder
          }
        }
      });
      
      setIsSelecting(false);
      
      // Reset tool scores for new player
      console.log(`[IndGame ${componentIdRef.current}] Resetting tool scores for new player`);
      setToolScores({});
    }, 2000);
  };
  
  // Handle saving scores for the current player
  const handleSavePlayerScore = () => {
    if (!selectedPlayer) return;
    
    console.log(`[IndGame ${componentIdRef.current}] Saving scores for player:`, selectedPlayer);
    console.log(`[IndGame ${componentIdRef.current}] Current tool scores:`, toolScores);
    
    // Save scores for the current player
    const newScores = {
      ...playerScores,
      [selectedPlayer]: toolScores
    };
    
    console.log(`[IndGame ${componentIdRef.current}] Updated player scores:`, newScores);
    setPlayerScores(newScores);
    setPlayedPlayers([...playedPlayers, selectedPlayer]);
    
    // Update the game in state
    dispatch({
      type: ACTION_TYPES.UPDATE_GAME,
      payload: {
        id: game.id,
        updates: {
          scores: newScores
        }
      }
    });
    
    console.log(`[IndGame ${componentIdRef.current}] Reset for next player`);
    // Reset for next player
    setSelectedPlayer(null);
    setToolScores({});
    
    // If all players have played, move to ranking
    if (playedPlayers.length + 1 >= allPlayers.length) {
      console.log(`[IndGame ${componentIdRef.current}] All players have played, moving to ranking`);
      setCurrentStep('rank');
    }
  };
  
  // Handle active scoring tool selection
  const handleScoreToolChange = (tools) => {
    console.log(`[IndGame ${componentIdRef.current}] Score tools changed to:`, tools);
    setActiveScoreTools(tools);
    
    // Update the game in state
    dispatch({
      type: ACTION_TYPES.UPDATE_GAME,
      payload: {
        id: game.id,
        updates: {
          scoringMethods: tools
        }
      }
    });
    
    // Update UI state
    dispatch({
      type: ACTION_TYPES.SET_ACTIVE_SCORE_TOOLS,
      payload: {
        tools
      }
    });
  };
  
  // Handle player ranking
  const handlePlayerRank = (player) => {
    // Only allow ranking if the player isn't already ranked
    if (rankings.includes(player)) return;
    
    console.log(`[IndGame ${componentIdRef.current}] Ranking player:`, player);
    
    // Add the player to the next ranking position
    const newRankings = [...rankings, player];
    setRankings(newRankings);
    
    // If all players are ranked, update game and prepare to save
    if (newRankings.length === allPlayers.length) {
      console.log(`[IndGame ${componentIdRef.current}] All players ranked`);
      
      // Calculate points based on rankings
      const points = {
        [newRankings[0]]: 4000, // 1st place
        [newRankings[1]]: 3000, // 2nd place
        [newRankings[2]]: 2000, // 3rd place
        [newRankings[3]]: 1000  // 4th place
      };
      
      // Update the game in state
      dispatch({
        type: ACTION_TYPES.UPDATE_GAME,
        payload: {
          id: game.id,
          updates: {
            rankings: newRankings,
            points
          }
        }
      });
    }
  };
  
  // Clear all rankings to start over
  const handleClearRankings = () => {
    console.log(`[IndGame ${componentIdRef.current}] Clearing rankings`);
    setRankings([]);
  };
  
  // Save rankings and proceed to next game
  const handleSaveRankings = () => {
    if (rankings.length !== allPlayers.length) return;
    
    console.log(`[IndGame ${componentIdRef.current}] Saving rankings and proceeding to next game`);
    
    // Calculate points based on rankings
    const points = {
      [rankings[0]]: 4000, // 1st place
      [rankings[1]]: 3000, // 2nd place
      [rankings[2]]: 2000, // 3rd place
      [rankings[3]]: 1000  // 4th place
    };
    
    // Update player scores
    dispatch({
      type: ACTION_TYPES.UPDATE_PLAYER_SCORE,
      payload: {
        points
      }
    });
    
    // Move to the next game
    dispatch({
      type: ACTION_TYPES.NEXT_GAME
    });
  };
  
  // Format a score for display
  const formatScore = (score, tool) => {
    if (score === undefined) return 'N/A';
    
    if (tool === 'stopwatch' || tool === 'countdown') {
      // Format time as mm:ss.ms
      const minutes = Math.floor(score / 60000);
      const seconds = Math.floor((score % 60000) / 1000);
      const ms = Math.floor((score % 1000) / 10);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    return score.toString();
  };
  
  // Render player selection and scoring
  const renderPlayerSelection = () => {
    console.log(`[IndGame ${componentIdRef.current}] Rendering player selection, selectedPlayer:`, selectedPlayer);
    
    return (
      <div className="player-selection-scoring">
        <div className="player-selection">
          <h2>Player Selection</h2>
          
          <div className="played-status">
            <div className="played-label">Already played:</div>
            <div className="played-players">
              {playedPlayers.map(player => (
                <span key={player} className="played-player">{player}</span>
              ))}
            </div>
          </div>
          
          {selectedPlayer ? (
            <div className="current-player">
              <h3>Current Player: {selectedPlayer}</h3>
              <PlayerDisplay
                players={[selectedPlayer]}
                highlightedPlayer={selectedPlayer}
              />
            </div>
          ) : (
            <div className="player-selection-controls">
              <Button
                onClick={handleRandomizePlayer}
                primary
                disabled={isSelecting || availablePlayers.length === 0}
              >
                {isSelecting ? 'Selecting...' : 'Randomize Next Player'}
              </Button>
              
              {availablePlayers.length === 0 && (
                <p>All players have played. Proceed to ranking.</p>
              )}
            </div>
          )}
        </div>
        
        {selectedPlayer && (
          <div className="player-scoring">
            <div className="scoring-method-selection">
              <h3>Scoring Methods</h3>
              <ScoringMethodSelector
                selected={activeScoreTools}
                onChange={handleScoreToolChange}
              />
            </div>
            
            <div className="scoring-tools">
              {activeScoreTools.includes('stopwatch') && (
                <StopwatchTool
                  onSaveScore={(score) => handleToolValueUpdate('stopwatch', score)}
                  onValueChange={(value) => handleToolValueUpdate('stopwatch', value)}
                />
              )}
              
              {activeScoreTools.includes('countdown') && (
  <CountdownTimer
    key="countdown-stable" // Use a stable key to prevent recreation
    onSaveScore={(score) => handleToolValueUpdate('countdown', score)}
    onValueChange={(value) => handleToolValueUpdate('countdown', value)}
    sessionDuration={toolScores.countdown || sessionCountdownDuration} // Use existing value if available
    onDurationChange={handleCountdownDurationChange}
  />
)}
              
              {activeScoreTools.includes('counter') && (
                <CounterTool
                  onSaveScore={(score) => handleToolValueUpdate('counter', score)}
                  onValueChange={(value) => handleToolValueUpdate('counter', value)}
                />
              )}
              
              {activeScoreTools.includes('manual') && (
                <ManualScoreInput
                  onSaveScore={(score) => handleToolValueUpdate('manual', score)}
                  onValueChange={(value) => handleToolValueUpdate('manual', value)}
                />
              )}
            </div>
            
            <div className="save-scores">
              <Button
                onClick={handleSavePlayerScore}
                primary
              >
                Save & Next Player
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render the ranking step with score recap
  const renderRankingStep = () => (
    <div className="ranking-step">
      <h2>Player Rankings</h2>
      
      <div className="ranking-instructions">
        <p>Tap on players in order from 1st to 4th place based on their performance.</p>
        <p className="ranking-position-indicator">
          Currently assigning position: 
          <span className="position-number">
            {rankings.length === 0 ? '1st' : 
             rankings.length === 1 ? '2nd' : 
             rankings.length === 2 ? '3rd' : 
             rankings.length === 3 ? '4th' : 'Complete'}
          </span>
        </p>
      </div>
      
      <div className="player-scores-recap">
        <h3>Player Scores:</h3>
        <div className="player-scores-grid">
          <div className="player-score-header">
            <div>Player</div>
            {activeScoreTools.map(tool => (
              <div key={tool} className="score-header">
                {tool === 'stopwatch' ? 'Stopwatch' : 
                 tool === 'countdown' ? 'Countdown' : 
                 tool === 'counter' ? 'Counter' : 'Manual'}
              </div>
            ))}
          </div>
          
          {allPlayers.map(player => {
            // Get player's scores for each tool
            const playerScore = playerScores[player] || {};
            
            return (
              <div 
                key={player} 
                className={`player-score-row ${rankings.includes(player) ? 'ranked' : ''}`}
                onClick={() => handlePlayerRank(player)}
              >
                <div className="player-name">
                  {player}
                  {rankings.includes(player) && (
                    <span className="player-rank">
                      {rankings.indexOf(player) + 1}
                      {rankings.indexOf(player) === 0 ? 'st' : 
                       rankings.indexOf(player) === 1 ? 'nd' :
                       rankings.indexOf(player) === 2 ? 'rd' : 'th'}
                    </span>
                  )}
                </div>
                
                {activeScoreTools.map(tool => (
                  <div key={tool} className="player-score-value">
                    {playerScore[tool] !== undefined ? formatScore(playerScore[tool], tool) : 'N/A'}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="ranking-actions">
        <Button onClick={handleClearRankings}>
          Clear & Restart Ranking
        </Button>
        
        <Button
          onClick={handleSaveRankings}
          primary
          disabled={rankings.length !== allPlayers.length}
        >
          Save Rankings & Next Game
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="individual-game">
      <h1>{game.name} (ID: {componentIdRef.current.substring(0, 4)})</h1>
      
      {currentStep === 'play' ? renderPlayerSelection() : renderRankingStep()}
      
      {currentStep === 'play' && playedPlayers.length === allPlayers.length && (
        <div className="proceed-to-ranking">
          <Button 
            onClick={() => setCurrentStep('rank')} 
            primary
          >
            All Players Done - Proceed to Ranking
          </Button>
        </div>
      )}
    </div>
  );
};

export default IndividualGame;