import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function RecordingButton({ isRecording, onPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isRecording ? '#FF3B30' : '#007AFF' }]}
        onPress={onPress}
      >
        <Text style={styles.text}>{isRecording ? 'Stop' : 'Record'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  button: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
  },
  text: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
