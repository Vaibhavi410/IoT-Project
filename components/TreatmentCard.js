import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

function typeToTKey(type) {
  const m = { Organic: 'organic', Biological: 'biological', Chemical: 'chemical' };
  return m[type] || null;
}

export default function TreatmentCard({ treatment, isExpanded, onToggle, onApply, isApplied }) {
  const { t } = useLanguage();
  const typeKey = typeToTKey(treatment.type);
  const typeLabel = typeKey ? t(typeKey) : treatment.type;

  const costLabel = useMemo(() => {
    const map = { Low: 'low', Medium: 'medium', High: 'high' };
    const key = map[treatment.cost];
    return key ? t(key) : treatment.cost;
  }, [t, treatment.cost]);

  // Determine color based on treatment type
  let cardColor = Colors.primary;
  let cardBg = Colors.successBg; // light green for organic
  let badgeText = t('try_this_first');

  if (treatment.type === 'Biological') {
    cardColor = '#1976D2'; // custom blue
    cardBg = '#E3F2FD';
    badgeText = t('if_organic_fails');
  } else if (treatment.type === 'Chemical') {
    cardColor = Colors.severityModerate; // orange
    cardBg = Colors.warningBg;
    badgeText = t('use_as_last_resort');
  }

  return (
    <View style={[styles.cardContainer, { borderColor: cardColor }]}>
      {/* Header (always visible) */}
      <TouchableOpacity 
        style={[styles.header, { backgroundColor: cardBg }]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.tierText, { color: cardColor }]}>
            {t('tier_prefix')} {treatment.tier}: {typeLabel}
          </Text>
          <Text style={styles.nameText}>{treatment.name}</Text>
        </View>
        <Text style={{ fontSize: 20, color: cardColor }}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badgeText, { color: cardColor }]}>{badgeText}</Text>
            {treatment.type === 'Chemical' && (
              <Text style={[styles.warningBadge, { color: Colors.severityHigh }]}>
                ⚠️ {t('warning')}
              </Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('dosage')}:</Text>
            <Text style={styles.detailValue}>{treatment.dosage}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('dilution_ratio')}:</Text>
            <Text style={styles.detailValue}>{treatment.dilution_ratio}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('spray_schedule')}:</Text>
            <Text style={styles.detailValue}>{treatment.spray_schedule}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('reentry_interval')}:</Text>
            <Text style={styles.detailValue}>{treatment.reentry_interval}</Text>
          </View>

          {/* Effectiveness Bar */}
          <View style={styles.effectivenessContainer}>
            <Text style={styles.detailLabel}>
              {t('effectiveness')} ({treatment.effectiveness}%)
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${treatment.effectiveness}%`, backgroundColor: cardColor }]} />
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('cost')}:</Text>
            <Text style={styles.detailValue}>{costLabel}</Text>
          </View>

          {/* Mark as Applied Button */}
          <TouchableOpacity 
            style={[
              styles.applyButton, 
              isApplied ? styles.applyButtonSuccess : { backgroundColor: cardColor }
            ]}
            onPress={onApply}
            disabled={isApplied}
          >
            <Text style={styles.applyButtonText}>
              {isApplied ? `✓ ${t('applied_today')}` : t('mark_as_applied')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 2,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  tierText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  nameText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.sand,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  },
  warningBadge: {
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  detailLabel: {
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
    flex: 1,
    fontSize: Typography.sizes.sm,
  },
  detailValue: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    flex: 2,
    textAlign: 'right',
    fontSize: Typography.sizes.sm,
  },
  effectivenessContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    marginTop: 6,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  applyButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  applyButtonSuccess: {
    backgroundColor: Colors.severityLow,
  },
  applyButtonText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.md,
  },
});
