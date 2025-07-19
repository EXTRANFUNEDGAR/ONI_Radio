// app/(tabs)/explore.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';

export default function ExploreScreen() {
  const [songs, setSongs] = useState<{ title: string; uri: string; duration: number }[]>([]);
  const [query, setQuery] = useState('');
  const { play } = useAudio();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{ title: string; uri: string; duration: number } | null>(null);
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // solo uris

  useEffect(() => {
    const loadSongs = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000,
      });

      const data = assets.assets.map((asset) => ({
        title: asset.filename,
        uri: asset.uri,
        duration: asset.duration || 0,
      }));
      setSongs(data);
    };

    const loadPlaylists = async () => {
      const data = await AsyncStorage.getItem('playlists');
      const parsed = data ? JSON.parse(data) : {};
      setPlaylists(Object.keys(parsed));
    };

    const loadFavorites = async () => {
      const data = await AsyncStorage.getItem('favorites');
      const parsed = data ? JSON.parse(data) : [];
      const uris = parsed.map((s: any) => s.uri);
      setFavorites(uris);
    };

    loadSongs();
    loadPlaylists();
    loadFavorites();
  }, []);

  const handleAddToFavorites = async (song: { title: string; uri: string; duration: number }) => {
    const data = await AsyncStorage.getItem('favorites');
    const parsed = data ? JSON.parse(data) : [];

    const exists = parsed.some((s: any) => s.uri === song.uri);
    if (!exists) {
      const updated = [...parsed, song];
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
      setFavorites([...favorites, song.uri]);
      alert('Agregada a favoritos');
    } else {
      const updated = parsed.filter((s: any) => s.uri !== song.uri);
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
      setFavorites(favorites.filter((uri) => uri !== song.uri));
      alert('Quitada de favoritos');
    }
  };

  const handleAddToPlaylist = async (playlistName: string) => {
    if (!selectedSong) return;
    const data = await AsyncStorage.getItem('playlists');
    const parsed = data ? JSON.parse(data) : {};
    parsed[playlistName].push(selectedSong);
    await AsyncStorage.setItem('playlists', JSON.stringify(parsed));
    setModalVisible(false);
    alert(`Agregada a ${playlistName}`);
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const filtered = songs.filter((song) =>
    song.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar</Text>
      <TextInput
        placeholder="Buscar canción..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => {
          const isFav = favorites.includes(item.uri);
          return (
            <View style={styles.card}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => play(item, filtered)}>
                <Text style={styles.song}>{item.title}</Text>
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => handleAddToFavorites(item)}>
                  <Ionicons
                    name={isFav ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFav ? 'tomato' : 'white'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSong(item);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar a lista</Text>
            {playlists.map((name) => (
              <Pressable
                key={name}
                onPress={() => handleAddToPlaylist(name)}
                style={styles.modalButton}
              >
                <Text style={styles.modalText}>{name}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    height: 40,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: 'white',
    marginBottom: 16,
  },
  card: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  song: {
    color: 'white',
    fontSize: 16,
  },
  duration: {
    color: '#ccc',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 12,
  },
  modalButton: {
    paddingVertical: 10,
    width: '100%',
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  modalText: {
    color: 'white',
    textAlign: 'center',
  },
  modalCancel: {
    marginTop: 16,
    color: 'tomato',
  },
});
