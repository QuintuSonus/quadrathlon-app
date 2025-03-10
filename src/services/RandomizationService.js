/**
 * Service for handling all randomization logic
 */
class RandomizationService {
  /**
   * Select a random player from a list, optionally excluding certain players
   * @param {Array} players - List of player names
   * @param {Array} excluded - List of player names to exclude (optional)
   * @returns {string} Randomly selected player name
   */
  selectRandomPlayer(players, excluded = []) {
    // Filter out excluded players
    const availablePlayers = players.filter(player => !excluded.includes(player));
    
    // If no players are available, return null
    if (availablePlayers.length === 0) return null;
    
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    
    // Return the randomly selected player
    return availablePlayers[randomIndex];
  }
  
  /**
   * Create random 2v2 teams from a list of 4 players
   * @param {Array} players - List of 4 player names
   * @returns {Array} Array of two teams, each containing 2 player names
   */
  createRandomTeams(players) {
    if (players.length !== 4) {
      throw new Error('Random teams can only be created with exactly 4 players');
    }
    
    // Create a copy of the players array to avoid modifying the original
    const shuffledPlayers = [...players];
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    
    // Split the shuffled array into two teams
    return [
      [shuffledPlayers[0], shuffledPlayers[1]],
      [shuffledPlayers[2], shuffledPlayers[3]]
    ];
  }
  
  /**
   * Generate a tournament bracket for 4 players
   * @param {Array} players - List of 4 player names
   * @returns {Object} Tournament bracket structure
   */
  generateTournamentBracket(players) {
    if (players.length !== 4) {
      throw new Error('Tournament bracket can only be created with exactly 4 players');
    }
    
    // Create a copy of the players array to avoid modifying the original
    const shuffledPlayers = [...players];
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    
    // Create the tournament bracket structure
    return {
      semifinals: [
        {
          id: 'semi1',
          players: [shuffledPlayers[0], shuffledPlayers[1]],
          winner: null
        },
        {
          id: 'semi2',
          players: [shuffledPlayers[2], shuffledPlayers[3]],
          winner: null
        }
      ],
      smallFinal: {
        id: 'small',
        players: [], // Will be populated after semifinals
        winner: null
      },
      final: {
        id: 'final',
        players: [], // Will be populated after semifinals
        winner: null
      },
      rankings: [] // Final order of all 4 players
    };
  }
  
  /**
   * Update a tournament bracket after a match is completed
   * @param {Object} bracket - The current tournament bracket
   * @param {string} matchId - ID of the completed match
   * @param {string} winner - Name of the match winner
   * @returns {Object} Updated tournament bracket
   */
  updateTournamentBracket(bracket, matchId, winner) {
    // Create a deep copy of the bracket to avoid modifying the original
    const updatedBracket = JSON.parse(JSON.stringify(bracket));
    
    // Find the match that was completed
    if (matchId.startsWith('semi')) {
      // Get semifinal index (0 or 1)
      const semiIndex = matchId === 'semi1' ? 0 : 1;
      
      // Update the winner of the semifinal match
      updatedBracket.semifinals[semiIndex].winner = winner;
      
      // Get the loser of the semifinal match
      const loser = updatedBracket.semifinals[semiIndex].players.find(p => p !== winner);
      
      // Check if both semifinals have winners
      if (updatedBracket.semifinals[0].winner && updatedBracket.semifinals[1].winner) {
        // Populate the final match with the winners
        updatedBracket.final.players = [
          updatedBracket.semifinals[0].winner,
          updatedBracket.semifinals[1].winner
        ];
        
        // Populate the small final match with the losers
        updatedBracket.smallFinal.players = [
          updatedBracket.semifinals[0].players.find(p => p !== updatedBracket.semifinals[0].winner),
          updatedBracket.semifinals[1].players.find(p => p !== updatedBracket.semifinals[1].winner)
        ];
      }
    } else if (matchId === 'small') {
      // Update the winner of the small final match
      updatedBracket.smallFinal.winner = winner;
      
      // If both final and small final have winners, populate the final rankings
      if (updatedBracket.final.winner && updatedBracket.smallFinal.winner) {
        updatedBracket.rankings = [
          updatedBracket.final.winner,
          updatedBracket.final.players.find(p => p !== updatedBracket.final.winner),
          updatedBracket.smallFinal.winner,
          updatedBracket.smallFinal.players.find(p => p !== updatedBracket.smallFinal.winner)
        ];
      }
    } else if (matchId === 'final') {
      // Update the winner of the final match
      updatedBracket.final.winner = winner;
      
      // If both final and small final have winners, populate the final rankings
      if (updatedBracket.final.winner && updatedBracket.smallFinal.winner) {
        updatedBracket.rankings = [
          updatedBracket.final.winner,
          updatedBracket.final.players.find(p => p !== updatedBracket.final.winner),
          updatedBracket.smallFinal.winner,
          updatedBracket.smallFinal.players.find(p => p !== updatedBracket.smallFinal.winner)
        ];
      }
    }
    
    return updatedBracket;
  }
}

// Create a singleton instance
const randomizationService = new RandomizationService();

export default randomizationService;
