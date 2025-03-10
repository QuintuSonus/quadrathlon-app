import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import Button from '../core/Button';
import AudioService from '../../services/AudioService';

const FinalStandingsReveal = () => {
  const { state, dispatch } = useAppState();
  const [revealStep, setRevealStep] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [showAddGames, setShowAddGames] = useState(false);
  const [selectedAdditionalGames, setSelectedAdditionalGames] = useState(4);
  
  // Calculate final rankings on component mount
  useEffect(() => {
    // Get all player scores
    const playerScores = state.playerScores;
    
    // Sort players by score (descending)
    const sortedPlayers = Object.entries(playerScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([player]) => player);
    
    setRankings(sortedPlayers);
  }, [state.playerScores]);
  
  // Start the reveal animation
  const startReveal = () => {
    if (isRevealing) return;
    
    setIsRevealing(true);
    setRevealStep(1);
    
    // Play sound for 4th place
    AudioService.playRankingSound(4);
    
    // Reveal each place with a delay
    setTimeout(() => {
      setRevealStep(2);
      AudioService.playRankingSound(3);
    }, 3000);
    
    setTimeout(() => {
      setRevealStep(3);
      AudioService.playRankingSound(2);
    }, 6000);
    
    setTimeout(() => {
      setRevealStep(4);
      AudioService.playRankingSound(1);
      setIsRevealing(false);
    }, 9000);
  };
  
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
    // Clear the current session
    dispatch({
      type: ACTION_TYPES.CREATE_SESSION,
      payload: {
        plannedGames: 4
      }
    });
  };
  
  // Format player score for display
  const formatScore = (score) => {
    return score.toLocaleString();
  };
  
  // Toggle add games panel
  const toggleAddGames = () => {
    setShowAddGames(!showAddGames);
  };
  
  // Render player card with rank
  const renderPlayerCard = (player, rank) => {
    if (!player) return null;
    
    const score = state.playerScores[player] || 0;
    
    return (
      <div className={`player-ranking rank-${rank}`}>
        <div className="rank-number">{rank}</div>
        <div className="rank-player">{player}</div>
        <div className="rank-score">{formatScore(score)} points</div>
      </div>
    );
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
  
  return (
    <div className="final-standings">
      <h1>Final Standings</h1>
      
      {showAddGames ? (
        renderAddGamesPanel()
      ) : revealStep === 0 ? (
        <div className="reveal-intro">
          <p>The moment of truth has arrived! See who won the Quadrathlon!</p>
          
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
        <div className="rankings-display">
          {revealStep >= 1 && (
            <div className="ranking-section fourth">
              <h2>4th Place</h2>
              {renderPlayerCard(rankings[3], 4)}
            </div>
          )}
          
          {revealStep >= 2 && (
            <div className="ranking-section third">
              <h2>3rd Place</h2>
              {renderPlayerCard(rankings[2], 3)}
            </div>
          )}
          
          {revealStep >= 3 && (
            <div className="ranking-section second">
              <h2>2nd Place</h2>
              {renderPlayerCard(rankings[1], 2)}
            </div>
          )}
          
          {revealStep >= 4 && (
            <div className="ranking-section first">
              <h2>1st Place - Champion</h2>
              {renderPlayerCard(rankings[0], 1)}
            </div>
          )}
          
          {revealStep >= 4 && (
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
    </div>
  );
};

export default FinalStandingsReveal;