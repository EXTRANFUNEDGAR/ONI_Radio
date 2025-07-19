import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

export default function SongCard({ title, isPlaying, onToggle }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        <Button mode="outlined" onPress={onToggle}>
          {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    marginBottom: 10,
    padding: 10,
  },
  title: {
    color: 'white',
    marginBottom: 8,
  },
});
