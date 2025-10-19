import React, { createContext, useContext, useEffect, useState } from 'react';

interface AudioContextType {
  soundEnabled: boolean;
  musicEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  playSound: (soundName: string) => void;
  playMusic: (musicName: string) => void;
  stopMusic: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('boltquest-sound-enabled');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [musicEnabled, setMusicEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('boltquest-music-enabled');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('boltquest-sound-enabled', JSON.stringify(soundEnabled));
    } catch (error) {
      console.error('Failed to save sound preference:', error);
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('boltquest-music-enabled', JSON.stringify(musicEnabled));
    } catch (error) {
      console.error('Failed to save music preference:', error);
    }
  }, [musicEnabled]);

  const playSound = (soundName: string) => {
    if (!soundEnabled) return;
    
    // For now, we'll use Web Audio API to create simple beep sounds
    // In a real app, you'd load actual sound files
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sounds
      const frequencies: Record<string, number> = {
        correct: 800,
        incorrect: 200,
        skip: 400,
        pause: 600,
        achievement: 1000,
        notification: 500
      };
      
      oscillator.frequency.setValueAtTime(frequencies[soundName] || 440, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const playMusic = (musicName: string) => {
    if (!musicEnabled) return;
    
    // Placeholder for music functionality
    console.log(`Playing music: ${musicName}`);
  };

  const stopMusic = () => {
    // Placeholder for stopping music
    console.log('Stopping music');
  };

  const value = {
    soundEnabled,
    musicEnabled,
    setSoundEnabled,
    setMusicEnabled,
    playSound,
    playMusic,
    stopMusic,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}


