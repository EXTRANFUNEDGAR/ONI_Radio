import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAudio } from '../../../context/AudioContext';

export default function PlaylistDetail() {
  const params = useLocalSearchParams();
  const name = decodeURIComponent(params.name as string);
  const navigation = useNavigation();

  const [songs, setSongs] = useState<{ title: string; uri: string; duration?: number }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { play } = useAudio();

  const loadSongs = async () => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : {};
    const listSongs = all[name];

    if (Array.isArray(listSongs)) {
      setSongs(listSongs);
    } else {
      setSongs([]);
    }
  };

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem('favorites');
    const parsed = data ? JSON.parse(data) : [];
    setFavorites(parsed.map((s: any) => s.uri));
  };

  useEffect(() => {
    navigation.setOptions({ title: name });
    loadSongs();
    loadFavorites();
  }, [name]);

  useFocusEffect(
    React.useCallback(() => {
      loadSongs();
      loadFavorites();
    }, [name])
  );

  const removeSong = (uri: string) => {
    Alert.alert('Confirmación', '¿Eliminar esta canción de la lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const data = await AsyncStorage.getItem('playlists');
          const all = data ? JSON.parse(data) : {};
          const updated = (all[name] || []).filter((s: any) => s.uri !== uri);
          all[name] = updated;
          await AsyncStorage.setItem('playlists', JSON.stringify(all));
          setSongs(updated);
        },
      },
    ]);
  };

  const toggleFavorite = async (song: { title: string; uri: string }) => {
    const data = await AsyncStorage.getItem('favorites');
    const parsed = data ? JSON.parse(data) : [];

    const exists = parsed.some((s: any) => s.uri === song.uri);
    let updated;

    if (exists) {
      updated = parsed.filter((s: any) => s.uri !== song.uri);
      setFavorites(favorites.filter((uri) => uri !== song.uri));
    } else {
      updated = [...parsed, song];
      setFavorites([...favorites, song.uri]);
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  const playSong = (song: { title: string; uri: string }) => {
    play(song, songs);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => {
          const isFav = favorites.includes(item.uri);
          return (
            <View style={styles.card}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => playSong(item)}>
                <Text style={styles.song}>{item.title}</Text>
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleFavorite(item)}>
                  <Ionicons
                    name={isFav ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFav ? '#8fff8f' : 'white'}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeSong(item.uri)}>
                  <Ionicons name="trash-outline" size={24} color="#8fff8f" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 16,
    paddingTop: 40,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2f2f2f',
  },
  song: {
    color: '#8fff8f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  duration: {
    color: '#6f6',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
});
