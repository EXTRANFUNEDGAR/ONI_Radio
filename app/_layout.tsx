import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AudioProvider } from '../context/AudioContext';
import MiniPlayer from '../components/MiniPlayer';
import { View, StyleSheet } from 'react-native';

export default function Layout() {
  return (
    <AudioProvider>
      <PaperProvider>
        <View style={styles.container}>
          <Slot />
          <MiniPlayer />
        </View>
      </PaperProvider>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
