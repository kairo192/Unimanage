import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../theme';

export default function NetworkBanner() {
  const [offline, setOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setOffline(!state.isConnected);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: offline ? 0 : -40,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [offline]);

  if (!offline) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9998,
    backgroundColor: colors.systemRed,
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
