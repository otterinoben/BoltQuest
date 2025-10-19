/**
 * Sound Effects System
 * Manages audio playback for XP progression and level-up events
 */

export class SoundEffects {
  private static whooshSound: HTMLAudioElement | null = null;
  private static dingSound: HTMLAudioElement | null = null;
  private static confettiSound: HTMLAudioElement | null = null;
  private static initialized = false;
  
  static init() {
    if (this.initialized) return;
    
    try {
      // Create audio elements using Web Audio API with data URIs
      // Whoosh sound - synthesized wind/whoosh effect
      this.whooshSound = this.createWhooshSound();
      
      // Ding sound - synthesized bell/ding effect
      this.dingSound = this.createDingSound();
      
      // Celebration sound - synthesized fanfare effect
      this.confettiSound = this.createCelebrationSound();
      
      this.initialized = true;
    } catch (error) {
      console.warn('Sound effects initialization failed:', error);
    }
  }
  
  private static createWhooshSound(): HTMLAudioElement {
    // Create a simple whoosh sound using synthesized audio
    const audio = new Audio();
    audio.volume = 0.2;
    
    // Use a simple oscillator-based whoosh
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    return audio;
  }
  
  private static createDingSound(): HTMLAudioElement {
    const audio = new Audio();
    audio.volume = 0.3;
    return audio;
  }
  
  private static createCelebrationSound(): HTMLAudioElement {
    const audio = new Audio();
    audio.volume = 0.25;
    return audio;
  }
  
  static playWhoosh() {
    if (!this.initialized) this.init();
    
    try {
      // Use Web Audio API for whoosh sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      // Silently fail if audio context not available
    }
  }
  
  static playDing() {
    if (!this.initialized) this.init();
    
    try {
      // Use Web Audio API for ding sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail if audio context not available
    }
  }
  
  static playCelebration() {
    if (!this.initialized) this.init();
    
    try {
      // Use Web Audio API for celebration sound - multi-tone fanfare
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create three oscillators for a chord
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G chord
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        const startTime = audioContext.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.8);
      });
    } catch (error) {
      // Silently fail if audio context not available
    }
  }
}

