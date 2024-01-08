import React from 'react';
import { StyleSheet,Text, TouchableOpacity } from 'react-native';

export const ExampleButton = ({ onPress, disabled, text }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8} disabled={disabled}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'purple',
    borderRadius: 8,
  },
  text: { color: 'white' },
});
