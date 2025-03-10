/**
 * Service for handling all sound effects and alerts
 */
class AudioService {
  constructor() {
    this.sounds = {};
    this.volume = 0.7;
    this.isMuted = false;
    this.isLoaded = false;
  }
  
  /**
   * Preload all sound effects
   * @returns {Promise} Resolves when all sounds are loaded
   */
  async preloadSounds() {
    if (this.isLoaded) return Promise.resolve();
    
    const soundFiles = {
      countdown: '/sounds/countdown.mp3',
      countdownLow: '/sounds/countdown.mp3', // Use same file for simplicity in MVP
      countdownEnd: '/sounds/complete.mp3',
      selection: '/sounds/selection.mp3',
      ranking1: '/sounds/winner.mp3',
      ranking2: '/sounds/winner.mp3', // Use same file for simplicity in MVP
      ranking3: '/sounds/winner.mp3', // Use same file for simplicity in MVP
      ranking4: '/sounds/winner.mp3'  // Use same file for simplicity in MVP
    };
    
    const loadPromises = Object.entries(soundFiles).map(([name, path]) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio(path);
        audio.volume = this.volume;
        
        audio.addEventListener('canplaythrough', () => {
          this.sounds[name] = audio;
          resolve();
        }, { once: true });
        
        audio.addEventListener('error', (error) => {
          console.error(`Failed to load sound: ${name}`, error);
          reject(error);
        });
        
        // Start loading
        audio.load();
      });
    });
    
    try {
      await Promise.all(loadPromises);
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to preload sounds:', error);
      return false;
    }
  }
  
  /**
   * Play a countdown sound sequence
   * @param {number} seconds - Number of seconds for the countdown
   */
  playCountdownSound(seconds) {
    if (this.isMuted || !this.isLoaded) return;
    
    // Play different sounds based on the countdown value
    if (seconds === 30) {
      this._playSound('countdown');
    } else if (seconds === 10) {
      this._playSound('countdown');
    } else if (seconds <= 5 && seconds > 0) {
      this._playSound('countdownLow');
    } else if (seconds === 0) {
      this._playSound('countdownEnd');
    }
  }
  
  /**
   * Play a sound for player/team selection
   */
  playSelectionSound() {
    if (this.isMuted || !this.isLoaded) return;
    this._playSound('selection');
  }
  
  /**
   * Play a sound for a specific ranking
   * @param {number} position - Ranking position (1-4)
   */
  playRankingSound(position) {
    if (this.isMuted || !this.isLoaded) return;
    
    const soundName = `ranking${position}`;
    if (this.sounds[soundName]) {
      this._playSound(soundName);
    }
  }
  
  /**
   * Set the volume level
   * @param {number} level - Volume level (0-1)
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    
    // Update volume for all loaded sounds
    Object.values(this.sounds).forEach(audio => {
      audio.volume = this.volume;
    });
  }
  
  /**
   * Mute or unmute all sounds
   * @param {boolean} isMuted - Whether sounds should be muted
   */
  mute(isMuted) {
    this.isMuted = isMuted;
  }
  
  /**
   * Play a sound by name
   * @private
   * @param {string} name - Name of the sound to play
   */
  _playSound(name) {
    const sound = this.sounds[name];
    if (!sound) return;
    
    // Check if the sound is already playing
    if (!sound.paused) {
      // Create a new Audio instance for overlapping sounds
      const newSound = sound.cloneNode();
      newSound.volume = this.volume;
      newSound.play().catch(error => {
        console.error(`Failed to play sound: ${name}`, error);
      });
    } else {
      // Reset and play the sound
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error(`Failed to play sound: ${name}`, error);
      });
    }
  }
}

// Create a singleton instance
const audioService = new AudioService();

export default audioService;
