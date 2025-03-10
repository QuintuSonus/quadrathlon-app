import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import Button from '../core/Button';
import RandomizationService from '../../services/RandomizationService';
import AudioService from '../../services/AudioService';

const TeamGame = ({ game }) => {
  const { state, dispatch } = useAppState();
  const [teams, setTeams] = useState(game.teams || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [winningTeam, setWinningTeam] = useState(null);
  const [currentStep, setCurrentStep] = useState(!teams.length ? 'setup' : 'play');
  
  // Get all players from state
  const allPlayers = state.session.players;
  
  // Handle team generation
  const handleGenerateTeams = () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    // Start the team generation animation
    let counter = 0;
    const cycleInterval = setInterval(() => {
      // Create random teams for the animation
      const randomTeams = RandomizationService.createRandomTeams(allPlayers);
      setTeams(randomTeams);
      counter++;
      
      // Play the selection sound
      if (counter % 3 === 0) {
        AudioService.playSelectionSound();
      }
    }, 150);
    
    // After 2 seconds, stop and set the final teams
    setTimeout(() => {
      clearInterval(cycleInterval);
      
      const finalTeams = RandomizationService.createRandomTeams(allPlayers);
      setTeams(finalTeams);
      
      // Play final selection sound
      AudioService.playSelectionSound();
      
      // Update the game in state
      dispatch({
        type: ACTION_TYPES.UPDATE_GAME,
        payload: {
          id: game.id,
          updates: {
            teams: finalTeams
          }
        }
      });
      
      setIsGenerating(false);
      setCurrentStep('play');
    }, 2000);
  };
  
  // Handle selecting the winning team
  const handleSelectWinner = (teamIndex) => {
    setWinningTeam(teamIndex);
  };
  
  // Handle saving the game results
  const handleSaveResults = () => {
    if (winningTeam === null) return;
    
    // Calculate points
    const points = {};
    
    // Winning team gets 4000 points each
    teams[winningTeam].forEach(player => {
      points[player] = 4000;
    });
    
    // Losing team gets 2000 points each
    const losingTeamIndex = winningTeam === 0 ? 1 : 0;
    teams[losingTeamIndex].forEach(player => {
      points[player] = 2000;
    });
    
    // Update the game in state
    dispatch({
      type: ACTION_TYPES.UPDATE_GAME,
      payload: {
        id: game.id,
        updates: {
          teams,
          rankings: [
            ...teams[winningTeam],
            ...teams[losingTeamIndex]
          ],
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
    
    // Move to the next game
    dispatch({
      type: ACTION_TYPES.NEXT_GAME
    });
  };
  
  // Render team setup
  const renderTeamSetup = () => (
    <div className="team-generation">
      <h2>Team Generation</h2>
      <p>Generate random 2v2 teams from the four players.</p>
      
      <Button
        onClick={handleGenerateTeams}
        primary
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Teams'}
      </Button>
    </div>
  );
  
  // Render 2v2 match - directly ask for winner selection
  const renderTeamMatch = () => {
    return (
      <div className="team-match">
        <h2>2v2 Match</h2>
        
        <div className="teams-selection">
          <p className="selection-instruction">Select the winning team:</p>
          
          <div className="teams-container selectable">
            {teams.map((team, index) => (
              <div 
                key={index} 
                className={`team-card ${winningTeam === index ? 'selected' : ''}`}
                onClick={() => handleSelectWinner(index)}
              >
                <h3>Team {index + 1}</h3>
                <div className="team-players">
                  {team.map(player => (
                    <div key={player} className="team-player">{player}</div>
                  ))}
                </div>
                {winningTeam === index && (
                  <div className="winner-badge">Winner</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="team-controls">
          <Button
            onClick={handleSaveResults}
            primary
            disabled={winningTeam === null}
          >
            Save Results & Next Game
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="team-game">
      <h1>{game.name}</h1>
      
      {currentStep === 'setup' && renderTeamSetup()}
      {currentStep === 'play' && renderTeamMatch()}
    </div>
  );
};

export default TeamGame;