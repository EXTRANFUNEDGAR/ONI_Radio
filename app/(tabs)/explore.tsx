import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAudio } from '../../context/AudioContext';

export default function ExploreScreen() {
  const [songs, setSongs] = useState<{ title: string; uri: string; duration: number }[]>([]);
  const [query, setQuery] = useState('');
  const { play } = useAudio();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{ title: string; uri: string; duration: number } | null>(null);
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Cargar canciones
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

    loadSongs();
  }, []);

  // Cargar favoritos
  useEffect(() => {
    const loadFavorites = async () => {
      const data = await AsyncStorage.getItem('favorites');
      const parsed = data ? JSON.parse(data) : [];
      const uris = parsed.map((s: any) => s.uri);
      setFavorites(uris);
    };

    loadFavorites();
  }, []);

  // Cargar listas solo si se abre el modal
  useEffect(() => {
    if (modalVisible) {
      const loadPlaylists = async () => {
        const data = await AsyncStorage.getItem('playlists');
        const parsed = data ? JSON.parse(data) : {};
        const names = Object.keys(parsed).filter((key) => Array.isArray(parsed[key]));
        setPlaylists(names);
      };

      loadPlaylists();
    }
  }, [modalVisible]);

  // Favoritos toggle
  const handleAddToFavorites = async (song: { title: string; uri: string; duration: number }) => {
    const data = await AsyncStorage.getItem('favorites');
    const parsed = data ? JSON.parse(data) : [];

    const exists = parsed.some((s: any) => s.uri === song.uri);
    let updated;

    if (!exists) {
      updated = [...parsed, song];
      setFavorites([...favorites, song.uri]);
    } else {
      updated = parsed.filter((s: any) => s.uri !== song.uri);
      setFavorites(favorites.filter((uri) => uri !== song.uri));
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  // Agregar canción a lista seleccionada
  const handleAddToPlaylist = async (playlistName: string) => {
    if (!selectedSong) return;

    const data = await AsyncStorage.getItem('playlists');
    const parsed = data ? JSON.parse(data) : {};

    if (!Array.isArray(parsed[playlistName])) {
      parsed[playlistName] = [];
    }

    const alreadyInList = parsed[playlistName].some((s: any) => s.uri === selectedSong.uri);
    if (!alreadyInList) {
      parsed[playlistName].push(selectedSong);
    }

    await AsyncStorage.setItem('playlists', JSON.stringify(parsed));
    setModalVisible(false);
  };

  // Formatear duración
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
      <Text style={styles.title}>EXPLORAR ARCHIVOS</Text>
      <TextInput
        placeholder="Buscar canción..."
        placeholderTextColor="#6f6"
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
                    color={isFav ? '#8fff8f' : 'white'}
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
            <Text style={styles.modalTitle}>AGREGAR A LISTA</Text>
            {playlists.length === 0 ? (
              <Text style={styles.noPlaylists}>No hay listas disponibles</Text>
            ) : (
              playlists.map((name) => (
                <Pressable
                  key={name}
                  onPress={() => handleAddToPlaylist(name)}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalText}>{name}</Text>
                </Pressable>
              ))
            )}
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
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    color: '#8fff8f',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 2,
  },
  input: {
    height: 40,
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#8fff8f',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#8fff8f',
  },
  card: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2f2f2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  song: {
    color: '#fff',
    fontSize: 16,
  },
  duration: {
    color: '#6f6',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderColor: '#444',
    borderWidth: 1,
  },
  modalTitle: {
    color: '#8fff8f',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
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
    color: '#ff6666',
  },
  noPlaylists: {
    color: '#888',
    marginBottom: 8,
  },
});
