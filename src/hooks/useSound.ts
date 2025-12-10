import { useCallback, useRef } from 'react';

interface UseSoundOptions {
  volume?: number;      // 0 to 1
  playbackRate?: number; // Speed of playback (1 = normal)
}

/**
 * A reusable hook for playing sound effects
 * 
 * @param src - Path to the sound file
 * @param options - Optional settings for volume and playback rate
 * @returns play function to trigger the sound
 * 
 * @example
 * const playClick = useSound('/sounds/click.mp3', { volume: 0.5 });
 * <button onClick={playClick}>Click me</button>
 */
export function useSound(src: string, options: UseSoundOptions = {}) {
  const { volume = 0.5, playbackRate = 1 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    // Create new audio instance for overlapping sounds
    const audio = new Audio(src);
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    
    // Play and clean up after
    audio.play().catch((error) => {
      // Silently handle autoplay restrictions
      console.warn('Sound play failed:', error.message);
    });

    // Store reference for potential cleanup
    audioRef.current = audio;
  }, [src, volume, playbackRate]);

  return play;
}

export default useSound;
