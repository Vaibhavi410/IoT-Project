import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

function typeToTKey(type) {
  const m = { Organic: 'organic', Biological: 'biological', Chemical: 'chemical' };
  return m[type] || null;
}

export default function TreatmentCard({ treatment, isExpanded, onToggle, onApply, isApplied }) {
  const { t } = useLanguage();
  const typeKey = typeToTKey(treatment.type);
  const typeLabel = typeKey ? t(typeKey) : treatment.type;

  // Determine color based on treatment type
  let cardColor = COLORS.primary;
  let cardBg = '#E8F5E9'; // light green for organic
  let badgeText = t('try_this_first');

  if (treatment.type === 'Biological') {
    cardColor = '#1976D2'; // blue
    cardBg = '#E3F2FD';
    badgeText = t('if_organic_fails');
  } else if (treatment.type === 'Chemical') {
    cardColor = COLORS.warning; // orange
    cardBg = '#FFF3E0';
    badgeText = t('use_as_last_resort');
  }

  const costLabel = useMemo(() => {
    const map = { Low: 'low', Medium: 'medium', High: 'high' };
    const key = map[treatment.cost];
    return key ? t(key) : treatment.cost;
  }, [t, treatment.cost]);

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
              <Text style={[styles.warningBadge, { color: COLORS.danger }]}>
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
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flex: 1,
  },
  tierText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    padding: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  warningBadge: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailLabel: {
    color: COLORS.gray,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    color: COLORS.text,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  effectivenessContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 4,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  applyButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  applyButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
