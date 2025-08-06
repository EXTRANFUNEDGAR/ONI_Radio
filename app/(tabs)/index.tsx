// playlists.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RadioScreen() {
  const [currentSong, setCurrentSong] = useState<MediaLibrary.Asset | null>(null);
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadSongs = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      const all = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 1000 });
      if (all.assets.length > 0) {
        setSongs(all.assets);
      }
    };

    loadSongs();
    return () => {
      stopRadio();
    };
  }, []);

  const startRadio = async () => {
    if (songs.length === 0) return;
    setIsPlaying(true);
    playRandomSong();
  };

  const playRandomSong = async () => {
    const next = songs[Math.floor(Math.random() * songs.length)];
    setCurrentSong(next);

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: next.uri },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

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

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && isPlaying) {
      playRandomSong();
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
        <ActivityIndicator color="#90ee90" size="large" />
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
  note: {
    color: '#777',
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
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
