import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/Toast';
import { LanguageProvider } from './src/components/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <LanguageProvider>
          <AppNavigator />
        </LanguageProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
