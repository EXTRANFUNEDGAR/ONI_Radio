import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library'; // 👈 para cargar canciones
import React, { createContext, useContext, useEffect, useState } from 'react';

const AudioContext = createContext<any>(null);

export const AudioProvider = ({ children }: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playsInSilentModeIOS: true,
      });

      // Cargar canciones si aún no hay queue
      if (queue.length === 0) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const all = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 1000 });
          setQueue(all.assets);
        }
      }

      const saved = await AsyncStorage.getItem('lastSong');
      const wasPlaying = await AsyncStorage.getItem('wasPlaying');

      if (saved) {
        const song = JSON.parse(saved);
        setCurrentSong(song);

        if (wasPlaying === 'true') {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: song.uri },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
          setIsPlaying(true);
        }
      }
    };

    setupAudio();
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      playNext();
    }
  };

const play = async (song: any, list: any[] = []) => {
  try {
    // Unload sonido anterior si existe
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    setSound(newSound);
    setCurrentSong(song);
    setIsPlaying(true);
    if (list.length > 0) setQueue(list);

    await AsyncStorage.setItem('lastSong', JSON.stringify(song));
    await AsyncStorage.setItem('wasPlaying', 'true');
  } catch (error) {
    console.error('Error al reproducir:', error);
  }
};


  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      await AsyncStorage.setItem('wasPlaying', 'false');
    }
  };

  const resume = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      await AsyncStorage.setItem('wasPlaying', 'true');
    }
  };

  const playNext = () => {
    if (!queue.length || !currentSong) return;
    const index = queue.findIndex((s) => s.uri === currentSong.uri);
    if (index === -1) return;
    const next = queue[index + 1] || queue[0];
    play(next);
  };

  const playPrevious = () => {
    if (!queue.length || !currentSong) return;
    const index = queue.findIndex((s) => s.uri === currentSong.uri);
    if (index === -1) return;
    const prev = queue[index - 1] || queue[queue.length - 1];
    play(prev);
  };

  return (
    <AudioContext.Provider
      value={{
        sound,
        isPlaying,
        currentSong,
        queue,
        setQueue,
        play,
        pause,
        resume,
        playNext,
        playPrevious,
        setCurrentSong,
        setIsPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
