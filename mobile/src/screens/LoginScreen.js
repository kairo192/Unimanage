import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginStudent } from '../api/client';
import { colors, spacing, borderRadius } from '../theme';
import { useToast, ToastProvider } from '../components/Toast';
import { useLanguage } from '../components/LanguageContext';
const logoImg = require('../../assets/logo.png');

  const T = {
  en: {
    title: 'University Management', subtitle: 'Student Portal',
    email: 'Email / Student ID', emailPlaceholder: 'email or student number',
    password: 'Password', passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    errorFill: 'Please fill in all fields',
    errorLogin: 'Invalid email or password',
    errorNetwork: 'Network error. Check your connection.',
    noAccount: 'Account not activated. Contact the director.',
    en: 'English', ar: 'العربية', fr: 'Français',
    emailError: 'Enter your email or student number',
    passwordError: 'Password is required',
  },
  ar: {
    loginTitle: 'تسجيل الدخول',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    errorFill: 'يرجى ملء جميع الحقول',
    errorLogin: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
    errorNetwork: 'خطأ في الشبكة. تحقق من اتصالك.',
    noAccount: 'الحساب غير مفعل. اتصل بالإدارة.',
    en: 'English', ar: 'العربية', fr: 'Français',
    emailError: 'أدخل بريدك الإلكتروني أو رقم الطالب',
    passwordError: 'كلمة المرور مطلوبة',
  },
  fr: {
    loginTitle: 'Connexion',
    emailLabel: 'Email / N° Étudiant',
    passwordLabel: 'Mot de passe',
    signIn: 'Se connecter',
    errorFill: 'Veuillez remplir tous les champs',
    errorLogin: 'Email ou mot de passe incorrect',
    errorNetwork: 'Erreur réseau. Vérifiez votre connexion.',
    noAccount: 'Compte non activé. Contactez la direction.',
    en: 'English', ar: 'العربية', fr: 'Français',
    emailError: 'Entrez votre email ou numéro étudiant',
    passwordError: 'Mot de passe requis',
  },
};

function LoginForm({ navigation }) {
  const { lang, setLang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const isRtl = lang === 'ar';
  const t = (k) => T[lang][k] || T.en[k];
  const toast = useToast();
  const langs = ['en', 'ar', 'fr'];

  const validate = () => {
    let valid = true;
    if (!email.trim()) { setEmailErr(t('emailError')); valid = false; } else setEmailErr('');
    if (!password.trim()) { setPassErr(t('passwordError')); valid = false; } else setPassErr('');
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await loginStudent(email.trim(), password.trim());
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('student', JSON.stringify(data.student));
      navigation.replace('Main');
    } catch (err) {
      const msg = err?.response?.data?.error || '';
      if (msg.includes('not activated')) {
        toast.error(t('noAccount'));
      } else if (msg.includes('Invalid')) {
        toast.error(t('errorLogin'));
      } else {
        toast.error(err?.response ? t('errorLogin') : t('errorNetwork'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0c1e0e', '#19381b', '#0e2819', '#1b110a']} locations={[0, 0.35, 0.65, 1]} style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0c1e0e" />
      <SafeAreaView style={styles.inner}>
        <View style={styles.langRow}>
          {langs.map((l) => (
            <TouchableOpacity key={l} onPress={() => setLang(l)} style={[styles.langBtn, lang === l && styles.langBtnActive]}>
              <Text style={[styles.langText, lang === l && styles.langTextActive]}>{T[lang][l]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.hero}>
          <Image source={logoImg} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>{t('title')}</Text>
          <Text style={styles.heroSubtitle}>{t('subtitle')}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder={t('emailPlaceholder')}
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailErr) setEmailErr(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailErr ? <Text style={styles.fieldError}>{emailErr}</Text> : null}
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder={t('passwordPlaceholder')}
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={password}
              onChangeText={(v) => { setPassword(v); if (passErr) setPassErr(''); }}
              secureTextEntry
            />
            {passErr ? <Text style={styles.fieldError}>{passErr}</Text> : null}
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={['#4a8a1e', '#6aaa2e', '#5c9e22']} locations={[0, 0.5, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, loading && styles.buttonDisabled]}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('signIn')}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function LoginScreen(props) {
  return (
    <ToastProvider>
      <LoginForm {...props} />
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  langRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24, position: 'absolute', top: 60, left: 0, right: 0 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  langBtnActive: { backgroundColor: 'rgba(100,160,60,0.35)', borderColor: 'rgba(100,160,60,0.5)', transform: [{ scale: 1.08 }] },
  langText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 },
  langTextActive: { color: '#b4e06a' },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 72, height: 72, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3, marginTop: 4 },
  card: { backgroundColor: 'rgba(15,30,15,0.65)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 24 },
  field: { marginBottom: 16 },
  input: { width: '100%', padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 },
  fieldError: { fontSize: 12, color: '#ff6b6b', marginTop: 4, fontWeight: '500' },
  button: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', shadowColor: 'rgba(80,160,40,0.4)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 20, elevation: 6 },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
