import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '../../../context/AudioContext';
import { Ionicons } from '@expo/vector-icons';

export default function PlaylistDetail() {
  const params = useLocalSearchParams();
  const name = decodeURIComponent(params.name as string);
  const navigation = useNavigation();

  const [songs, setSongs] = useState<{ title: string; uri: string }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { play } = useAudio();

  const loadSongs = async () => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : {};
    setSongs(all[name] || []);
  };

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem('favorites');
    const parsed = data ? JSON.parse(data) : [];
    setFavorites(parsed.map((s: any) => s.uri));
  };

  useEffect(() => {
    loadSongs();
    loadFavorites();
    navigation.setOptions({ title: name });
  }, [name]);

  useFocusEffect(
    React.useCallback(() => {
      loadSongs();
      loadFavorites();
    }, [])
  );

  const removeSong = (uri: string) => {
    Alert.alert('Eliminar', '¿Quitar esta canción?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          const data = await AsyncStorage.getItem('playlists');
          const all = data ? JSON.parse(data) : {};
          const updated = all[name]?.filter((s: any) => s.uri !== uri) || [];
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
    if (exists) {
      const updated = parsed.filter((s: any) => s.uri !== song.uri);
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
      setFavorites(favorites.filter((uri) => uri !== song.uri));
      alert('Quitada de favoritos');
    } else {
      const updated = [...parsed, song];
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
      setFavorites([...favorites, song.uri]);
      alert('Agregada a favoritos');
    }
  };

  const playSong = (song: { title: string; uri: string }) => {
    play(song, songs);
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
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleFavorite(item)}>
                  <Ionicons
                    name={isFav ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFav ? 'tomato' : 'white'}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeSong(item.uri)}>
                  <Ionicons name="trash-outline" size={24} color="white" />
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
    backgroundColor: '#121212',
    padding: 16,
    paddingTop: 40,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  song: {
    color: 'white',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
});
