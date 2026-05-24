import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { createTicket, uploadTicketImage } from '../api/client';
import { colors, spacing, borderRadius } from '../theme';
import { useToast } from '../components/Toast';
import { useLanguage } from '../components/LanguageContext';
import NetworkBanner from '../components/NetworkBanner';

const T = {
  en: {
    title: 'Report Issue', issueType: 'Issue Type', description: 'Description',
    placeholder: 'Describe the issue in detail...', submit: 'Submit Ticket',
    addPhoto: 'Add Photo', changePhoto: 'Change Photo', takePhoto: 'Take Photo',
    gallery: 'Choose from Gallery', cancel: 'Cancel', uploading: 'Uploading...',
    required: 'Please select a type and describe the issue',
    success: 'Issue reported successfully!',
    electrical: 'Electrical', plumbing: 'Plumbing', furniture: 'Furniture',
    cleaning: 'Cleaning', internet: 'Internet', other: 'Other',
  },
  ar: {
    title: 'الإبلاغ عن مشكلة', issueType: 'نوع المشكلة', description: 'الوصف',
    placeholder: 'صف المشكلة بالتفصيل...', submit: 'إرسال التذكرة',
    addPhoto: 'إضافة صورة', changePhoto: 'تغيير الصورة', takePhoto: 'التقاط صورة',
    gallery: 'اختر من المعرض', cancel: 'إلغاء', uploading: 'جاري الرفع...',
    required: 'يرجى اختيار النوع وكتابة الوصف',
    success: 'تم الإبلاغ عن المشكلة بنجاح!',
    electrical: 'كهرباء', plumbing: 'سباكة', furniture: 'أثاث',
    cleaning: 'تنظيف', internet: 'إنترنت', other: 'أخرى',
  },
  fr: {
    title: 'Signaler un Problème', issueType: 'Type de Problème', description: 'Description',
    placeholder: 'Décrivez le problème en détail...', submit: 'Soumettre le Ticket',
    addPhoto: 'Ajouter une Photo', changePhoto: 'Changer la Photo', takePhoto: 'Prendre une Photo',
    gallery: 'Choisir depuis la Galerie', cancel: 'Annuler', uploading: 'Téléchargement...',
    required: 'Veuillez sélectionner un type et écrire une description',
    success: 'Problème signalé avec succès !',
    electrical: 'Électrique', plumbing: 'Plomberie', furniture: 'Meubles',
    cleaning: 'Nettoyage', internet: 'Internet', other: 'Autre',
  },
};

const TYPES = ['electrical', 'plumbing', 'furniture', 'cleaning', 'internet', 'other'];
const ICONS = { electrical: '⚡', plumbing: '🔧', furniture: '🪑', cleaning: '🧹', internet: '📡', other: '📋' };

export default function ReportIssueScreen({ navigation }) {
  const { lang } = useLanguage();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = (k) => T[lang][k] || T.en[k];
  const toast = useToast();

  const pickImage = async (useCamera) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.error(useCamera ? 'Camera permission required' : 'Gallery permission required');
        return;
      }
      const opts = { mediaTypes: ['images'], allowsEditing: true, quality: 0.7, maxWidth: 1200, maxHeight: 1200 };
      const r = useCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (!r.canceled && r.assets?.length > 0) setImage(r.assets[0].uri);
    } catch (err) {
      toast.error('Failed to access camera or gallery');
    }
  };

  const showPicker = () => {
    Alert.alert('', t('addPhoto'), [
      { text: t('takePhoto'), onPress: () => pickImage(true) },
      { text: t('gallery'), onPress: () => pickImage(false) },
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!type || !description.trim()) { toast.error(t('required')); return; }
    setLoading(true);
    try {
      let image_url = null;
      if (image) {
        setUploading(true);
        const up = await uploadTicketImage(image);
        image_url = up.image_url;
        setUploading(false);
      }
      await createTicket(type, description.trim(), image_url);
      toast.success(t('success'));
      setType(''); setDescription(''); setImage(null);
      navigation.navigate('TicketsHome');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to submit');
    } finally {
      setLoading(false); setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.groupedBackground} />
      <NetworkBanner />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('title')}</Text>

          <Text style={styles.label}>{t('issueType')}</Text>
          <View style={styles.grid}>
            {TYPES.map(k => (
              <TouchableOpacity key={k} onPress={() => setType(k)} style={[styles.chip, type === k && styles.chipActive]} activeOpacity={0.7}>
                <Text style={styles.chipIcon}>{ICONS[k]}</Text>
                <Text style={[styles.chipLabel, type === k && styles.chipLabelActive]}>{t(k)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('description')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('placeholder')}
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.photoBtn} onPress={showPicker} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlace}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoLabel}>{t('addPhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.submit, (loading || uploading) && styles.submitDisabled]} onPress={handleSubmit} disabled={loading || uploading} activeOpacity={0.85}>
            {(loading || uploading) ? (
              <View style={styles.row}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.submitText, { marginLeft: 8 }]}>{uploading ? t('uploading') : ''}</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>{t('submit')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.groupedBackground },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '700', color: colors.label, letterSpacing: 0.37, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.secondaryLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 100, height: 82, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator, gap: 2 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipIcon: { fontSize: 22 },
  chipLabel: { fontSize: 11, fontWeight: '600', color: colors.label, textAlign: 'center' },
  chipLabelActive: { color: colors.white },
  textArea: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 16, color: colors.label, minHeight: 120, borderWidth: 1, borderColor: colors.separator, lineHeight: 22 },
  photoBtn: { marginTop: spacing.md, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.separator, borderStyle: 'dashed' },
  photoPreview: { width: '100%', height: 180, borderRadius: borderRadius.md },
  photoPlace: { height: 100, borderRadius: borderRadius.md, backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  photoIcon: { fontSize: 28, marginBottom: 4 },
  photoLabel: { fontSize: 14, fontWeight: '600', color: colors.tertiaryLabel },
  submit: { backgroundColor: colors.dark, borderRadius: borderRadius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.xl },
  submitDisabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  submitText: { color: colors.white, fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
});
