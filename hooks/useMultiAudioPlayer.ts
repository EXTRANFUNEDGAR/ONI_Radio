import { useRef, useState } from 'react';
import { Audio } from 'expo-av';

export function useMultiAudioPlayer() {
  const players = useRef<Record<string, Audio.Sound>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  async function toggle(id: string, source: number) {
    // Si hay algo sonando, lo pausamos
    if (playingId && playingId !== id) {
      await players.current[playingId]?.pauseAsync();
    }

    // Si ya tenemos ese audio cargado
    if (players.current[id]) {
      const status = await players.current[id].getStatusAsync();
      if (status.isPlaying) {
        await players.current[id].pauseAsync();
        setPlayingId(null);
      } else {
        await players.current[id].playAsync();
        setPlayingId(id);
      }
    } else {
      const { sound } = await Audio.Sound.createAsync(source);
      players.current[id] = sound;
      await sound.playAsync();
      setPlayingId(id);
    }
  }

  return { toggle, playingId };
}
