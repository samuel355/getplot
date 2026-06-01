import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Badge } from '../../../../src/components/ui/Badge';
import { Button } from '../../../../src/components/ui/Button';
import { Input } from '../../../../src/components/ui/Input';
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
} from '../../../../src/constants/theme';
import { getDevelopment } from '../../../../src/constants/developments';
import { fetchPlotsForTable } from '../../../../src/lib/mapUtils';
import {
  formatAreaSize,
  formatGhs,
  updatePlotDetailsAdmin,
} from '../../../../src/lib/plotService';
import { supabase } from '../../../../src/lib/supabase';
import type { AdminPlotUpdate } from '../../../../src/lib/plotService';
import type { PlotFeature } from '../../../../src/types/plot';

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle['fontWeight']>;
const STATUS_OPTIONS = ['All', 'Available', 'Reserved', 'Sold', 'On Hold', 'Unpriced'] as const;
const EDIT_STATUS_OPTIONS = ['Available', 'Reserved', 'Sold', 'On Hold'] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];
type EditForm = {
  status: string;
  plotTotalAmount: string;
  paidAmount: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  country: string;
  residentialAddress: string;
  agent: string;
  remarks: string;
};

function plotNo(plot: PlotFeature) {
  return String(plot.properties?.Plot_No || 'Untitled');
}

function streetName(plot: PlotFeature) {
  return String(plot.properties?.Street_Nam || '').replace(/\r/g, '').trim();
}

function statusOf(plot: PlotFeature) {
  if (Number(plot.plotTotalAmount || 0) <= 0) return 'Unpriced';
  return plot.status || 'Available';
}

