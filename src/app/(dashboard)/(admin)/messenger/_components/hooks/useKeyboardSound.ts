import { useCallback, useRef } from 'react';

function useKeyboardSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Create synthetic keyboard sounds using Web Audio API
  const createBeepSound = useCallback((frequency: number, duration: number = 0.1) => {
    try {
      if (typeof window === 'undefined') return false;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as globalThis.Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      return true;
    } catch (error) {
      console.log("Web Audio API failed:", error);
      return false;
    }
  }, []);

  // Fallback to HTML Audio with data URLs
  const playFallbackSound = useCallback(() => {
    try {
      if (typeof window === 'undefined') return false;

      // Create a simple beep sound using data URL
      const audioContext = new (window.AudioContext || (window as globalThis.Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log("Fallback sound failed:", error);
    }
  }, []);

  const playRandomKeyStrokeSound = useCallback(() => {
    try {
      // Different frequencies for variety
      const frequencies = [800, 900, 1000, 1100];
      const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
      
      // Try Web Audio API first
      const success = createBeepSound(randomFreq, 0.08);
      
      // If Web Audio fails, try fallback
      if (!success) {
        playFallbackSound();
      }
    } catch (error) {
      console.log("All sound methods failed:", error);
    }
  }, [createBeepSound, playFallbackSound]);

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;
