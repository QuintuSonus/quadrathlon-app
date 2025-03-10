import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import Button from '../core/Button';

const SessionCompleteScreen = () => {
  const { state, dispatch } = useAppState();
  const [selectedAdditionalGames, setSelectedAdditionalGames] = useState(4);
  
  // Handle adding more games
  const handleAddGames = () => {
    dispatch({
      type: ACTION_TYPES.EXTEND_SESSION,
      payload: {
        additionalGames: selectedAdditionalGames
      }
    });
  };
  
  // Handle viewing final results
  const handleViewResults = () => {
    dispatch({
      type: ACTION_TYPES.COMPLETE_SESSION
    });
  };
  
  // Get total games played
  const gamesPlayed = state.games.length;
  const totalPlannedGames = state.session.plannedGames;
  
  return (
    <div className="session-complete-screen">
      <div className="complete-message">
        <h1>Session Complete!</h1>
        <p>You have completed all {totalPlannedGames} planned games.</p>
      </div>
      
      <div className="complete-options">
        <div className="option-card add-games">
          <h2>Add More Games?</h2>
          <p>Continue your Quadrathlon with additional games.</p>
          
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
              <p>Current games: {gamesPlayed}</p>
              <p>Additional games: {selectedAdditionalGames}</p>
              <p className="extension-total">New total: {gamesPlayed + selectedAdditionalGames}</p>
            </div>
            
            <Button onClick={handleAddGames} primary>
              Add Games & Continue
            </Button>
          </div>
        </div>
        
        <div className="option-card view-results">
          <h2>View Final Results</h2>
          <p>Reveal the final standings and see who won the Quadrathlon!</p>
          
          <div className="scores-preview">
            <p>Scores are hidden until reveal</p>
            <div className="hidden-scores">
              {Object.keys(state.playerScores).map(player => (
                <div key={player} className="hidden-score">
                  <span className="hidden-player">{player}</span>
                  <span className="hidden-value">???? pts</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={handleViewResults} primary large>
            Show Final Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionCompleteScreen;