import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, ProgressBar, Text } from 'react-native-paper';
import { useAudio } from '../context/AudioContext';

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    pause,
    play,
    playNext,
    playPrevious,
    sound,
  } = useAudio();

  const [progress, setProgress] = useState(0);

  // Reset al cambiar canción
  useEffect(() => {
    setProgress(0);
  }, [currentSong?.uri]);

  // Escuchar cambios en la reproducción
  useEffect(() => {
    if (!sound) return;

    const onStatus = (status: any) => {
      if (!status.isLoaded) return;

      const { positionMillis, durationMillis, didJustFinish } = status;
      if (durationMillis && durationMillis > 0) {
        setProgress(positionMillis / durationMillis);
      }
      if (didJustFinish) {
        playNext?.();
      }
    };

    // Actualizar cada 300 ms
    sound.setProgressUpdateIntervalAsync?.(300);
    sound.setOnPlaybackStatusUpdate(onStatus);

    return () => {
      sound.setOnPlaybackStatusUpdate(null);
    };
  }, [sound, playNext]);

  if (!currentSong) return null;

  return (
    <View style={styles.container} key={currentSong.uri}>
      <Text style={styles.title} numberOfLines={1}>
        {currentSong.title}
      </Text>

      {/* Barra verde militar */}
      <ProgressBar
        progress={progress}
        color="#8fff8f" // relleno verde
        style={styles.bar} // fondo oscuro
      />

      <View style={styles.controls}>
        <IconButton icon="skip-previous" iconColor="white" size={24} onPress={playPrevious} />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          iconColor="white"
          size={24}
          onPress={async () => {
            if (isPlaying) {
              pause();
              await AsyncStorage.setItem('wasPlaying', 'false');
            } else {
              await play(currentSong);
              await AsyncStorage.setItem('wasPlaying', 'true');
            }
          }}
        />
        <IconButton icon="skip-next" iconColor="white" size={24} onPress={playNext} />
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
    backgroundColor: '#1a1a1a', // fondo oscuro
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
