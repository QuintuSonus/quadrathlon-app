import React, { useState, useEffect } from 'react';
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

const CooperativeGame = ({ game }) => {
  const { state, dispatch } = useAppState();
  const [teams, setTeams] = useState(game.teams || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [teamScores, setTeamScores] = useState(game.scores || {});
  const [activeScoreTools, setActiveScoreTools] = useState(game.scoringMethods || []);
  const [toolScores, setToolScores] = useState({});
  const [winningTeam, setWinningTeam] = useState(null);
  const [currentStep, setCurrentStep] = useState(!teams.length ? 'setup' : 'play');
  
  // Add state for persistent timer configuration
  const [sessionCountdownDuration, setSessionCountdownDuration] = useState(60000);
  
  // Keep track of tool values across teams
  const [persistentToolValues, setPersistentToolValues] = useState({
    countdown: 60000,
    stopwatch: 0,
    counter: 0,
    manual: 0
  });
  
  // Get all players from state
  const allPlayers = state.session.players;
  
  // This is the function that was missing - it handles real-time score updates
  const handleToolValueUpdate = (tool, value) => {
    setToolScores(prev => ({
      ...prev,
      [tool]: value
    }));
    
    // Also update the persistent values when tools change
    if (tool === 'countdown') {
      setPersistentToolValues(prev => ({
        ...prev,
        countdown: value
      }));
    }
  };
  
  // New function to handle countdown duration changes
  const handleCountdownDurationChange = (duration) => {
    setSessionCountdownDuration(duration);
    setPersistentToolValues(prev => ({
      ...prev,
      countdown: duration
    }));
  };
  
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
  
  // Handle saving scores for the current team
  const handleSaveTeamScore = () => {
    // Create a unique key for the team
    const teamKey = `team${currentTeamIndex}`;
    
    // Save scores for the team
    const newScores = {
      ...teamScores,
      [teamKey]: toolScores
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
    
    // Reset for next team or move to selecting the winner
    if (currentTeamIndex === 0) {
      // Save current tool values first, so they're preserved when switching teams
      const currentToolScores = { ...toolScores };
      setCurrentTeamIndex(1);
      
      // Keep tool scores in persistent state but clear the current team's scores
      setToolScores({});
    } else {
      setCurrentStep('results');
    }
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
  
  // Render team play/scoring
  const renderTeamPlay = () => {
    const currentTeam = teams[currentTeamIndex];
    
    return (
      <div className="team-play">
        <h2>Team {currentTeamIndex + 1}</h2>
        
        <div className="current-team">
          <div className="team-players">
            {currentTeam.map(player => (
              <div key={player} className="team-player">{player}</div>
            ))}
          </div>
        </div>
        
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
              key="stopwatch-stable"
              onSaveScore={(score) => handleToolValueUpdate('stopwatch', score)}
              onValueChange={(value) => handleToolValueUpdate('stopwatch', value)}
            />
          )}
          
          {activeScoreTools.includes('countdown') && (
            <CountdownTimer
              key="countdown-stable" // Use a stable key to prevent recreation
              onSaveScore={(score) => handleToolValueUpdate('countdown', score)}
              onValueChange={(value) => handleToolValueUpdate('countdown', value)}
              sessionDuration={toolScores.countdown || persistentToolValues.countdown} // Use existing value if available
              onDurationChange={handleCountdownDurationChange}
            />
          )}
          
          {activeScoreTools.includes('counter') && (
            <CounterTool
              key="counter-stable"
              onSaveScore={(score) => handleToolValueUpdate('counter', score)}
              onValueChange={(value) => handleToolValueUpdate('counter', value)}
            />
          )}
          
          {activeScoreTools.includes('manual') && (
            <ManualScoreInput
              key="manual-stable"
              onSaveScore={(score) => handleToolValueUpdate('manual', score)}
              onValueChange={(value) => handleToolValueUpdate('manual', value)}
            />
          )}
        </div>
        
        <div className="save-scores">
          <Button
            onClick={handleSaveTeamScore}
            primary
          >
            {currentTeamIndex === 0 ? "Save & Next Team" : "Save & Compare Results"}
          </Button>
        </div>
      </div>
    );
  };
  
  // Render results and winner selection
  const renderResults = () => (
    <div className="team-results">
      <h2>Team Results</h2>
      
      <div className="team-scores-recap">
        <h3>Team Scores:</h3>
        <div className="team-scores-grid">
          <div className="score-header">
            <div>Team</div>
            {activeScoreTools.map(tool => (
              <div key={tool} className="score-header">
                {tool === 'stopwatch' ? 'Stopwatch' : 
                 tool === 'countdown' ? 'Countdown' : 
                 tool === 'counter' ? 'Counter' : 'Manual'}
              </div>
            ))}
          </div>
          
          {teams.map((team, index) => (
            <div 
              key={index} 
              className={`team-score-row ${winningTeam === index ? 'winning' : ''}`}
              onClick={() => handleSelectWinner(index)}
            >
              <div className="team-name">
                Team {index + 1} 
                ({team.join(', ')})
                {winningTeam === index && <span className="winner-badge">Winner</span>}
              </div>
              
              {activeScoreTools.map(tool => {
                // Get team's scores for this tool
                const teamScore = teamScores[`team${index}`] ? teamScores[`team${index}`][tool] : undefined;
                
                return (
                  <div key={tool} className="team-score-value">
                    {teamScore !== undefined ? formatScore(teamScore, tool) : 'N/A'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="winner-instructions">
        <p>Tap on the winning team to select them.</p>
      </div>
      
      <div className="team-controls">
        <Button onClick={() => setCurrentStep('play')}>
          Edit Scores
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
    <div className="cooperative-game">
      <h1>{game.name}</h1>
      
      {currentStep === 'setup' && renderTeamSetup()}
      {currentStep === 'play' && renderTeamPlay()}
      {currentStep === 'results' && renderResults()}
    </div>
  );
};

export default CooperativeGame;