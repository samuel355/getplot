import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { colors, fontSize, spacing } from '../constants/theme';
import { formatGhs } from '../lib/plotService';
import type { PlotFeature } from '../types/plot';
import type { Development } from '../constants/developments';
import { Button } from './ui/Button';

type Props = {
  visible: boolean;
  plot: PlotFeature | null;
  development: Development;
  inCart: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onBuy: () => void;
  onReserve: () => void;
  onExpressInterest: () => void;
};

export function PlotDetailSheet({
  visible,
  plot,
  development,
  inCart,
  onClose,
  onAddToCart,
  onBuy,
  onReserve,
  onExpressInterest,
}: Props) {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || '';
  const isAdmin = ['admin', 'sysadmin', 'chief', 'chief_asst'].includes(role);

  if (!plot) return null;

  const props = plot.properties || {};
  const plotNo = props.Plot_No ?? '—';
  const street = props.Street_Nam ?? '—';
  const area = props.Area ?? '—';
  const amount = plot.plotTotalAmount || 0;
  const status = plot.status || 'Available';
  const canPurchase =
    (!status || status === 'Available') && amount > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.site}>{development.title}</Text>
            <Text style={styles.plotNo}>Plot {plotNo}</Text>
            <Text style={styles.meta}>{street}</Text>
            <Text style={styles.meta}>Size: {area} acres</Text>
            <Text style={styles.price}>{formatGhs(amount)}</Text>
            <View style={[styles.badge, statusStyle(status)]}>
              <Text style={styles.badgeText}>{status}</Text>
            </View>

            <View style={styles.actions}>
              {canPurchase && (
                <>
                  <Button title="Buy Plot" onPress={onBuy} />
                  <Button title="Reserve Plot" variant="outline" onPress={onReserve} />
                  <Button
                    title={inCart ? 'In Cart' : 'Add to Cart'}
                    variant="secondary"
                    onPress={onAddToCart}
                    disabled={inCart}
                  />
                </>
              )}
              <Button title="Express Interest" variant="ghost" onPress={onExpressInterest} />
              {isAdmin && (
                <Text style={styles.adminHint}>
                  Admin: use web dashboard for price/status edits, or contact support.
                </Text>
              )}
              <Button title="Close" variant="outline" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function statusStyle(status: string) {
  if (status === 'Sold') return { backgroundColor: '#fee2e2' };
  if (status === 'Reserved') return { backgroundColor: '#f3f4f6' };
  if (status === 'On Hold') return { backgroundColor: '#e5e7eb' };
  return { backgroundColor: '#dcfce7' };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    padding: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  site: { fontSize: fontSize.sm, color: colors.textMuted },
  plotNo: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary },
  meta: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 4 },
  price: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  badgeText: { fontWeight: '600', fontSize: fontSize.sm },
  actions: { gap: spacing.sm, paddingBottom: spacing.xl },
  adminHint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
});
