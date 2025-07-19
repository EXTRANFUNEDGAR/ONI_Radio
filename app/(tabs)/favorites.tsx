// FavoritesScreen con barra de búsqueda y padding para evitar barra de estado
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '../../context/AudioContext';
import { Ionicons } from '@expo/vector-icons';


export default function FavoritesScreen() {
  const [favoriteSongs, setFavoriteSongs] = useState<MediaLibrary.Asset[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filteredSongs, setFilteredSongs] = useState<MediaLibrary.Asset[]>([]);
  const { play } = useAudio();

  useEffect(() => {
    const loadFavorites = async () => {
      const favData = await AsyncStorage.getItem('favorites');
      const ids = favData ? JSON.parse(favData) : [];
      setFavoriteIds(ids);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      const all = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 1000 });
      const matched = all.assets.filter(asset => ids.includes(asset.id));
      setFavoriteSongs(matched);
      setFilteredSongs(matched);
    };
    loadFavorites();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = favoriteSongs.filter(s => s.filename.toLowerCase().includes(text.toLowerCase()));
    setFilteredSongs(filtered);
  };

  const removeFavorite = async (id: string) => {
    const updated = favoriteIds.filter(f => f !== id);
    setFavoriteIds(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    setFavoriteSongs(s => s.filter(song => song.id !== id));
    setFilteredSongs(s => s.filter(song => song.id !== id));
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        play(
          { title: item.filename, uri: item.uri },
          filteredSongs.map(s => ({ title: s.filename, uri: s.uri }))
        )
      }
    >
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.title}>{item.filename}</Text>
        <Text style={styles.subtitle}>
  {`${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, '0')}`}
</Text>

      </View>
<TouchableOpacity onPress={() => removeFavorite(item.id)}>
  <Ionicons name="trash-outline" size={22} color="white" />
</TouchableOpacity>

    </TouchableOpacity>
  );

  if (favoriteSongs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>No hay favoritos todavía.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TextInput
        style={styles.input}
        placeholder="Buscar favoritos..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredSongs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  input: {
    height: 40,
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    color: 'white',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  cardBody: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 12,
  },
});
