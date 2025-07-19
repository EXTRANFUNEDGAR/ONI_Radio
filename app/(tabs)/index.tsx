// app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const stations = [
  {
    name: 'Israeli Army Radio',
    stream: 'https://www.internet-radio.com/stations/aac/',
  },
  {
    name: 'AFP Radio Philippines',
    stream: 'http://www.ustream.tv/channel/afp-radio-live',
  },
];

export default function RadioScreen() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playRadio = async (station: typeof stations[0]) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: station.stream },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrent(station.name);
      setPlaying(true);
    } catch (err) {
      console.log('Error reproduciendo radio:', err);
      setPlaying(false);
    }
  };

  const stopRadio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlaying(false);
      setCurrent(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estaciones Militares</Text>
      <FlatList
        data={stations}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          const isPlaying = current === item.name && playing;
          return (
            <TouchableOpacity
              style={[styles.card, isPlaying && styles.active]}
              onPress={() => (isPlaying ? stopRadio() : playRadio(item))}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={28}
                color={isPlaying ? '#2efc89' : '#a6ff4d'}
              />
            </TouchableOpacity>
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
    backgroundColor: '#0b0d0f',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! : 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a6ff4d',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1a1f1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#2efc89',
    borderWidth: 1,
  },
  active: {
    backgroundColor: '#26322f',
  },
  name: {
    color: '#e7f6d5',
    fontSize: 16,
    fontWeight: '600',
  },
});
