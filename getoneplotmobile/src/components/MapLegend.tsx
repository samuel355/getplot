import { StyleSheet, Text, View } from 'react-native';
import { PLOT_LEGEND_ITEMS } from '../constants/plotStatus';
import { colors, fontSize, spacing } from '../constants/theme';

export function MapLegend() {
  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Text style={styles.title}>Land Status</Text>
      </View>
      <View style={styles.body}>
        {PLOT_LEGEND_ITEMS.map((item) => (
          <View key={item.label} style={styles.row}>
            <View style={styles.swatchOuter}>
              <View
                style={[
                  styles.swatchFill,
                  { backgroundColor: item.fill, borderColor: item.stroke },
                ]}
              />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Tap an available plot to view details and purchase</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    top: 72,
    left: spacing.md,
    maxWidth: 200,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12,
    zIndex: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  swatchOuter: {
    marginRight: 10,
  },
  swatchFill: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    lineHeight: 16,
  },
});
