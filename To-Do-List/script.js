/**
 * AudioPermissionEnforcer - Ensures users enable audio before using the app
 * Blocks app usage until audio is allowed
 */
class AudioPermissionEnforcer {
  constructor(options = {}) {
    this.options = {
      overlayBackgroundColor: 'rgba(0, 0, 0, 0.9)',
      primaryColor: '#ff3399',
      textColor: '#ffffff',
      ...options
    };
    
    this.audioContext = null;
    this.permissionGranted = false;
    this.overlay = null;
    this.checkInterval = null;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.createOverlay = this.createOverlay.bind(this);
    this.checkAudioPermission = this.checkAudioPermission.bind(this);
    this.removeOverlay = this.removeOverlay.bind(this);
    this.getBrowserSpecificInstructions = this.getBrowserSpecificInstructions.bind(this);
  }
  
  /**
   * Initialize the enforcer - call this when your app starts
   */
  initialize() {
    // Create an audio context
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API not supported in this browser');
    }
    
    // Check initial permission
    this.checkAudioPermission().then(hasPermission => {
      if (!hasPermission) {
        this.createOverlay();
      }
    });
  }
  
  /**
   * Check if audio playback is allowed
   * @returns {Promise<boolean>} True if audio is allowed
   */
  checkAudioPermission() {
    return new Promise(resolve => {
      // Try playing a silent sound
      if (!this.audioContext) {
        resolve(false);
        return;
      }
      
      // Create a silent oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Make it silent
      gainNode.gain.value = 0.001;
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(0);
      
      // Set a timeout for the permission check
      setTimeout(() => {
        try {
          // Check the state - if suspended, permission is needed
          if (this.audioContext.state === 'running') {
            this.permissionGranted = true;
            resolve(true);
          } else {
            resolve(false);
          }
          // Stop the oscillator
          oscillator.stop();
        } catch (e) {
          resolve(false);
        }
      }, 100);
    });
  }
  
  /**
   * Create the overlay that blocks the app
   */
  createOverlay() {
    // Don't create multiple overlays
    if (this.overlay) return;
    
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'audio-permission-overlay';
    
    // Style the overlay
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: this.options.overlayBackgroundColor,
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      color: this.options.textColor,
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    });
    
    // Get browser-specific instructions
    const browserInstructions = this.getBrowserSpecificInstructions();
    
    // Content for the overlay
    this.overlay.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">⚠️ Sound Playback Required</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          This application requires sound playback to function properly. 
          Your browser is currently blocking audio playback.
        </p>
        
        <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 15px;">How to Enable Sound in ${browserInstructions.browserName}:</h3>
          <ol style="text-align: left; padding-left: 20px;">
            ${browserInstructions.steps.map(step => `<li style="margin-bottom: 10px;">${step}</li>`).join('')}
          </ol>
        </div>
        
        <div style="margin: 30px 0;">
          <button id="test-audio-btn" style="
            background-color: ${this.options.primaryColor};
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          ">
            Click to Test Audio & Continue
          </button>
          
          <p style="margin-top: 10px; font-size: 14px; opacity: 0.8;">
            After enabling sound, click the button above to continue to the app.
          </p>
        </div>
      </div>
    `;
    
    // Add to the document
    document.body.appendChild(this.overlay);
    
    // Add event listener to the test button
    const testButton = document.getElementById('test-audio-btn');
    testButton.addEventListener('click', () => {
      this.testAudioAndProceed();
    });
    
    // Start continuous permission checking
    this.startPermissionCheck();
  }
  
  /**
   * Test audio and proceed if permission is granted
   */
  testAudioAndProceed() {
    // Resume the audio context (needed for Chrome)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        // Try playing a short beep
        try {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.value = 440; // A4 note
          gainNode.gain.value = 0.1;  // quiet
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.start();
          setTimeout(() => {
            oscillator.stop();
            // Check permission after playing
            this.checkAudioPermission().then(hasPermission => {
              if (hasPermission) {
                this.removeOverlay();
              } else {
                // Update the button to show failure
                const btn = document.getElementById('test-audio-btn');
                btn.textContent = 'Audio Still Blocked - Try Again';
                btn.style.backgroundColor = '#e74c3c';
                
                setTimeout(() => {
                  btn.textContent = 'Click to Test Audio & Continue';
                  btn.style.backgroundColor = this.options.primaryColor;
                }, 2000);
              }
            });
          }, 200);
        } catch (e) {
          console.error('Failed to play test sound:', e);
        }
      });
    }
  }
  
  /**
   * Start checking for permission periodically
   */
  startPermissionCheck() {
    // Check every 2 seconds
    this.checkInterval = setInterval(() => {
      this.checkAudioPermission().then(hasPermission => {
        if (hasPermission) {
          this.removeOverlay();
        }
      });
    }, 2000);
  }
  
  /**
   * Remove the overlay when permission is granted
   */
  removeOverlay() {
    if (this.overlay && this.overlay.parentNode) {
      // Fade out animation
      this.overlay.style.transition = 'opacity 0.5s ease';
      this.overlay.style.opacity = '0';
      
      setTimeout(() => {
        this.overlay.parentNode.removeChild(this.overlay);
        this.overlay = null;
      }, 500);
    }
    
    // Stop checking
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Notify that we have permission now
    const event = new CustomEvent('audioPermissionGranted');
    document.dispatchEvent(event);
  }
  
  /**
   * Get browser-specific instructions
   */
  getBrowserSpecificInstructions() {
    const ua = navigator.userAgent;
    let browserName = 'your browser';
    let steps = [];
    
    // Detect browser
    if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edge') === -1 && ua.indexOf('Edg') === -1) {
      browserName = 'Chrome';
      steps = [
        'Click the lock/info icon in the address bar',
        'Find "Sound" or "Site Settings"',
        'Change the setting from "Block" to "Allow"',
        'Refresh the page'
      ];
    } else if (ua.indexOf('Firefox') !== -1) {
      browserName = 'Firefox';
      steps = [
        'Click the lock/info icon in the address bar',
        'Click on "Connection Secure" or "Permissions"',
        'Find "Autoplay sound" and change it to "Allow"',
        'Refresh the page'
      ];
    } else if (ua.indexOf('Safari') !== -1) {
      browserName = 'Safari';
      steps = [
        'Click Safari in the top menu',
        'Select Preferences or Settings',
        'Go to Websites tab, then Auto-Play',
        'Find this website and select "Allow All Auto-Play"',
        'Refresh the page'
      ];
    } else if (ua.indexOf('Edge') !== -1 || ua.indexOf('Edg') !== -1) {
      browserName = 'Edge';
      steps = [
        'Click the lock/info icon in the address bar',
        'Click "Site permissions"',
        'Find "Media autoplay settings" and change to "Allow"',
        'Refresh the page'
      ];
    } else {
      // Generic instructions
      steps = [
        'Click the lock/info icon near the address bar',
        'Look for sound, media, or permissions settings',
        'Change any sound blocking settings to "Allow"',
        'Refresh the page'
      ];
    }
    
    return { browserName, steps };
  }
}

// Usage:
const audioEnforcer = new AudioPermissionEnforcer({
  primaryColor: '#ff3399' // Match your app's color scheme
});

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  audioEnforcer.initialize();
});

// Listen for when permission is granted
document.addEventListener('audioPermissionGranted', () => {
  console.log('Audio permission granted! App can now use sound.');
  // Re-initialize your app's audio features here
  initializeAppAudio();
});

// Function to initialize your app's audio features
function initializeAppAudio() {
  // Your existing audio initialization code here
  
  // For example, in your To-Do app:
  setupAudioElements();
  initializeSounds();
  
  // Display a success message
  showNotification('Sound enabled successfully!', 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the audio manager first
    AudioManager.initialize();
    
    // Test sound permission at startup
    testSoundPermission()
        .then(hasPermission => {
            if (!hasPermission) {
                // Show the permission overlay
                createPlayButton();
            }
        })
        .catch(error => {
            console.error('Error testing sound permission:', error);
            // Show the permission overlay on error too
            createPlayButton();
        });
    
    // Listen for the sound enabled event
    document.addEventListener('soundEnabled', () => {
        // Reinitialize sounds or perform other actions
        initializeSounds();
    });
    
    // Rest of your initialization code...
});

// Create a singleton AudioContext manager
const AudioManager = {
    context: null,
    initialized: false,
    
    initialize() {
        if (this.initialized) return true;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            return true;
        } catch (e) {
            console.error('Failed to create AudioContext:', e);
            return false;
        }
    },
    
    getContext() {
        if (!this.initialized) {
            this.initialize();
        }
        return this.context;
    },
    
    resume() {
        if (this.context && this.context.state === 'suspended') {
            return this.context.resume();
        }
        return Promise.resolve();
    }
}; 

function playSystemBeep() {
    const context = AudioManager.getContext();
    if (!context) return Promise.reject(new Error('No audio context'));
    
    return AudioManager.resume().then(() => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.2;
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
        
        return Promise.resolve();
    });
}

function testSoundPermission() {
    return new Promise((resolve, reject) => {
        if (!AudioManager.initialize()) {
            reject(new Error('Cannot initialize audio system'));
            return;
        }
        
        const context = AudioManager.getContext();
        
        if (context.state === 'running') {
            resolve(true);
            return;
        }
        
        // Try to resume the context
        AudioManager.resume()
            .then(() => {
                // Try to play a silent sound
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                
                gainNode.gain.value = 0.001; // Nearly silent
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    resolve(context.state === 'running');
                }, 100);
            })
            .catch(error => {
                reject(error);
            });
    });
}