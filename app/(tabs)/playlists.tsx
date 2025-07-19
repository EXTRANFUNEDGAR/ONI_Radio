// playlists.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


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
  <Ionicons name="trash-outline" size={22} color="white" />
</TouchableOpacity>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Listas</Text>
      <TextInput
        value={newList}
        onChangeText={setNewList}
        placeholder="Nueva lista..."
        placeholderTextColor="#888"
        style={styles.input}
      />
      <TouchableOpacity onPress={create} style={styles.createBtn}>
        <Text style={styles.createText}>➕ Crear</Text>
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
    backgroundColor: '#121212',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    color: 'white',
    marginBottom: 8,
  },
  createBtn: {
    backgroundColor: '#2e2e2e',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  createText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  name: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  del: {
    fontSize: 16,
    color: 'tomato',
    paddingHorizontal: 8,
  },
});
