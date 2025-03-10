import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import Button from '../core/Button';

const GameHistoryList = ({ games, currentGameIndex }) => {
  const { dispatch } = useAppState();
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameRankings, setSelectedGameRankings] = useState([]);
  const [winningTeamIndex, setWinningTeamIndex] = useState(null);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // When a game is selected, extract all players for the game
  useEffect(() => {
    if (!selectedGame) return;
    
    let players = [];
    
    if (selectedGame.type === 'individual') {
      // For individual games, use playerOrder
      players = selectedGame.playerOrder || ['David', 'Manu', 'Antoine', 'Quentin'];
    } else if (selectedGame.type === 'tournament') {
      // For tournament games, extract players from bracket
      if (selectedGame.bracket && selectedGame.bracket.semifinals) {
        const semi1Players = selectedGame.bracket.semifinals[0].players || [];
        const semi2Players = selectedGame.bracket.semifinals[1].players || [];
        players = [...semi1Players, ...semi2Players];
      } else {
        // Fallback to default players
        players = ['David', 'Manu', 'Antoine', 'Quentin'];
      }
    } else if (selectedGame.type === 'cooperative' || selectedGame.type === '2v2') {
      // For team games, flatten all teams
      if (selectedGame.teams) {
        players = selectedGame.teams.flat();
      } else {
        players = ['David', 'Manu', 'Antoine', 'Quentin'];
      }
    } else {
      // Default fallback
      players = ['David', 'Manu', 'Antoine', 'Quentin'];
    }
    
    setAllPlayers(players);
  }, [selectedGame]);
  
  // Handle clicking on a game in history
  const handleGameClick = (game, index) => {
    setSelectedGame(game);
    
    if (game.type === 'individual' || game.type === 'tournament') {
      setSelectedGameRankings(game.rankings || []);
    } else if (game.type === 'cooperative' || game.type === '2v2') {
      // For team-based games, determine which team was the winner
      if (game.rankings && game.rankings.length >= 2 && game.teams) {
        const winners = [game.rankings[0], game.rankings[1]];
        
        // Check if team 1 or team 2 won
        if (game.teams[0].every(player => winners.includes(player))) {
          setWinningTeamIndex(0);
        } else if (game.teams[1].every(player => winners.includes(player))) {
          setWinningTeamIndex(1);
        } else {
          setWinningTeamIndex(null);
        }
      } else {
        setWinningTeamIndex(null);
      }
    }
    
    setShowRankingModal(true);
  };
  
  // Handle ranking a player (for individual/tournament games)
  const handlePlayerRank = (player) => {
    // Only allow ranking if the player isn't already ranked
    if (selectedGameRankings.includes(player)) return;
    
    // Add the player to the next ranking position
    const newRankings = [...selectedGameRankings, player];
    setSelectedGameRankings(newRankings);
  };
  
  // Handle selecting a winning team (for cooperative/2v2 games)
  const handleTeamSelect = (teamIndex) => {
    setWinningTeamIndex(teamIndex);
  };
  
  // Clear all rankings to start over
  const handleClearRankings = () => {
    setSelectedGameRankings([]);
    setWinningTeamIndex(null);
  };
  
  // Calculate points based on rankings
  const calculatePoints = (game, rankings) => {
    const points = {};
    
    if (game.type === 'individual' || game.type === 'tournament') {
      // Individual rankings
      points[rankings[0]] = 4000; // 1st place
      points[rankings[1]] = 3000; // 2nd place
      points[rankings[2]] = 2000; // 3rd place
      points[rankings[3]] = 1000; // 4th place
    } else if ((game.type === 'cooperative' || game.type === '2v2') && winningTeamIndex !== null) {
      // Team rankings
      const winningTeam = game.teams[winningTeamIndex];
      const losingTeam = game.teams[winningTeamIndex === 0 ? 1 : 0];
      
      // Winning team gets 4000 points each
      winningTeam.forEach(player => {
        points[player] = 4000;
      });
      
      // Losing team gets 2000 points each
      losingTeam.forEach(player => {
        points[player] = 2000;
      });
    }
    
    return points;
  };
  
  // Save updated rankings
  const handleSaveRankings = () => {
    if (!selectedGame) return;
    
    // Check if we have valid rankings based on game type
    let isValid = false;
    let newRankings = [];
    let points = {};
    let updates = {};
    
    if (selectedGame.type === 'individual') {
      isValid = selectedGameRankings.length === 4;
      newRankings = selectedGameRankings;
      points = calculatePoints(selectedGame, newRankings);
      updates = {
        rankings: newRankings,
        points
      };
    } else if (selectedGame.type === 'tournament') {
      isValid = selectedGameRankings.length === 4;
      newRankings = selectedGameRankings;
      points = calculatePoints(selectedGame, newRankings);
      
      // For tournaments, we also need to update the bracket
      const updatedBracket = updateTournamentBracket(selectedGame.bracket, newRankings);
      updates = {
        rankings: newRankings,
        points,
        bracket: updatedBracket
      };
    } else if ((selectedGame.type === 'cooperative' || selectedGame.type === '2v2') && winningTeamIndex !== null) {
      isValid = true;
      
      // Create rankings based on the winning team
      const winningTeam = selectedGame.teams[winningTeamIndex];
      const losingTeam = selectedGame.teams[winningTeamIndex === 0 ? 1 : 0];
      
      // Rankings for team games are ordered: winning team players, then losing team players
      newRankings = [...winningTeam, ...losingTeam];
      points = calculatePoints(selectedGame, newRankings);
      updates = {
        rankings: newRankings,
        points
      };
    }
    
    if (!isValid) return;
    
    // Update the game in state
    dispatch({
      type: ACTION_TYPES.UPDATE_GAME,
      payload: {
        id: selectedGame.id,
        updates
      }
    });
    
    // Update player scores
    dispatch({
      type: ACTION_TYPES.UPDATE_PLAYER_SCORE,
      payload: {
        points
      }
    });
    
    // Close the modal
    setShowRankingModal(false);
    setSelectedGame(null);
  };
  
  // Close the modal without saving
  const handleCancelRanking = () => {
    setShowRankingModal(false);
    setSelectedGame(null);
  };
  
  // Get game type display text
  const getGameTypeDisplay = (gameType) => {
    switch (gameType) {
      case 'individual':
        return 'Individual';
      case 'cooperative':
        return 'Cooperative';
      case 'tournament':
        return '1v1 Tournament';
      case '2v2':
        return '2v2';
      default:
        return gameType;
    }
  };
  
  // Get a summary of game results
  const getGameResultsSummary = (game) => {
    if (!game.rankings || game.rankings.length === 0) {
      return 'Results pending';
    }
    
    if (game.type === 'individual' || game.type === 'tournament') {
      return `1st: ${game.rankings[0] || '?'}`;
    } else {
      // For cooperative and 2v2 games, show the winning team
      const team1 = game.teams[0] || [];
      const team2 = game.teams[1] || [];
      
      if (game.rankings && game.rankings.length >= 2) {
        const winners = [game.rankings[0], game.rankings[1]];
        
        if (team1.every(player => winners.includes(player))) {
          return `Winners: Team 1`;
        } else if (team2.every(player => winners.includes(player))) {
          return `Winners: Team 2`;
        }
      }
      
      return 'Results pending';
    }
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
  
  // Update tournament bracket based on new rankings
  const updateTournamentBracket = (bracket, rankings) => {
    if (!bracket || rankings.length !== 4) return bracket;
    
    const updatedBracket = { ...bracket };
    
    // Update the final winner to be the 1st ranked player
    if (updatedBracket.final && updatedBracket.final.players) {
      updatedBracket.final.winner = rankings[0];
    }
    
    // Update the small final winner to be the 3rd ranked player
    if (updatedBracket.smallFinal && updatedBracket.smallFinal.players) {
      updatedBracket.smallFinal.winner = rankings[2];
    }
    
    // Store the rankings
    updatedBracket.rankings = rankings;
    
    return updatedBracket;
  };
  
  // Render Individual/Tournament Game Ranking Editor with mobile optimizations
  const renderIndividualOrTournamentRankingEditor = () => {
    if (!selectedGame) return null;
    
    return (
      <div className="game-ranking-editor">
        <div className="ranking-instructions">
          <p>Tap on players in order from 1st to 4th place.</p>
          <p className="ranking-position-indicator">
            Currently assigning position: 
            <span className="position-number">
              {selectedGameRankings.length === 0 ? '1st' : 
               selectedGameRankings.length === 1 ? '2nd' : 
               selectedGameRankings.length === 2 ? '3rd' : 
               selectedGameRankings.length === 3 ? '4th' : 'Complete'}
            </span>
          </p>
        </div>
        
        <div className="player-scores-recap">
          <h3>Player Scores:</h3>
          <div className={`player-scores-grid ${isMobile ? 'mobile-grid' : ''}`}>
            {!isMobile && (
              <div className="player-score-header">
                <div>Player</div>
                {selectedGame.type === 'tournament' ? (
                  <>
                    <div className="score-header">Matches</div>
                    <div className="score-header">Wins</div>
                  </>
                ) : (
                  selectedGame.scoringMethods && selectedGame.scoringMethods.map(tool => (
                    <div key={tool} className="score-header">
                      {tool === 'stopwatch' ? 'Stopwatch' : 
                       tool === 'countdown' ? 'Countdown' : 
                       tool === 'counter' ? 'Counter' : 'Manual'}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {allPlayers.map(player => {
              // Get score data based on game type
              let scoreData = {};
              
              if (selectedGame.type === 'tournament') {
                scoreData = getTournamentPlayerScores(player);
              } else {
                scoreData = selectedGame.scores && selectedGame.scores[player] ? selectedGame.scores[player] : {};
              }
              
              return (
                <div 
                  key={player} 
                  className={`player-score-row ${selectedGameRankings.includes(player) ? 'ranked' : ''}`}
                  onClick={() => handlePlayerRank(player)}
                >
                  <div className="player-name">
                    {player}
                    {selectedGameRankings.includes(player) && (
                      <span className="player-rank">
                        {selectedGameRankings.indexOf(player) + 1}
                        {selectedGameRankings.indexOf(player) === 0 ? 'st' : 
                         selectedGameRankings.indexOf(player) === 1 ? 'nd' :
                         selectedGameRankings.indexOf(player) === 2 ? 'rd' : 'th'}
                      </span>
                    )}
                  </div>
                  
                  {selectedGame.type === 'tournament' ? (
                    <>
                      {isMobile && <div className="score-label">Matches</div>}
                      <div className="player-score-value">{scoreData.matches || 0}</div>
                      
                      {isMobile && <div className="score-label">Wins</div>}
                      <div className="player-score-value">{scoreData.wins || 0}</div>
                    </>
                  ) : (
                    selectedGame.scoringMethods && selectedGame.scoringMethods.map(tool => (
                      <React.Fragment key={tool}>
                        {isMobile && (
                          <div className="score-label">
                            {tool === 'stopwatch' ? 'Stopwatch' : 
                             tool === 'countdown' ? 'Countdown' : 
                             tool === 'counter' ? 'Counter' : 'Manual'}
                          </div>
                        )}
                        <div className="player-score-value">
                          {formatScore(scoreData[tool], tool)}
                        </div>
                      </React.Fragment>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Get player scores for a tournament game
  const getTournamentPlayerScores = (player) => {
    if (!selectedGame || !selectedGame.bracket) return {};
    
    // For tournament games, we need to look at the match results
    const result = {
      matches: 0,
      wins: 0
    };
    
    // Check semifinals
    selectedGame.bracket.semifinals.forEach(match => {
      if (match.players && match.players.includes(player)) {
        result.matches++;
        if (match.winner === player) {
          result.wins++;
        }
      }
    });
    
    // Check final
    if (selectedGame.bracket.final.players && selectedGame.bracket.final.players.includes(player)) {
      result.matches++;
      if (selectedGame.bracket.final.winner === player) {
        result.wins++;
      }
    }
    
    // Check small final
    if (selectedGame.bracket.smallFinal.players && selectedGame.bracket.smallFinal.players.includes(player)) {
      result.matches++;
      if (selectedGame.bracket.smallFinal.winner === player) {
        result.wins++;
      }
    }
    
    return result;
  };
  
  // Render Team Game Ranking Editor with mobile optimizations
  const renderTeamRankingEditor = () => {
    if (!selectedGame || !selectedGame.teams || selectedGame.teams.length !== 2) return null;
    
    const teams = selectedGame.teams;
    
    return (
      <div className="team-ranking-editor">
        <div className="ranking-instructions">
          <p>Select the winning team:</p>
        </div>
        
        <div className="teams-selection">
          <div className={`teams-container selectable ${isMobile ? 'mobile-teams' : ''}`}>
            {teams.map((team, index) => (
              <div 
                key={index} 
                className={`team-card ${winningTeamIndex === index ? 'selected' : ''}`}
                onClick={() => handleTeamSelect(index)}
              >
                <h3>Team {index + 1}</h3>
                <div className="team-players">
                  {team.map(player => (
                    <div key={player} className="team-player">{player}</div>
                  ))}
                </div>
                {winningTeamIndex === index && (
                  <div className="winner-badge">Winner</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="team-scores-recap">
          <h3>Team Scores:</h3>
          {selectedGame.scores && Object.keys(selectedGame.scores).length > 0 ? (
            <div className={`team-scores-grid ${isMobile ? 'mobile-grid' : ''}`}>
              {!isMobile && (
                <div className="score-header">
                  <div>Team</div>
                  {selectedGame.scoringMethods && selectedGame.scoringMethods.map(tool => (
                    <div key={tool} className="score-header">
                      {tool === 'stopwatch' ? 'Stopwatch' : 
                       tool === 'countdown' ? 'Countdown' : 
                       tool === 'counter' ? 'Counter' : 'Manual'}
                    </div>
                  ))}
                </div>
              )}
              
              {teams.map((team, index) => {
                // Get team scores
                const teamScore = selectedGame.scores[`team${index}`] || {};
                
                return (
                  <div key={index} className="team-score-row">
                    <div className="team-name">Team {index + 1}</div>
                    
                    {selectedGame.scoringMethods && selectedGame.scoringMethods.map(tool => (
                      <React.Fragment key={tool}>
                        {isMobile && (
                          <div className="score-label">
                            {tool === 'stopwatch' ? 'Stopwatch' : 
                             tool === 'countdown' ? 'Countdown' : 
                             tool === 'counter' ? 'Counter' : 'Manual'}
                          </div>
                        )}
                        <div className="team-score-value">
                          {formatScore(teamScore[tool], tool)}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No scores recorded for this game</p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="game-history-list">
        {games.length === 0 ? (
          <div className="empty-history">No games played yet</div>
        ) : (
          <div className="history-items">
            {games.slice(0, currentGameIndex + 1).map((game, index) => (
              <div
                key={game.id}
                className={`history-item ${index === currentGameIndex ? 'current' : ''}`}
                onClick={() => handleGameClick(game, index)}
              >
                <div className="history-game-name">{game.name}</div>
                <div className="history-game-type">{getGameTypeDisplay(game.type)}</div>
                <div className="history-game-results">{getGameResultsSummary(game)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Game History Ranking Modal with mobile optimizations */}
      {showRankingModal && selectedGame && (
        <div className="modal-overlay">
          <div className={`ranking-modal ${isMobile ? 'mobile-modal' : ''}`}>
            <div className="modal-header">
              <h2>{selectedGame.name} - Final Rankings</h2>
              <button className="modal-close" onClick={handleCancelRanking}>×</button>
            </div>
            
            <div className="modal-body">
              {(selectedGame.type === 'individual' || selectedGame.type === 'tournament') ? 
                renderIndividualOrTournamentRankingEditor() :
                renderTeamRankingEditor()
              }
            </div>
            
            <div className="modal-footer">
              <Button onClick={handleClearRankings}>
                Clear Rankings
              </Button>
              
              <Button
                onClick={handleSaveRankings}
                primary
                disabled={(selectedGame.type === 'individual' || selectedGame.type === 'tournament') ? 
                          selectedGameRankings.length !== 4 : 
                          winningTeamIndex === null}
              >
                Save Rankings
              </Button>
              
              <Button onClick={handleCancelRanking}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile specific styles */}
      <style jsx>{`
        .mobile-grid {
          display: flex;
          flex-direction: column;
        }
        
        .mobile-grid .player-score-row,
        .mobile-grid .team-score-row {
          margin-bottom: 15px;
          padding: 12px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }
        
        .mobile-grid .player-name,
        .mobile-grid .team-name {
          font-size: 1.1rem;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
        
        .mobile-grid .score-label {
          font-weight: 500;
          font-size: 0.9rem;
          color: #666;
          margin-top: 8px;
        }
        
        .mobile-grid .player-score-value,
        .mobile-grid .team-score-value {
          font-size: 1.1rem;
          margin-left: 10px;
          font-family: monospace;
        }
        
        .mobile-teams {
          flex-direction: column;
        }
        
        .mobile-teams .team-card {
          width: 100%;
          max-width: 100%;
          margin-bottom: 10px;
        }
        
        .mobile-modal {
          height: 100vh;
          width: 100%;
          border-radius: 0;
          margin: 0;
        }
        
        .mobile-modal .modal-body {
          padding: 15px;
          overflow-y: auto;
        }
        
        .mobile-modal .modal-footer {
          padding: 10px 15px;
          flex-direction: column;
          gap: 10px;
        }
        
        .mobile-modal .modal-footer .btn {
          width: 100%;
        }
      `}</style>
    </>
  );
};

export default GameHistoryList;