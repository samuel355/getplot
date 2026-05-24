import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, fontWeight, borderRadius } from '../constants/theme';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { PropertyFilters } from '../types/property';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Partial<PropertyFilters>) => void;
  initialFilters: PropertyFilters;
};

const PROPERTY_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'House', value: 'house' },
  { label: 'Land', value: 'land' },
  { label: 'Apartment', value: 'apartment' },
];

const LISTING_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
  { label: 'Short-term', value: 'airbnb' },
];

const REGIONS = [
  { label: 'All Regions', value: 'all' },
  { label: 'Greater Accra', value: 'Greater Accra' },
  { label: 'Ashanti', value: 'Ashanti' },
  { label: 'Central', value: 'Central' },
  { label: 'Eastern', value: 'Eastern' },
  { label: 'Western', value: 'Western' },
  { label: 'Northern', value: 'Northern' },
  { label: 'Volta', value: 'Volta' },
];

const ROOM_OPTIONS = [
  { label: 'Any', value: 'any' },
  { label: '1+', value: '1' },
  { label: '2+', value: '2' },
  { label: '3+', value: '3' },
  { label: '4+', value: '4' },
  { label: '5+', value: '5' },
];

export function FilterModal({ visible, onClose, onApply, initialFilters }: Props) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: PropertyFilters = {
      propertyType: 'all',
      priceRange: [0, 10000000],
      location: 'all',
      bedrooms: 'any',
      bathrooms: 'any',
      sortBy: initialFilters.sortBy,
      property_type: 'all',
    };
    setFilters(resetFilters);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {/* Property Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.chipGrid}>
                {PROPERTY_TYPES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.chip,
                      filters.propertyType === item.value && styles.chipActive,
                    ]}
                    onPress={() => updateFilter('propertyType', item.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.propertyType === item.value && styles.chipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Listing Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listing Type</Text>
              <View style={styles.chipGrid}>
                {LISTING_TYPES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.chip,
                      filters.property_type === item.value && styles.chipActive,
                    ]}
                    onPress={() => updateFilter('property_type', item.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.property_type === item.value && styles.chipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Region */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Region</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {REGIONS.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.chip,
                      filters.location === item.value && styles.chipActive,
                      { marginRight: spacing.sm }
                    ]}
                    onPress={() => updateFilter('location', item.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.location === item.value && styles.chipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Rooms - Only show if not Land */}
            {filters.propertyType !== 'land' && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Bedrooms</Text>
                  <View style={styles.chipGrid}>
                    {ROOM_OPTIONS.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.chip,
                          filters.bedrooms === item.value && styles.chipActive,
                        ]}
                        onPress={() => updateFilter('bedrooms', item.value)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            filters.bedrooms === item.value && styles.chipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Bathrooms</Text>
                  <View style={styles.chipGrid}>
                    {ROOM_OPTIONS.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.chip,
                          filters.bathrooms === item.value && styles.chipActive,
                        ]}
                        onPress={() => updateFilter('bathrooms', item.value)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            filters.bathrooms === item.value && styles.chipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range (GHS)</Text>
              <View style={styles.priceRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Min Price"
                    keyboardType="numeric"
                    value={filters.priceRange[0].toString()}
                    onChangeText={(v) => {
                      const min = parseInt(v) || 0;
                      updateFilter('priceRange', [min, filters.priceRange[1]]);
                    }}
                  />
                </View>
                <Text style={styles.priceDash}>—</Text>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Max Price"
                    keyboardType="numeric"
                    value={filters.priceRange[1].toString()}
                    onChangeText={(v) => {
                      const max = parseInt(v) || 10000000;
                      updateFilter('priceRange', [filters.priceRange[0], max]);
                    }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button title="Apply Filters" onPress={handleApply} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  resetText: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  priceDash: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.xl,
  },
});
