import React from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';

const NavigationBar = () => {
  const { state, dispatch } = useAppState();
  
  const goToHome = () => {
    dispatch({
      type: ACTION_TYPES.CHANGE_SCREEN,
      payload: {
        screen: 'setup'
      }
    });
  };
  
  return (
    <header className="navigation-bar">
      <div className="nav-logo">Quadrathlon</div>
      <div className="nav-links">
        <span style={{ cursor: 'pointer' }} onClick={goToHome}>Home</span>
      </div>
    </header>
  );
};

export default NavigationBar;
