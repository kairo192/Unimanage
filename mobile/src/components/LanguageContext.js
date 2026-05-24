import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = '@uni_lang';
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved) setLangState(saved);
      } catch { /* ignore */ }
    })();
  }, []);

  const setLang = async (l) => {
    setLangState(l);
    try { await AsyncStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: 'en', setLang: () => {} };
  return ctx;
}
