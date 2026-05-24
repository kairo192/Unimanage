import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '../theme';
import { useToast } from '../components/Toast';
import { useLanguage } from '../components/LanguageContext';
import { changePassword } from '../api/client';

const T = {
  en: {
    profile: 'Profile', name: 'Name', email: 'Email',
    studentNumber: 'Student Number', room: 'Room',
    logout: 'Log Out', logoutConfirm: 'Are you sure you want to log out?',
    cancel: 'Cancel', confirm: 'Log Out', notAssigned: 'Not assigned',
    changePassword: 'Change Password', currentPassword: 'Current Password',
    newPassword: 'New Password', update: 'Update Password',
    pwdLength: 'Password must be at least 8 characters',
    pwdSuccess: 'Password changed successfully',
    pwdError: 'Failed to change password',
  },
  ar: {
    profile: 'الملف', name: 'الاسم', email: 'البريد',
    studentNumber: 'الرقم', room: 'الغرفة',
    logout: 'تسجيل الخروج', logoutConfirm: 'هل أنت متأكد؟',
    cancel: 'إلغاء', confirm: 'تسجيل', notAssigned: 'غير محدد',
    changePassword: 'تغيير كلمة المرور', currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة', update: 'تحديث كلمة المرور',
    pwdLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    pwdSuccess: 'تم تغيير كلمة المرور بنجاح',
    pwdError: 'فشل تغيير كلمة المرور',
  },
  fr: {
    profile: 'Profil', name: 'Nom', email: 'Email',
    studentNumber: 'N° Étudiant', room: 'Chambre',
    logout: 'Déconnexion', logoutConfirm: 'Voulez-vous vous déconnecter ?',
    cancel: 'Annuler', confirm: 'Déconnexion', notAssigned: 'Non assigné',
    changePassword: 'Changer le mot de passe', currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe', update: 'Mettre à jour',
    pwdLength: 'Le mot de passe doit faire au moins 8 caractères',
    pwdSuccess: 'Mot de passe modifié avec succès',
    pwdError: 'Échec de la modification du mot de passe',
  },
};

function ProfileContent({ navigation }) {
  const { lang } = useLanguage();
  const [student, setStudent] = useState(null);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const t = (k) => T[lang][k] || T.en[k];
  const toast = useToast();

  React.useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem('student');
      if (s) setStudent(JSON.parse(s));
    })();
  }, []);

  const handleChangePwd = async () => {
    if (newPwd.length < 8) {
      toast.error(t('pwdLength'));
      return;
    }
    setPwdSubmitting(true);
    try {
      await changePassword(currentPwd, newPwd);
      toast.success(t('pwdSuccess'));
      setShowPwdForm(false);
      setCurrentPwd('');
      setNewPwd('');
    } catch (err) {
      const msg = err?.response?.data?.error || t('pwdError');
      toast.error(msg);
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('', t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('confirm'), style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'student']);
          navigation.replace('Login');
        },
      },
    ]);
  };

  const sections = [
    { label: t('name'), value: student?.name },
    { label: t('email'), value: student?.email },
    { label: t('studentNumber'), value: student?.student_number || student?.studentNumber },
    { label: t('room'), value: student?.room || t('notAssigned') },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.groupedBackground} />
        <SafeAreaView edges={['top']} style={styles.safe}>
          <Text style={styles.title}>{t('profile')}</Text>

          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student?.name ? student.name.charAt(0).toUpperCase() : '?'}</Text>
            </View>
            <Text style={styles.nameText}>{student?.name || ''}</Text>
          </View>

          <View style={styles.group}>
            {sections.map((s, i) => (
              <View key={s.label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{s.label}</Text>
                  <Text style={styles.rowValue} numberOfLines={1}>{s.value || '-'}</Text>
                </View>
                {i < sections.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>

          {/* Change Password Section */}
          <TouchableOpacity style={styles.pwdToggle} onPress={() => setShowPwdForm(!showPwdForm)} activeOpacity={0.8}>
            <Text style={styles.pwdToggleText}>{t('changePassword')}</Text>
            <Text style={{ fontSize: 15, color: colors.tertiaryLabel }}>{showPwdForm ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPwdForm && (
            <View style={styles.pwdForm}>
              <TextInput
                style={styles.input}
                placeholder={t('currentPassword')}
                placeholderTextColor={colors.tertiaryLabel}
                secureTextEntry
                value={currentPwd}
                onChangeText={setCurrentPwd}
                autoComplete="password"
              />
              <View style={styles.separator} />
              <TextInput
                style={styles.input}
                placeholder={t('newPassword')}
                placeholderTextColor={colors.tertiaryLabel}
                secureTextEntry
                value={newPwd}
                onChangeText={setNewPwd}
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={[styles.updateBtn, (!currentPwd || newPwd.length < 8 || pwdSubmitting) && { opacity: 0.5 }]}
                onPress={handleChangePwd}
                disabled={!currentPwd || newPwd.length < 8 || pwdSubmitting}
                activeOpacity={0.8}
              >
                <Text style={styles.updateBtnText}>{pwdSubmitting ? '...' : t('update')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ProfileScreen(props) {
  return <ProfileContent {...props} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBackground },
  safe: { flex: 1 },
  content: { paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '700', color: colors.label, letterSpacing: 0.37, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg },

  avatarSection: { alignItems: 'center', paddingVertical: spacing.lg },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 34, fontWeight: '700', color: colors.white },
  nameText: { fontSize: 22, fontWeight: '700', color: colors.label },

  group: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, marginHorizontal: spacing.md, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: spacing.md },
  rowLabel: { fontSize: 15, color: colors.label },
  rowValue: { fontSize: 15, color: colors.secondaryLabel, maxWidth: '50%', textAlign: 'right' },
  separator: { height: 1, backgroundColor: colors.separator, marginLeft: spacing.md },

  pwdToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.md, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.separator, paddingVertical: 14, paddingHorizontal: spacing.md },
  pwdToggleText: { fontSize: 17, fontWeight: '600', color: colors.label },
  pwdForm: { marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.separator, marginTop: -1, overflow: 'hidden' },
  input: { paddingVertical: 13, paddingHorizontal: spacing.md, fontSize: 15, color: colors.label },
  updateBtn: { paddingVertical: 13, alignItems: 'center', backgroundColor: colors.primary, marginHorizontal: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  updateBtnText: { fontSize: 15, fontWeight: '600', color: colors.white },

  logoutBtn: { marginHorizontal: spacing.md, marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.separator, paddingVertical: 14, alignItems: 'center' },
  logoutText: { fontSize: 17, fontWeight: '600', color: colors.systemRed, letterSpacing: -0.41 },
});
