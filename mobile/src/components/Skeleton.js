import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export function SkeletonCard() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Animated.View style={[styles.badge, { opacity }]} />
        <Animated.View style={[styles.smallBox, { opacity }]} />
      </View>
      <Animated.View style={[styles.line, { width: '60%', opacity }]} />
      <Animated.View style={[styles.line, { width: '90%', opacity }]} />
      <Animated.View style={[styles.line, { width: '40%', opacity }]} />
    </View>
  );
}

export default function SkeletonList({ count = 4 }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  badge: { width: 80, height: 24, borderRadius: 12, backgroundColor: colors.border },
  smallBox: { width: 30, height: 16, borderRadius: 8, backgroundColor: colors.border },
  line: { height: 14, borderRadius: 7, backgroundColor: colors.border, marginBottom: 8 },
});
