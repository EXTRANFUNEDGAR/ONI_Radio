// context/AudioContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Song {
  title: string;
  uri: string;
}

interface AudioContextProps {
  currentSong: Song | null;
  isPlaying: boolean;
  play: (song: Song, playlist?: Song[], options?: { isRadio?: boolean }) => void;
  pause: () => void;
  queue: Song[];
  playNext: () => void;
  playPrevious: () => void;
  setPlaylist: (list: Song[]) => void;
  setCurrentSong: (s: Song) => void;
  setIsPlaying: (p: boolean) => void;
  sound: Audio.Sound | null;
  isRadio: boolean;
}

const AudioContext = createContext<AudioContextProps>({} as AudioContextProps);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRadio, setIsRadio] = useState(false);

  // 🔊 Configurar reproducción en segundo plano
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    });

    restorePlayback();
  }, []);

  const restorePlayback = async () => {
    const saved = await AsyncStorage.getItem('lastSong');
    const playing = await AsyncStorage.getItem('wasPlaying');
    const wasRadio = await AsyncStorage.getItem('wasRadio');

    if (!saved || playing !== 'true') return;

    const parsed = JSON.parse(saved);
    setCurrentSong(parsed);

    // Solo vuelve a reproducir si no es radio (radio se gestiona aparte)
    if (wasRadio === 'true') {
      play(parsed, [], { isRadio: true });
    } else {
      play(parsed);
    }
  };

  const unload = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const play = async (song: Song, fullPlaylist: Song[] = [], options: { isRadio?: boolean } = {}) => {
    if (currentSong?.uri === song.uri && isPlaying) return;
    await unload();

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true, isLooping: options.isRadio || false }
    );

    setSound(newSound);
    setCurrentSong(song);
    setIsPlaying(true);
    setIsRadio(!!options.isRadio);

    await AsyncStorage.setItem('lastSong', JSON.stringify(song));
    await AsyncStorage.setItem('wasPlaying', 'true');
    await AsyncStorage.setItem('wasRadio', options.isRadio ? 'true' : 'false');

    if (fullPlaylist.length > 0 && !options.isRadio) {
      setPlaylistState(fullPlaylist);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      await AsyncStorage.setItem('wasPlaying', 'false');
    }
  };

  const setPlaylist = (list: Song[]) => {
    setPlaylistState(list);
  };

  const playNext = () => {
    if (!currentSong || playlist.length === 0) return;
    const index = playlist.findIndex((s) => s.uri === currentSong.uri);
    if (index >= 0 && index < playlist.length - 1) {
      play(playlist[index + 1], playlist);
    }
  };

  const playPrevious = () => {
    if (!currentSong || playlist.length === 0) return;
    const index = playlist.findIndex((s) => s.uri === currentSong.uri);
    if (index > 0) {
      play(playlist[index - 1], playlist);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        play,
        pause,
        queue,
        playNext,
        playPrevious,
        setPlaylist,
        setCurrentSong,
        setIsPlaying,
        sound,
        isRadio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
