// FavoritesScreen con barra de búsqueda y estilo militar
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAudio } from '../../context/AudioContext';

export default function FavoritesScreen() {
  const [favoriteSongs, setFavoriteSongs] = useState<{ title: string; uri: string; duration: number }[]>([]);
  const [search, setSearch] = useState('');
  const [filteredSongs, setFilteredSongs] = useState<{ title: string; uri: string; duration: number }[]>([]);
  const { play } = useAudio();

  const loadFavorites = async () => {
    const favData = await AsyncStorage.getItem('favorites');
    const parsed = favData ? JSON.parse(favData) : [];
    setFavoriteSongs(parsed);
    setFilteredSongs(parsed);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = favoriteSongs.filter(s => s.title.toLowerCase().includes(text.toLowerCase()));
    setFilteredSongs(filtered);
  };

  const removeFavorite = async (uri: string) => {
    const updatedList = favoriteSongs.filter(s => s.uri !== uri);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedList));
    setFavoriteSongs(updatedList);
    setFilteredSongs(updatedList);
  };

  const renderItem = ({ item }: { item: { title: string; uri: string; duration: number } }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => play(item, filteredSongs)}
    >
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>
          {`${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, '0')}`}
        </Text>
      </View>
      <TouchableOpacity onPress={() => removeFavorite(item.uri)}>
        <Ionicons name="trash-outline" size={22} color="#8fff8f" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (favoriteSongs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#8fff8f' }}>No hay favoritos todavía.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TextInput
        style={styles.input}
        placeholder="Buscar favoritos..."
        placeholderTextColor="#6f6"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredSongs}
        renderItem={renderItem}
        keyExtractor={item => item.uri}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  input: {
    height: 40,
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
    color: '#8fff8f',
    borderColor: '#8fff8f',
    borderWidth: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: '#2f2f2f',
    borderBottomWidth: 1,
  },
  cardBody: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6f6',
    fontSize: 12,
  },
});
