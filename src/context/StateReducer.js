// Define action types as constants for better code maintenance
export const ACTION_TYPES = {
  // Session actions
  CREATE_SESSION: 'CREATE_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  COMPLETE_SESSION: 'COMPLETE_SESSION',
  EXTEND_SESSION: 'EXTEND_SESSION',
  
  // Game actions
  CREATE_GAME: 'CREATE_GAME',
  UPDATE_GAME: 'UPDATE_GAME',
  DELETE_GAME: 'DELETE_GAME',
  NEXT_GAME: 'NEXT_GAME',
  
  // Player actions
  UPDATE_PLAYER_SCORE: 'UPDATE_PLAYER_SCORE',
  
  // UI actions
  CHANGE_SCREEN: 'CHANGE_SCREEN',
  SET_ACTIVE_SCORE_TOOLS: 'SET_ACTIVE_SCORE_TOOLS',
  UPDATE_ANIMATION_SETTINGS: 'UPDATE_ANIMATION_SETTINGS',
  UPDATE_SOUND_SETTINGS: 'UPDATE_SOUND_SETTINGS'
};

// The reducer function
const stateReducer = (state, action) => {
  switch (action.type) {
    // Session actions
    case ACTION_TYPES.CREATE_SESSION:
      return {
        ...state,
        session: {
          ...state.session,
          plannedGames: action.payload.plannedGames,
          currentGameIndex: 0,
          isComplete: false
        },
        games: [],
        playerScores: {
          "David": 0,
          "Manu": 0,
          "Antoine": 0,
          "Quentin": 0
        },
        ui: {
          ...state.ui,
          currentScreen: 'game'
        }
      };
      
    case ACTION_TYPES.UPDATE_SESSION:
      return {
        ...state,
        session: {
          ...state.session,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.COMPLETE_SESSION:
      return {
        ...state,
        session: {
          ...state.session,
          isComplete: true
        },
        ui: {
          ...state.ui,
          currentScreen: 'results'
        }
      };
      
    case ACTION_TYPES.EXTEND_SESSION:
      return {
        ...state,
        session: {
          ...state.session,
          plannedGames: state.session.plannedGames + action.payload.additionalGames,
          isComplete: false
        },
        ui: {
          ...state.ui,
          currentScreen: 'game'
        }
      };
    
    // Game actions
    case ACTION_TYPES.CREATE_GAME:
      const newGame = {
        id: Date.now().toString(),
        name: action.payload.name,
        type: action.payload.type,
        playerOrder: action.payload.playerOrder || [],
        teams: action.payload.teams || [],
        bracket: action.payload.bracket || null,
        scoringMethods: [],
        scores: {},
        rankings: [],
        points: {}
      };
      
      return {
        ...state,
        games: [...state.games, newGame]
      };
      
    case ACTION_TYPES.UPDATE_GAME:
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.id 
            ? { ...game, ...action.payload.updates } 
            : game
        )
      };
      
    case ACTION_TYPES.DELETE_GAME:
      return {
        ...state,
        games: state.games.filter(game => game.id !== action.payload.id)
      };
      
    case ACTION_TYPES.NEXT_GAME:
      const nextGameIndex = state.session.currentGameIndex + 1;
      const isLastGame = nextGameIndex >= state.session.plannedGames;
      
      return {
        ...state,
        session: {
          ...state.session,
          currentGameIndex: nextGameIndex,
          isComplete: isLastGame
        },
        ui: {
          ...state.ui,
          currentScreen: isLastGame ? 'results' : 'game',
          activeScoreTools: []
        }
      };
    
    // Player actions
    case ACTION_TYPES.UPDATE_PLAYER_SCORE:
      // Calculate new scores based on the game results
      const newPlayerScores = { ...state.playerScores };
      
      // Update scores for each player
      Object.entries(action.payload.points).forEach(([player, points]) => {
        newPlayerScores[player] = (newPlayerScores[player] || 0) + points;
      });
      
      return {
        ...state,
        playerScores: newPlayerScores
      };
    
    // UI actions
    case ACTION_TYPES.CHANGE_SCREEN:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentScreen: action.payload.screen
        }
      };
      
    case ACTION_TYPES.SET_ACTIVE_SCORE_TOOLS:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeScoreTools: action.payload.tools
        }
      };
      
    case ACTION_TYPES.UPDATE_ANIMATION_SETTINGS:
      return {
        ...state,
        ui: {
          ...state.ui,
          animationSettings: {
            ...state.ui.animationSettings,
            ...action.payload
          }
        }
      };
      
    case ACTION_TYPES.UPDATE_SOUND_SETTINGS:
      return {
        ...state,
        ui: {
          ...state.ui,
          soundSettings: {
            ...state.ui.soundSettings,
            ...action.payload
          }
        }
      };
    
    default:
      return state;
  }
};

export default stateReducer;
