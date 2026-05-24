import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

const ToastContext = createContext();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onDismiss }) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, damping: 15, stiffness: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 100, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onDismiss(toast.id));
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const tc = toast.color || (toast.type === 'success' ? { bg: colors.successLight, text: colors.success, border: '#c8e6c9' }
    : toast.type === 'error' ? { bg: colors.errorLight, text: colors.error, border: '#f8c7b4' }
    : { bg: '#f0f5fa', text: colors.label, border: '#e8e2d6' });

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: tc.bg, borderColor: tc.border, transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (toast.action?.onPress) toast.action.onPress();
          Animated.parallel([
            Animated.timing(slideAnim, { toValue: 100, duration: 150, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
          ]).start(() => onDismiss(toast.id));
        }}
        style={styles.toastTouch}
      >
        <Text style={[styles.toastText, { color: tc.text }]} numberOfLines={2}>{toast.message}</Text>
        {toast.action && <Text style={[styles.actionText, { color: colors.primary }]}>{toast.action.label}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, ...options }]);
  }, []);

  const success = useCallback((msg, opts) => show(msg, { ...opts, type: 'success' }), [show]);
  const error = useCallback((msg, opts) => show(msg, { ...opts, type: 'error' }), [show]);
  const info = useCallback((msg, opts) => show(msg, { ...opts, type: 'info' }), [show]);

  return (
    <ToastContext.Provider value={{ showToast: show, dismissToast: dismiss, success, error, info }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
    overflow: 'hidden',
  },
  toastTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  toastText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
