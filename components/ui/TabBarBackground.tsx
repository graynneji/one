import React from 'react';
import { View } from 'react-native';

export default function TabBarBackground() {
  return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
}

export function useBottomTabOverflow() {
  return 0;
}