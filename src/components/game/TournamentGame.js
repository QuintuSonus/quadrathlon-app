import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import Button from '../core/Button';
import RandomizationService from '../../services/RandomizationService';
import AudioService from '../../services/AudioService';

const TournamentGame = ({ game }) => {
  const { state, dispatch } = useAppState();
  const [bracket, setBracket] = useState(game.bracket || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMatch, setCurrentMatch] = useState('semi1');
  const [tournamentComplete, setTournamentComplete] = useState(false);
  
  // Get all players from state
  const allPlayers = state.session.players;
  
  // Effect to check if all matches are complete
  useEffect(() => {
    if (!bracket) return;
    
    // Check if both final and small final are complete
    const finalComplete = bracket.final.winner !== null;
    const smallFinalComplete = bracket.smallFinal.winner !== null;
    
    // If both are complete, tournament is complete
    if (finalComplete && smallFinalComplete) {
      setTournamentComplete(true);
    }
  }, [bracket]);
  
  // Handle bracket generation
  const handleCreateTournament = () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    // Start the bracket generation animation
    let counter = 0;
    const cycleInterval = setInterval(() => {
      // Create random bracket for the animation
      const randomBracket = RandomizationService.generateTournamentBracket(allPlayers);
      setBracket(randomBracket);
      counter++;
      
      // Play the selection sound
      if (counter % 3 === 0) {
        AudioService.playSelectionSound();
      }
    }, 150);
    
    // After 2 seconds, stop and set the final bracket
    setTimeout(() => {
      clearInterval(cycleInterval);
      
      const finalBracket = RandomizationService.generateTournamentBracket(allPlayers);
      setBracket(finalBracket);
      
      // Play final selection sound
      AudioService.playSelectionSound();
      
      // Update the game in state
      dispatch({
        type: ACTION_TYPES.UPDATE_GAME,
        payload: {
          id: game.id,
          updates: {
            bracket: finalBracket
          }
        }
      });
      
      setIsGenerating(false);
    }, 2000);
  };
  
  // Handle selecting a match winner
  const handleSelectWinner = (matchId, winner) => {
    if (!bracket) return;
    
    // Update the bracket with the match result
    const updatedBracket = RandomizationService.updateTournamentBracket(
      bracket,
      matchId,
      winner
    );
    
    setBracket(updatedBracket);
    
    // Update the game in state
    dispatch({
      type: ACTION_TYPES.UPDATE_GAME,
      payload: {
        id: game.id,
        updates: {
          bracket: updatedBracket
        }
      }
    });
    
    // Determine the next match to show based on the current state
    const areFinalsReady = updatedBracket.final.players.length === 2 && 
                          updatedBracket.smallFinal.players.length === 2;
    
    // Only change current match if we're not already in the finals
    if (matchId === 'semi1' && currentMatch === 'semi1') {
      setCurrentMatch('semi2');
    } else if (matchId === 'semi2' && areFinalsReady) {
      // After semi2, check if both finals matches are ready
      if (currentMatch === 'semi2' || currentMatch === 'semi1') {
        // Move to any incomplete final match
        if (!updatedBracket.final.winner) {
          setCurrentMatch('final');
        } else if (!updatedBracket.smallFinal.winner) {
          setCurrentMatch('small');
        }
      }
    } else if (matchId === 'final' && currentMatch === 'final' && !updatedBracket.smallFinal.winner) {
      // If we just completed the final but small final is incomplete, move there
      setCurrentMatch('small');
    } else if (matchId === 'small' && currentMatch === 'small' && !updatedBracket.final.winner) {
      // If we just completed small final but final is incomplete, move there
      setCurrentMatch('final');
    }
    
    // Check if tournament is complete (both final and small final have winners)
    const tournamentComplete = updatedBracket.final.winner !== null && 
                              updatedBracket.smallFinal.winner !== null;
    
    if (tournamentComplete) {
      // We need to ensure we have correct rankings regardless of match completion order
      let finalRankings = [];
      
      // 1st place is the final winner
      finalRankings.push(updatedBracket.final.winner);
      
      // 2nd place is the final loser
      finalRankings.push(updatedBracket.final.players.find(p => p !== updatedBracket.final.winner));
      
      // 3rd place is the small final winner
      finalRankings.push(updatedBracket.smallFinal.winner);
      
      // 4th place is the small final loser
      finalRankings.push(updatedBracket.smallFinal.players.find(p => p !== updatedBracket.smallFinal.winner));
      
      // Calculate points based on rankings
      const points = {
        [finalRankings[0]]: 4000, // 1st place
        [finalRankings[1]]: 3000, // 2nd place
        [finalRankings[2]]: 2000, // 3rd place
        [finalRankings[3]]: 1000  // 4th place
      };
      
      // Update the game with final results
      dispatch({
        type: ACTION_TYPES.UPDATE_GAME,
        payload: {
          id: game.id,
          updates: {
            bracket: {
              ...updatedBracket,
              rankings: finalRankings
            },
            rankings: finalRankings,
            points
          }
        }
      });
      
      // Update player scores
      dispatch({
        type: ACTION_TYPES.UPDATE_PLAYER_SCORE,
        payload: {
          points
        }
      });
      
      setTournamentComplete(true);
    }
  };
  
  // Move to next game after tournament is complete
  const handleNextGame = () => {
    dispatch({
      type: ACTION_TYPES.NEXT_GAME
    });
  };
  
  // Get match status text
  const getMatchStatusText = (match) => {
    if (!match) return "";
    
    if (match.winner) {
      return `${match.winner} has won this match`;
    } else if (match.players.length === 2) {
      return "Select the winner of this match";
    } else {
      return "Waiting for previous matches to complete";
    }
  };
  
  // Render a match
  const renderMatch = (matchId) => {
    if (!bracket) return null;
    
    let match = null;
    let title = '';
    
    if (matchId.startsWith('semi')) {
      const semiIndex = matchId === 'semi1' ? 0 : 1;
      match = bracket.semifinals[semiIndex];
      title = `Semifinal ${semiIndex + 1}`;
    } else if (matchId === 'small') {
      match = bracket.smallFinal;
      title = 'Small Final (3rd Place Match)';
    } else if (matchId === 'final') {
      match = bracket.final;
      title = 'Final';
    }
    
    if (!match || match.players.length !== 2) {
      return (
        <div className="tournament-match empty">
          <h3>{title}</h3>
          <div className="match-status waiting">Waiting for players...</div>
        </div>
      );
    }
    
    return (
      <div className={`tournament-match ${match.winner ? 'completed' : 'active'}`}>
        <h3>{title}</h3>
        
        <div className="match-players">
          {match.players.map(player => (
            <div 
              key={player}
              className={`match-player ${match.winner === player ? 'winner' : ''}`}
              onClick={() => !match.winner && handleSelectWinner(matchId, player)}
            >
              {player}
              {match.winner === player && (
                <span className="winner-indicator">Winner</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="match-status">
          {getMatchStatusText(match)}
        </div>
      </div>
    );
  };
  
  // Render the tournament bracket
  const renderBracket = () => {
    if (!bracket) return null;
    
    // Check if both semifinals are complete
    const semifinalsComplete = bracket.semifinals[0].winner && bracket.semifinals[1].winner;
    
    return (
      <div className="tournament-view">
        <h2>Tournament Bracket</h2>
        
        <div className="tournament-brackets">
          <div className="bracket-column semifinals">
            <h3 className="bracket-column-title">Semifinals</h3>
            <div className="bracket-matches">
              {renderMatch('semi1')}
              {renderMatch('semi2')}
            </div>
          </div>
          
          <div className="bracket-column finals">
            <div className="bracket-section final-section">
              <h3 className="bracket-column-title">Final</h3>
              <div className="bracket-matches">
                {semifinalsComplete ? renderMatch('final') : (
                  <div className="tournament-match empty">
                    <h3>Final</h3>
                    <div className="match-status waiting">Waiting for semifinals to complete...</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bracket-section small-final-section">
              <h3 className="bracket-column-title">3rd Place Match</h3>
              <div className="bracket-matches">
                {semifinalsComplete ? renderMatch('small') : (
                  <div className="tournament-match empty">
                    <h3>3rd Place Match</h3>
                    <div className="match-status waiting">Waiting for semifinals to complete...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {!tournamentComplete ? (
          <div className="current-match-container">
            <h3>Current Match: {
              currentMatch === 'semi1' ? 'Semifinal 1' :
              currentMatch === 'semi2' ? 'Semifinal 2' :
              currentMatch === 'small' ? '3rd Place Match' : 'Final'
            }</h3>
            <div className="current-match-wrapper">
              {renderMatch(currentMatch)}
            </div>
          </div>
        ) : (
          <div className="tournament-complete">
            <h3>Tournament Complete</h3>
            <div className="tournament-results">
              <div className="result-item">
                <span className="result-position">1st Place:</span>
                <span className="result-player">{bracket.final.winner}</span>
                <span className="result-points">4,000 pts</span>
              </div>
              <div className="result-item">
                <span className="result-position">2nd Place:</span>
                <span className="result-player">{bracket.final.players.find(p => p !== bracket.final.winner)}</span>
                <span className="result-points">3,000 pts</span>
              </div>
              <div className="result-item">
                <span className="result-position">3rd Place:</span>
                <span className="result-player">{bracket.smallFinal.winner}</span>
                <span className="result-points">2,000 pts</span>
              </div>
              <div className="result-item">
                <span className="result-position">4th Place:</span>
                <span className="result-player">{bracket.smallFinal.players.find(p => p !== bracket.smallFinal.winner)}</span>
                <span className="result-points">1,000 pts</span>
              </div>
            </div>
            
            <div className="tournament-next-game">
              <Button 
                onClick={handleNextGame}
                primary
              >
                Save Results & Next Game
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="tournament-game">
      <h1>{game.name}</h1>
      
      {!bracket ? (
        <div className="tournament-setup">
          <h2>Tournament Setup</h2>
          <p>Create a 1v1 tournament bracket with all four players.</p>
          
          <Button
            onClick={handleCreateTournament}
            primary
            disabled={isGenerating}
          >
            {isGenerating ? 'Creating...' : 'Create Tournament'}
          </Button>
        </div>
      ) : (
        renderBracket()
      )}
    </div>
  );
};

export default TournamentGame;