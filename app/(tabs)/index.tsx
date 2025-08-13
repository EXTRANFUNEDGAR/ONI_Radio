import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAudio } from '../../context/AudioContext';

export default function RadioScreen() {
  const [currentSong, setCurrentSong] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { pause } = useAudio(); // detener música normal

  useEffect(() => {
    const loadSongs = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      const all = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 1000 });
      if (all.assets.length > 0) setSongs(all.assets);
    };

    loadSongs();
    return () => {
      stopRadio();
    };
  }, []);

  const startRadio = async () => {
    if (songs.length === 0) return;

    await pause(); // detiene música normal
    setIsPlaying(true);
    await playRandomSong();
  };

const playRandomSong = async () => {
  if (songs.length === 0) return;

  const next = songs[Math.floor(Math.random() * songs.length)];
  setCurrentSong(next);

  // Detener y descargar sonido anterior
  if (soundRef.current) {
    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();
    soundRef.current = null;
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri: next.uri },
    { shouldPlay: true }
  );

  sound.setOnPlaybackStatusUpdate(async (status) => {
    if (status.didJustFinish) {
      // Asegúrate que el estado isPlaying esté actualizado
      const playing = await sound.getStatusAsync();
      if (playing.isLoaded) {
        playRandomSong();
      }
    }
  });

  soundRef.current = sound;
};



  const stopRadio = async () => {
    setIsPlaying(false);
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentSong(null);
  };

  const toggleRadio = () => {
    if (isPlaying) {
      stopRadio();
    } else {
      startRadio();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📻 RADIO TÁCTICA</Text>
      <Text style={styles.subtitle}>90.3 FM — ONI Radio Táctica</Text>

      {currentSong ? (
        <View style={styles.infoBox}>
          <Text style={styles.label}>Reproduciendo:</Text>
          <Text style={styles.song}>{currentSong.filename}</Text>
        </View>
      ) : (
        isPlaying && <ActivityIndicator color="#90ee90" size="large" />
      )}

      <View style={styles.buttons}>
        <TouchableOpacity onPress={toggleRadio} style={styles.button}>
          <Ionicons name={isPlaying ? 'power' : 'play'} size={24} color={isPlaying ? '#f55' : '#90ee90'} />
          <Text style={styles.buttonText}>{isPlaying ? 'Apagar' : 'Encender'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#90ee90',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 24,
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: '#1c2e2e',
    padding: 20,
    borderRadius: 10,
    borderColor: '#355',
    borderWidth: 1,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  song: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttons: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 30,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1e2f2f',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#355',
  },
  buttonText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
  },
});
