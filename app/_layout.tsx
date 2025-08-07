// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from '../context/AudioContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <Slot />
      </AudioProvider>
    </SafeAreaProvider>
  );
}
