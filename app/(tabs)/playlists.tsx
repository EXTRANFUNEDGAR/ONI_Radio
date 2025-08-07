// playlists.tsx con estilo militar
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Record<string, any[]>>({});
  const [newList, setNewList] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem('playlists');
      setPlaylists(data ? JSON.parse(data) : {});
    };
    load();
  }, []);

  const create = async () => {
    if (!newList.trim()) return;
    const updated = { ...playlists, [newList]: [] };
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    setPlaylists(updated);
    setNewList('');
  };

  const remove = (name: string) => {
    Alert.alert('Eliminar lista', `¿Seguro que quieres eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          const updated = { ...playlists };
          delete updated[name];
          await AsyncStorage.setItem('playlists', JSON.stringify(updated));
          setPlaylists(updated);
        }
      }
    ]);
  };

  const renderItem = ({ item: name }: { item: string }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/playlist/${encodeURIComponent(name)}`)}
    >
      <Text style={styles.name}>{name}</Text>
      <TouchableOpacity onPress={() => remove(name)}>
        <Ionicons name="trash-outline" size={22} color="#8fff8f" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LISTAS DE REPRODUCCIÓN</Text>
      <TextInput
        value={newList}
        onChangeText={setNewList}
        placeholder="Nueva lista..."
        placeholderTextColor="#6f6"
        style={styles.input}
      />
      <TouchableOpacity onPress={create} style={styles.createBtn}>
        <Text style={styles.createText}>CREAR LISTA</Text>
      </TouchableOpacity>
      <FlatList
        data={Object.keys(playlists)}
        renderItem={renderItem}
        keyExtractor={item => item}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
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
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
    color: '#8fff8f',
    marginBottom: 8,
    borderColor: '#8fff8f',
    borderWidth: 1,
  },
  createBtn: {
    backgroundColor: '#1c1c1c',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#8fff8f',
  },
  createText: {
    color: '#8fff8f',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2f2f2f',
  },
  name: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
});
