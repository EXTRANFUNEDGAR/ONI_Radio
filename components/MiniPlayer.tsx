// MiniPlayer optimizado usando AudioContext global sin crear Audio.Sound nuevo
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, ProgressBar } from 'react-native-paper';
import { useAudio } from '../context/AudioContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    pause,
    play,
    queue,
    playNext,
    playPrevious,
    setCurrentSong,
    setIsPlaying,
    sound,
  } = useAudio();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    const restore = async () => {
      const saved = await AsyncStorage.getItem('lastSong');
      const playing = await AsyncStorage.getItem('wasPlaying');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentSong(parsed);
        if (playing === 'true') play(parsed);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    if (!sound) return;

    const interval = setInterval(async () => {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setProgress(status.positionMillis / status.durationMillis);
        setDuration(status.durationMillis);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [sound]);

  if (!currentSong) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
      <ProgressBar progress={progress} color="white" style={styles.bar} />
      <View style={styles.controls}>
        <IconButton
          icon="skip-previous"
          iconColor="white"
          size={24}
          onPress={playPrevious}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          iconColor="white"
          size={24}
          onPress={async () => {
            if (isPlaying) {
              pause();
              await AsyncStorage.setItem('wasPlaying', 'false');
            } else {
              play(currentSong);
              await AsyncStorage.setItem('wasPlaying', 'true');
            }
          }}
        />
        <IconButton
          icon="skip-next"
          iconColor="white"
          size={24}
          onPress={playNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    width: '100%',
    position: 'absolute',
    bottom: 90,
    zIndex: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  title: {
    color: 'white',
    marginBottom: 4,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
