import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export function useAudioPlayer(source: number) {
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function loadSound() {
    if (sound.current) {
      await sound.current.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(source);
    sound.current = newSound;
  }

  async function playPause() {
    if (!sound.current) return;

    const status = await sound.current.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.current.playAsync();
        setIsPlaying(true);
      }
    }
  }

  useEffect(() => {
    loadSound();

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [source]);

  return { isPlaying, playPause };
}