function parseAmount(value: string) {
  const parsed = Number(String(value || '0').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildForm(plot: PlotFeature | null): EditForm {
  return {
    status: plot?.status || 'Available',
    plotTotalAmount: String(Number(plot?.plotTotalAmount || 0) || ''),
    paidAmount: String(Number(plot?.paidAmount || 0) || ''),
    firstname: plot?.firstname || '',
    lastname: plot?.lastname || '',
    phone: plot?.phone || '',
    email: plot?.email || '',
    country: plot?.country || '',
    residentialAddress: plot?.residentialAddress || '',
    agent: plot?.agent || '',
    remarks: plot?.remarks || '',
  };
}

function badgeVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' | 'outline' {
  if (status === 'Available') return 'success';
  if (status === 'Reserved') return 'secondary';
  if (status === 'Sold') return 'error';
  if (status === 'On Hold') return 'warning';
  return 'outline';
}

export default function AdminSitePlotsScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const development = getDevelopment(slug || '');
  const router = useRouter();
  const navigation = useNavigation();

  const [plots, setPlots] = useState<PlotFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [editing, setEditing] = useState<PlotFeature | null>(null);
  const [form, setForm] = useState<EditForm>(() => buildForm(null));
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    if (development) navigation.setOptions({ title: development.title });
  }, [development, navigation]);

  const loadPlots = useCallback(async (silent = false) => {
    if (!development) return;
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchPlotsForTable(development.table);
      setPlots(data);
    } catch (error) {
      Alert.alert('Could not load plots', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [development]);

  useEffect(() => {
    loadPlots();
  }, [loadPlots]);

  const stats = useMemo(() => {
    return plots.reduce(
      (acc, plot) => {
        const status = statusOf(plot);
        acc.total += 1;
        if (status === 'Available') acc.available += 1;
        if (status === 'Reserved') acc.reserved += 1;
        if (status === 'Sold') acc.sold += 1;
        if (status === 'On Hold') acc.onHold += 1;
        if (status === 'Unpriced') acc.unpriced += 1;
        return acc;
      },
      { total: 0, available: 0, reserved: 0, sold: 0, onHold: 0, unpriced: 0 },
    );
  }, [plots]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return plots.filter((plot) => {
      const status = statusOf(plot);
      if (statusFilter !== 'All' && status !== statusFilter) return false;
      if (!needle) return true;

      return [
        plotNo(plot),
        streetName(plot),
        plot.firstname,
        plot.lastname,
        plot.phone,
        plot.email,
        plot.agent,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [plots, query, statusFilter]);

  const openEditor = (plot: PlotFeature) => {
    setEditing(plot);
    setForm(buildForm(plot));
  };

  const setField = (field: keyof EditForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const savePlot = async () => {
    if (!development || !editing) return;

    const total = parseAmount(form.plotTotalAmount);
    const paid = parseAmount(form.paidAmount);
    if (paid > total) {
      Alert.alert('Check amount', 'Paid amount must not be greater than total amount.');
      return;
    }

    const payload: AdminPlotUpdate = {
      status: form.status,
      plotTotalAmount: total,
      paidAmount: paid,
      remainingAmount: Math.max(total - paid, 0),
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      country: form.country.trim(),
      residentialAddress: form.residentialAddress.trim(),
      agent: form.agent.trim(),
      remarks: form.remarks.trim(),
    };

    setSaving(true);
    const { data, error } = await updatePlotDetailsAdmin(development.table, editing.id, payload);
    setSaving(false);

    if (error || !data) {
      Alert.alert('Update failed', error?.message || 'Could not update plot.');
      return;
    }

    const updated = data as PlotFeature;
    setPlots((current) => current.map((plot) => (plot.id === updated.id ? updated : plot)));
    setEditing(null);
  };

  const deletePlot = (plot: PlotFeature) => {
    if (!development) return;
    Alert.alert('Delete plot?', `Plot ${plotNo(plot)} will be removed from ${development.title}.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from(development.table).delete().eq('id', plot.id);
          if (error) {
            Alert.alert('Delete failed', error.message);
            return;
          }
          setPlots((current) => current.filter((item) => item.id !== plot.id));
        },
      },
    ]);
  };

  if (!development) return null;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={text.muted}>Loading {development.title} plots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={() => loadPlots(true)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Ionicons name="business-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={text.title}>{development.title}</Text>
                <Text style={text.subtitle}>{development.subtitle}</Text>
              </View>
              <Pressable
                style={styles.mapButton}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/sites/[slug]',
                    params: { slug: development.slug, returnTo: 'admin-plots' },
                  })
                }
              >
                <Ionicons name="map-outline" size={17} color={colors.white} />
                <Text style={text.mapButton}>View map</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <StatBox label="Total" value={stats.total} />
              <StatBox label="Available" value={stats.available} color={colors.success} />
              <StatBox label="Reserved" value={stats.reserved} color={colors.primary} />
              <StatBox label="Sold" value={stats.sold} color={colors.error} />
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search plot, street, client, phone, agent"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {STATUS_OPTIONS.map((status) => {
                const active = statusFilter === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[text.filterChip, active && text.filterChipActive]}>{status}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.tableHeader}>
              <Text style={text.tableTitle}>Plot table</Text>
              <Text style={text.tableCount}>{filtered.length.toLocaleString()} rows</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={24} color={colors.textMuted} />
            <Text style={text.muted}>No plots match this search.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PlotRow plot={item} onEdit={() => openEditor(item)} onDelete={() => deletePlot(item)} />
        )}
      />

      <EditModal
        visible={!!editing}
        plot={editing}
        form={form}
        saving={saving}
        onChange={setField}
        onClose={() => setEditing(null)}
        onSave={savePlot}
      />
    </View>
  );
}

function StatBox({ label, value, color = colors.primary }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[text.statValue, { color }]}>{value.toLocaleString()}</Text>
      <Text style={text.statLabel}>{label}</Text>
    </View>
  );
}

function PlotRow({
  plot,
  onEdit,
  onDelete,
}: {
  plot: PlotFeature;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = statusOf(plot);
  const street = streetName(plot);
  const client = [plot.firstname, plot.lastname].filter(Boolean).join(' ');
  const size = formatAreaSize(plot.properties?.Area);

  return (
    <View style={styles.plotRow}>
      <View style={styles.plotTop}>
        <View style={styles.plotTitleWrap}>
          <Text style={text.plotTitle}>Plot {plotNo(plot)}</Text>
          <Text style={text.plotSub} numberOfLines={1}>
            {street || 'No street name'}{size ? ` • ${size} acres` : ''}
          </Text>
        </View>
        <Badge content={status} variant={badgeVariant(status)} />
      </View>

      <View style={styles.rowFacts}>
        <Fact icon="cash-outline" label={formatGhs(Number(plot.plotTotalAmount || 0))} />
        <Fact icon="person-outline" label={client || 'No client'} />
        <Fact icon="call-outline" label={plot.phone || 'No phone'} />
      </View>

      <View style={styles.rowActions}>
        <Pressable style={styles.rowAction} onPress={onEdit}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={text.rowAction}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.rowAction, styles.deleteAction]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={text.deleteAction}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Fact({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={text.fact} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function EditModal({
  visible,
  plot,
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  visible: boolean;
  plot: PlotFeature | null;
  form: EditForm;
  saving: boolean;
  onChange: (field: keyof EditForm, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const total = parseAmount(form.plotTotalAmount);
  const paid = parseAmount(form.paidAmount);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={text.modalTitle}>Edit Plot {plot ? plotNo(plot) : ''}</Text>
              <Text style={text.modalSub}>Update the land table record</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.error} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
            <Text style={text.sectionLabel}>Status</Text>
            <View style={styles.editStatusRow}>
              {EDIT_STATUS_OPTIONS.map((status) => {
                const active = form.status === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => onChange('status', status)}
                    style={[styles.editStatus, active && styles.editStatusActive]}
                  >
                    <Text style={[text.editStatus, active && text.editStatusActive]}>{status}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.formGrid}>
              <Input
                label="Total amount"
                value={form.plotTotalAmount}
                keyboardType="number-pad"
                onChangeText={(value) => onChange('plotTotalAmount', value)}
                containerStyle={styles.halfInput}
              />
              <Input
                label="Paid amount"
                value={form.paidAmount}
                keyboardType="number-pad"
                onChangeText={(value) => onChange('paidAmount', value)}
                containerStyle={styles.halfInput}
              />
            </View>
            <Input label="Remaining amount" value={String(Math.max(total - paid, 0))} editable={false} />

            <Text style={text.sectionLabel}>Client</Text>
            <View style={styles.formGrid}>
              <Input
                label="First name"
                value={form.firstname}
                onChangeText={(value) => onChange('firstname', value)}
                containerStyle={styles.halfInput}
              />
              <Input
                label="Last name"
                value={form.lastname}
                onChangeText={(value) => onChange('lastname', value)}
                containerStyle={styles.halfInput}
              />
            </View>
            <Input label="Phone" value={form.phone} keyboardType="phone-pad" onChangeText={(value) => onChange('phone', value)} />
            <Input label="Email" value={form.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(value) => onChange('email', value)} />
            <Input label="Country" value={form.country} onChangeText={(value) => onChange('country', value)} />
            <Input label="Residential address" value={form.residentialAddress} onChangeText={(value) => onChange('residentialAddress', value)} />
            <Input label="Agent" value={form.agent} onChangeText={(value) => onChange('agent', value)} />

            <Text style={text.sectionLabel}>Remarks</Text>
            <TextInput
              value={form.remarks}
              onChangeText={(value) => onChange('remarks', value)}
              multiline
              textAlignVertical="top"
              placeholder="Add internal notes"
              placeholderTextColor={colors.textMuted}
              style={styles.remarks}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="ghost" onPress={onClose} style={styles.footerButton} />
            <Button title="Save changes" onPress={onSave} loading={saving} style={styles.footerButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create<Record<string, ViewStyle>>({
  container: { flex: 1, backgroundColor: colors.surface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  hero: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1 },
  mapButton: {
    minHeight: 40,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  searchWrap: {
    minHeight: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.base },
  filters: { gap: spacing.sm, paddingVertical: spacing.md },
  filterChip: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  plotRow: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  plotTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  plotTitleWrap: { flex: 1 },
  rowFacts: { gap: spacing.sm, marginTop: spacing.md },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  rowAction: {
    flex: 1,
    minHeight: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  deleteAction: { backgroundColor: `${colors.error}10` },
  empty: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.45)' },
  modalSheet: {
    maxHeight: '88%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    minHeight: 64,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.error}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  editStatusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  editStatus: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editStatusActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  formGrid: { flexDirection: 'row', gap: spacing.sm },
  halfInput: { flex: 1 },
  remarks: {
    minHeight: 88,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.base,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: { flex: 1 },
});

const text = StyleSheet.create<Record<string, TextStyle>>({
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: weights.extrabold },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  muted: { color: colors.textMuted, fontSize: fontSize.sm },
  mapButton: { color: colors.white, fontSize: fontSize.sm, fontWeight: weights.bold },
  statValue: { fontSize: fontSize.lg, fontWeight: weights.extrabold },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  filterChip: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: weights.semibold },
  filterChipActive: { color: colors.white },
  tableTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: weights.extrabold },
  tableCount: { color: colors.textMuted, fontSize: fontSize.sm },
  plotTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: weights.bold },
  plotSub: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 3 },
  fact: { flex: 1, color: colors.textSecondary, fontSize: fontSize.sm },
  rowAction: { color: colors.primary, fontSize: fontSize.sm, fontWeight: weights.bold },
  deleteAction: { color: colors.error, fontSize: fontSize.sm, fontWeight: weights.bold },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: weights.extrabold },
  modalSub: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  sectionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: weights.extrabold },
  editStatus: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: weights.bold },
  editStatusActive: { color: colors.white },
});
