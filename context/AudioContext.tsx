// AudioContext con soporte de Playlist y navegación entre canciones
import React, { createContext, useContext, useState } from 'react';
import { Audio } from 'expo-av';

interface Song {
  title: string;
  uri: string;
}

interface AudioContextProps {
  currentSong: Song | null;
  isPlaying: boolean;
  play: (song: Song, playlist?: Song[]) => void;
  pause: () => void;
  queue: Song[];
  playNext: () => void;
  playPrevious: () => void;
  setPlaylist: (list: Song[]) => void;
  setCurrentSong: (s: Song) => void;
  setIsPlaying: (p: boolean) => void;
  sound: Audio.Sound | null;
}

const AudioContext = createContext<AudioContextProps>({} as AudioContextProps);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [history, setHistory] = useState<Song[]>([]);

  const unload = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const play = async (song: Song, fullPlaylist?: Song[]) => {
    if (currentSong?.uri === song.uri && isPlaying) return;
    await unload();

    const { sound: newSound } = await Audio.Sound.createAsync({ uri: song.uri });
    setSound(newSound);
    await newSound.playAsync();

    setCurrentSong(song);
    setIsPlaying(true);

    if (fullPlaylist) {
      setPlaylistState(fullPlaylist);
    }

    setHistory((prev) => (currentSong ? [...prev, currentSong] : prev));
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const setPlaylist = (list: Song[]) => {
    setPlaylistState(list);
  };

  const playNext = () => {
    if (!currentSong || playlist.length === 0) return;
    const index = playlist.findIndex(s => s.uri === currentSong.uri);
    if (index >= 0 && index < playlist.length - 1) {
      const next = playlist[index + 1];
      play(next);
    }
  };

  const playPrevious = () => {
    if (!currentSong || playlist.length === 0) return;
    const index = playlist.findIndex(s => s.uri === currentSong.uri);
    if (index > 0) {
      const prev = playlist[index - 1];
      play(prev);
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
