import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteTicket } from '../api/client';
import { colors, spacing, borderRadius, statusColors } from '../theme';
import { LAN_IP, API_PORT } from '../config';
import { useToast } from '../components/Toast';
import { useLanguage } from '../components/LanguageContext';
import ImageViewer from '../components/ImageViewer';
import NetworkBanner from '../components/NetworkBanner';

const API_ORIGIN = `http://${LAN_IP}:${API_PORT}`;

const T = {
  en: {
    details: 'Ticket Details', progress: 'Progress', type: 'Type', status: 'Status', room: 'Room', description: 'Description', submitted: 'Submitted', delete: 'Delete Ticket', confirmDelete: 'Delete this ticket?', deleted: 'Ticket deleted', deleteFail: 'Failed to delete', noDesc: 'No description', photo: 'Photo', reported: 'Reported', inProgress: 'In Progress', resolved: 'Resolved', close: 'Close',
  },
  ar: {
    details: 'تفاصيل التذكرة', progress: 'التقدم', type: 'النوع', status: 'الحالة', room: 'الغرفة', description: 'الوصف', submitted: 'مقدم', delete: 'حذف', confirmDelete: 'حذف هذه التذكرة؟', deleted: 'تم الحذف', deleteFail: 'فشل الحذف', noDesc: 'لا يوجد وصف', photo: 'الصورة', reported: 'مُبلَغ', inProgress: 'قيد التنفيذ', resolved: 'تم الحل', close: 'إغلاق',
  },
  fr: {
    details: 'Détails', progress: 'Progression', type: 'Type', status: 'Statut', room: 'Chambre', description: 'Description', submitted: 'Soumis', delete: 'Supprimer', confirmDelete: 'Supprimer ce ticket ?', deleted: 'Ticket supprimé', deleteFail: 'Échec', noDesc: 'Aucune description', photo: 'Photo', reported: 'Signalé', inProgress: 'En cours', resolved: 'Résolu', close: 'Fermer',
  },
};

const STEPS = ['pending', 'in_progress', 'resolved'];
const STEP_LABEL_KEY = { pending: 'reported', in_progress: 'inProgress', resolved: 'resolved' };

export default function TicketDetailScreen({ route, navigation }) {
  const ticket = route?.params?.ticket;
  const { lang } = useLanguage();
  const [deleting, setDeleting] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const t = (k) => T[lang][k] || T.en[k];
  const toast = useToast();

  if (!ticket) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.flex}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 17, color: colors.tertiaryLabel }}>Ticket not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const sc = statusColors[ticket.status] || statusColors.pending;
  const imageUrl = ticket.image_url ? `${API_ORIGIN}${ticket.image_url}` : null;

  const formatDate = (iso) => {
    if (!iso) return '';
    const locale = lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const currentStep = Math.max(0, STEPS.indexOf(ticket.status));

  const handleDelete = () => {
    setDeleting(true);
    deleteTicket(ticket.id)
      .then(() => { toast.success(t('deleted')); navigation.goBack(); })
      .catch(err => toast.error(err?.response?.data?.error || t('deleteFail')))
      .finally(() => setDeleting(false));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.groupedBackground} />
      <NetworkBanner />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Status Header */}
          <View style={styles.statusCard}>
            <View style={[styles.badge, { backgroundColor: sc.bg }]}>
              <View style={[styles.dot, { backgroundColor: sc.dot }]} />
              <Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text>
            </View>
            <Text style={styles.typeLabel}>{ticket.type}</Text>
            <Text style={styles.dateLabel}>{formatDate(ticket.created_at)}</Text>
          </View>

          {/* Progress Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('progress')}</Text>
            <View style={styles.timeline}>
              {STEPS.map((step, i) => {
                const active = i <= currentStep;
                const current = i === currentStep;
                const s = statusColors[step];
                return (
                  <View key={step} style={styles.stepRow}>
                    <View style={styles.stepCol}>
                      <View style={[styles.stepDot, active && { backgroundColor: s.dot }, current && styles.stepDotActive]} />
                      {i < STEPS.length - 1 && <View style={[styles.stepLine, active && i < currentStep && { backgroundColor: s.dot }]} />}
                    </View>
                    <Text style={[styles.stepLabel, current && styles.stepLabelActive, !active && styles.stepLabelInactive]}>
                      {t(STEP_LABEL_KEY[step])}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Info */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('type')}</Text>
              <Text style={styles.infoValue}>{ticket.type}</Text>
            </View>
            <View style={styles.sep} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('room')}</Text>
              <Text style={styles.infoValue}>{ticket.room_number || '-'}</Text>
            </View>
            <View style={styles.sep} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('description')}</Text>
            </View>
            <Text style={styles.descText}>{ticket.description || t('noDesc')}</Text>
          </View>

          {/* Image */}
          {imageUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('photo')}</Text>
              <TouchableOpacity onPress={() => setPreviewImg(imageUrl)} activeOpacity={0.9}>
                <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          )}

          {/* Delete */}
          {ticket.status === 'pending' && (
            <TouchableOpacity style={[styles.deleteBtn, deleting && { opacity: 0.5 }]} onPress={handleDelete} disabled={deleting} activeOpacity={0.8}>
              <Text style={styles.deleteText}>{t('delete')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
      <ImageViewer visible={!!previewImg} imageUrl={previewImg} onClose={() => setPreviewImg(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBackground },
  flex: { flex: 1 },
  scroll: { paddingBottom: 40 },

  statusCard: { backgroundColor: colors.surface, padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.separator, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: borderRadius.full, marginBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  badgeText: { fontSize: 14, fontWeight: '700' },
  typeLabel: { fontSize: 28, fontWeight: '700', color: colors.label, textTransform: 'capitalize', marginBottom: 4 },
  dateLabel: { fontSize: 13, color: colors.tertiaryLabel },

  section: { backgroundColor: colors.surface, marginTop: spacing.md, padding: spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.secondaryLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },

  timeline: { paddingLeft: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 44 },
  stepCol: { width: 24, alignItems: 'center' },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.quaternaryLabel, marginTop: 3 },
  stepDotActive: { width: 16, height: 16, borderRadius: 8, marginTop: 1, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.separator, marginVertical: 2 },
  stepLabel: { fontSize: 15, color: colors.label, marginLeft: spacing.sm, paddingTop: 1 },
  stepLabelActive: { fontWeight: '600' },
  stepLabelInactive: { color: colors.quaternaryLabel },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoLabel: { fontSize: 15, color: colors.secondaryLabel },
  infoValue: { fontSize: 15, fontWeight: '600', color: colors.label, textTransform: 'capitalize' },
  sep: { height: 1, backgroundColor: colors.separator },
  descText: { fontSize: 15, color: colors.label, lineHeight: 22, marginTop: spacing.sm },

  image: { width: '100%', height: Dimensions.get('window').width * 0.75, borderRadius: borderRadius.md, backgroundColor: colors.surfaceAlt },

  deleteBtn: { marginHorizontal: spacing.md, marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.separator, paddingVertical: 14, alignItems: 'center' },
  deleteText: { fontSize: 17, fontWeight: '600', color: colors.systemRed, letterSpacing: -0.41 },
});
