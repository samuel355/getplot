import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

export function MapLegend() {
  const items = [
    { color: colors.plotAvailable, label: 'Available' },
    { color: colors.plotReserved, label: 'Reserved' },
    { color: colors.plotSold, label: 'Sold' },
    { color: colors.plotOnHold, label: 'On Hold' },
    { color: colors.plotUnpriced, label: 'Unpriced' },
  ];
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Land Status</Text>
      {items.map((item) => (
        <View key={item.label} style={styles.row}>
          <View style={[styles.swatch, { backgroundColor: item.color }]} />
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: spacing.md,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontWeight: '700', fontSize: fontSize.sm, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  swatch: { width: 14, height: 14, borderRadius: 3, marginRight: 8 },
  label: { fontSize: fontSize.sm, color: colors.text },
});
