import React from 'react';
import { useAppState } from '../../context/StateContext';
import StopwatchTool from './StopwatchTool';
import CountdownTimer from './CountdownTimer';
import CounterTool from './CounterTool';
import ManualScoreInput from './ManualScoreInput';
import Button from '../core/Button';

const ScoringScreen = () => {
  const { state, dispatch } = useAppState();
  
  // This is a simplified placeholder component
  // In a real implementation, this would handle scoring for the current game
  
  return (
    <div className="scoring-screen">
      <h1>Game Scoring</h1>
      
      <div className="scoring-tools-container">
        <div className="scoring-tool-wrapper">
          <StopwatchTool />
        </div>
        
        <div className="scoring-tool-wrapper">
          <CountdownTimer />
        </div>
        
        <div className="scoring-tool-wrapper">
          <CounterTool />
        </div>
        
        <div className="scoring-tool-wrapper">
          <ManualScoreInput />
        </div>
      </div>
      
      <div className="scoring-actions">
        <Button>Reset All</Button>
        <Button primary>Save & Continue</Button>
      </div>
    </div>
  );
};

export default ScoringScreen;
