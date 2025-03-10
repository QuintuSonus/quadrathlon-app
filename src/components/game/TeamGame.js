import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import Button from '../core/Button';
import ScoringMethodSelector from '../scoring/ScoringMethodSelector';
import StopwatchTool from '../scoring/StopwatchTool';
import CountdownTimer from '../scoring/CountdownTimer';
import CounterTool from '../scoring/CounterTool';
import ManualScoreInput from '../scoring/ManualScoreInput';
import RandomizationService from '../../services/RandomizationService';
import AudioService from '../../services/AudioService';

const TeamGame = ({ game }) => {
  const { state, dispatch } = useAppState();
  const [teams, setTeams] = useState(game.teams || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamScores, setTeamScores] = useState(game.scores || {});
  const [activeScoreTools, setActiveScoreTools] = useState(game.scoringMethods || []);
  const [toolScores, setToolScores] = useState({});
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
  
  // Handle tool score update
  const handleToolScoreUpdate = (tool, score) => {
    setToolScores({
      ...toolScores,
      [tool]: score
    });
  };
  
  // Handle active scoring tool selection
  const handleScoreToolChange = (tools) => {
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
  
  // Handle saving scores
  const handleSaveScores = () => {
    // Save team scores
    const newScores = {
      ...teamScores,
      'match': toolScores
    };
    
    setTeamScores(newScores);
    
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
    
    setCurrentStep('results');
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
  
  // Render 2v2 match
  const renderTeamMatch = () => {
    return (
      <div className="team-match">
        <h2>2v2 Match</h2>
        
        <div className="teams-container">
          {teams.map((team, index) => (
            <div key={index} className="team-card">
              <h3>Team {index + 1}</h3>
              <div className="team-players">
                {team.map(player => (
                  <div key={player} className="team-player">{player}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="scoring-section">
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
                onSaveScore={(score) => handleToolScoreUpdate('stopwatch', score)}
              />
            )}
            
            {activeScoreTools.includes('countdown') && (
              <CountdownTimer
                onSaveScore={(score) => handleToolScoreUpdate('countdown', score)}
              />
            )}
            
            {activeScoreTools.includes('counter') && (
              <CounterTool
                onSaveScore={(score) => handleToolScoreUpdate('counter', score)}
              />
            )}
            
            {activeScoreTools.includes('manual') && (
              <ManualScoreInput
                onSaveScore={(score) => handleToolScoreUpdate('manual', score)}
              />
            )}
          </div>
        </div>
        
        <div className="save-scores">
          <Button
            onClick={handleSaveScores}
            primary
          >
            Save Scores & Select Winner
          </Button>
        </div>
      </div>
    );
  };
  
  // Render results view
  const renderResults = () => (
    <div className="team-results">
      <h2>Select Winner</h2>
      
      <div className="team-scores-recap">
        <div className="score-summary">
          {Object.keys(toolScores).length > 0 ? (
            <div className="score-details">
              {Object.entries(toolScores).map(([tool, score]) => (
                <div key={tool} className="score-item">
                  <span className="score-tool">
                    {tool === 'stopwatch' ? 'Stopwatch' : 
                     tool === 'countdown' ? 'Countdown' : 
                     tool === 'counter' ? 'Counter' : 'Manual'}:
                  </span>
                  <span className="score-value">{formatScore(score, tool)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No scores recorded</p>
          )}
        </div>
      </div>
      
      <div className="teams-selection">
        <p className="selection-instruction">Tap on the winning team:</p>
        
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
        <Button onClick={() => setCurrentStep('play')}>
          Back to Match
        </Button>
        
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
  
  return (
    <div className="team-game">
      <h1>{game.name}</h1>
      
      {currentStep === 'setup' && renderTeamSetup()}
      {currentStep === 'play' && renderTeamMatch()}
      {currentStep === 'results' && renderResults()}
    </div>
  );
};

export default TeamGame;