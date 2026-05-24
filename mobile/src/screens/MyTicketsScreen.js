import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getMyTickets, deleteTicket } from '../api/client';
import { colors, spacing, borderRadius, statusColors } from '../theme';
import { LAN_IP, API_PORT } from '../config';
import { useToast } from '../components/Toast';
import { useLanguage } from '../components/LanguageContext';
import SkeletonList from '../components/Skeleton';
import NetworkBanner from '../components/NetworkBanner';
import ImageViewer from '../components/ImageViewer';

const API_ORIGIN = `http://${LAN_IP}:${API_PORT}`;

const T = {
  en: { title: 'My Tickets', empty: 'No tickets yet', room: 'Room', unknown: 'N/A', deleting: 'Deleting...', deleted: 'Ticket deleted', deleteFail: 'Failed to delete', confirmDelete: 'Delete this ticket?' },
  ar: { title: 'تذاكري', empty: 'لا توجد تذاكر بعد', room: 'الغرفة', unknown: 'غير محدد', deleting: 'جاري الحذف...', deleted: 'تم حذف التذكرة', deleteFail: 'فشل الحذف', confirmDelete: 'حذف هذه التذكرة؟' },
  fr: { title: 'Mes Tickets', empty: 'Aucun ticket', room: 'Chambre', unknown: 'N/R', deleting: 'Suppression...', deleted: 'Ticket supprimé', deleteFail: 'Échec de suppression', confirmDelete: 'Supprimer ce ticket ?' },
};

export default function MyTicketsScreen({ navigation }) {
  const { lang } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const t = (k) => T[lang][k] || T.en[k];
  const toast = useToast();

  const fetchTickets = useCallback(async () => {
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      toast.error('Could not load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    fetchTickets().then(() => { /* noop */ }).catch(() => { /* noop */ });
    return () => { mounted = false; };
  }, [fetchTickets]));

  const onRefresh = () => { setRefreshing(true); fetchTickets(); };

  const handleDelete = (id) => {
    deleteTicket(id)
      .then(() => { setTickets(prev => prev.filter(ti => ti.id !== id)); toast.success(t('deleted')); })
      .catch(err => toast.error(err?.response?.data?.error || t('deleteFail')));
  };

  const renderTicket = ({ item }) => {
    const sc = statusColors[item.status] || statusColors.pending;
    const imageUrl = item.image_url ? `${API_ORIGIN}${item.image_url}` : null;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TicketDetail', { ticket: item })}
        style={styles.card}
      >
        <View style={styles.cardTop}>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <View style={[styles.dot, { backgroundColor: sc.dot }]} />
            <Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text>
          </View>
          {item.status === 'pending' && (
            <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={12}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.typeText}>{item.type}</Text>
        {imageUrl && (
          <TouchableOpacity onPress={() => setPreviewImg(imageUrl)} activeOpacity={0.9}>
            <Image source={{ uri: imageUrl }} style={styles.thumb} resizeMode="cover" />
          </TouchableOpacity>
        )}
        <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.roomText}>{t('room')}: {item.room_number || t('unknown')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.groupedBackground} />
      <NetworkBanner />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <Text style={styles.title}>{t('title')}</Text>
        {loading ? (
          <SkeletonList count={4} />
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={item => String(item.id)}
            renderItem={renderTicket}
            contentContainerStyle={tickets.length === 0 ? styles.emptyContainer : styles.list}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>{t('empty')}</Text>
              </View>
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
      <ImageViewer visible={!!previewImg} imageUrl={previewImg} onClose={() => setPreviewImg(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBackground },
  flex: { flex: 1 },
  title: { fontSize: 34, fontWeight: '700', color: colors.label, letterSpacing: 0.37, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', opacity: 0.5 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 17, color: colors.tertiaryLabel },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  dot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  deleteIcon: { fontSize: 16 },
  typeText: { fontSize: 17, fontWeight: '600', color: colors.label, textTransform: 'capitalize', marginBottom: 4 },
  thumb: { width: '100%', height: 120, borderRadius: borderRadius.sm, marginBottom: 6, backgroundColor: colors.surfaceAlt },
  descText: { fontSize: 14, color: colors.secondaryLabel, lineHeight: 19, marginBottom: 4 },
  roomText: { fontSize: 12, color: colors.tertiaryLabel },
});
