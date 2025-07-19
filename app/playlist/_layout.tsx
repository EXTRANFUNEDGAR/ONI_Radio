// app/playlist/_layout.tsx
import { Stack } from 'expo-router';

export default function PlaylistLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: 'white',
      }}
    />
  );
}
