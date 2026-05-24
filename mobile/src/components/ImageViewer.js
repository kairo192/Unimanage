import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Text,
} from 'react-native';
import { colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

export default function ImageViewer({ visible, imageUrl, onClose }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [panning, setPanning] = useState(false);
  const baseScale = useRef(1);

  const handleZoom = (direction) => {
    const newScale = direction === 'in' ? Math.min(baseScale.current * 1.5, 4) : Math.max(baseScale.current / 1.5, 1);
    baseScale.current = newScale;
    Animated.spring(scale, { toValue: newScale, damping: 20, useNativeDriver: true }).start();
  };

  const resetZoom = () => {
    baseScale.current = 1;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 20, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, damping: 20, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 20, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.zoomBtns}>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('in')}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('out')}>
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
          {baseScale.current > 1 && (
            <TouchableOpacity style={styles.zoomBtn} onPress={resetZoom}>
              <Text style={styles.zoomText}>⟲</Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.View
          style={[styles.imageWrap, { transform: [{ scale }, { translateX }, { translateY }] }]}
        >
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute', top: 56, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  zoomBtns: {
    position: 'absolute', bottom: 80, zIndex: 10,
    flexDirection: 'row', gap: 12,
  },
  zoomBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  zoomText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  imageWrap: { width: W, height: H },
  image: { width: '100%', height: '100%' },
});
