import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

export default function ToxicityWarningModal({
  visible,
  onClose,
  onConfirm,
  chemicalData,
}) {
  const { t } = useLanguage();
  const [pulseAnim] = useState(new Animated.Value(0));

  // Gear checklist states
  const [gearChecked, setGearChecked] = useState({});

  useEffect(() => {
    // Reset checks when modal opens
    if (visible && chemicalData) {
      const initialGear = {};
      chemicalData.safety_gear.forEach(gear => {
        initialGear[gear] = false;
      });
      setGearChecked(initialGear);
    }
  }, [visible, chemicalData]);

  useEffect(() => {
    let anim;
    if (
      visible &&
      (chemicalData?.toxicity_level === 'HIGH' ||
        chemicalData?.toxicity_level === 'EXTREMELY HIGH')
    ) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(0);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [visible, chemicalData, pulseAnim]);

  if (!chemicalData) return null;

  const toggleGear = (item) => {
    setGearChecked(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const getToxicityColor = (level) => {
    switch (level) {
      case 'LOW':
        return Colors.severityLow;
      case 'MEDIUM':
        return Colors.severityModerate;
      case 'HIGH':
        return Colors.severityHigh;
      case 'EXTREMELY HIGH':
        return '#8B0000'; // Dark Red
      default:
        return Colors.textMuted;
    }
  };

  const toxColor = getToxicityColor(chemicalData.toxicity_level);

  const borderPulse = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(198, 40, 40, 0)', 'rgba(198, 40, 40, 0.8)'],
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              shadowColor: borderPulse,
              shadowOpacity: 1,
              shadowRadius: 10,
              elevation: 10,
              borderWidth: 2,
              borderColor: borderPulse,
            },
          ]}
        >
          {/* Header Banner */}
          <View style={styles.headerBanner}>
            <Text style={styles.headerBannerText}>
              ⚠️ {t('chemical_treatment_warning')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Title & Badge */}
            <View style={styles.titleSection}>
              <Text style={styles.chemicalName}>{chemicalData.chemical_name}</Text>
              <Text style={styles.activeIngredient}>
                {t('active_ingredient')}: {chemicalData.active_ingredient}
              </Text>

              <View style={styles.badgeRow}>
                <View style={[styles.toxBadge, { backgroundColor: toxColor }]}>
                  <Text style={styles.toxBadgeText}>
                    {chemicalData.toxicity_level} {t('toxicity_word')}
                  </Text>
                </View>
                <View style={[styles.toxBadge, { backgroundColor: Colors.border }]}>
                  <Text style={[styles.toxBadgeText, { color: Colors.textPrimary }]}>
                    {chemicalData.who_class}
                  </Text>
                </View>
              </View>
            </View>

            {/* Safety Gear */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛡️ {t('safety_gear')}</Text>
              {chemicalData.safety_gear.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.checkboxRow}
                  activeOpacity={0.7}
                  onPress={() => toggleGear(item)}
                >
                  <View style={[styles.checkbox, gearChecked[item] && styles.checkboxChecked]}>
                    {gearChecked[item] && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Intervals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏳ {t('critical_intervals')}</Text>
              <View style={styles.intervalRow}>
                <Text style={styles.intervalLabel}>{t('phi_label')}</Text>
                <Text style={styles.intervalValue}>
                  {chemicalData.pre_harvest_interval} {t('days_unit')}
                </Text>
              </View>
              <View style={styles.intervalRow}>
                <Text style={styles.intervalLabel}>{t('rei_label_modal')}</Text>
                <Text style={styles.intervalValue}>
                  {chemicalData.reentry_interval} {t('hours_unit')}
                </Text>
              </View>
            </View>

            {/* First Aid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>➕ {t('first_aid')}</Text>
              <Text style={styles.infoText}>
                <Text style={styles.boldText}>{t('skin_contact_label')} </Text>
                {chemicalData.first_aid.skin_contact}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.boldText}>{t('inhaled_label')} </Text>
                {chemicalData.first_aid.if_inhaled}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.boldText}>{t('swallowed_label')} </Text>
                {chemicalData.first_aid.if_swallowed}
              </Text>
            </View>

            {/* Environmental */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌍 {t('environmental_warning')}</Text>
              <Text style={styles.infoText}>
                🐝 {t('danger_bees')}{' '}
                {chemicalData.environmental.bees ? t('yes') : t('no')}
              </Text>
              <Text style={styles.infoText}>
                🐟 {t('danger_fish')}{' '}
                {chemicalData.environmental.fish ? t('yes') : t('no')}
              </Text>
              <Text style={styles.infoText}>
                ☠️ {t('danger_birds')}{' '}
                {chemicalData.environmental.birds ? t('yes') : t('no')}
              </Text>
            </View>

            {/* Emergency */}
            <View style={[styles.section, { borderBottomWidth: 0, marginBottom: Spacing.xl }]}>
              <Text style={styles.sectionTitle}>📞 {t('emergency_contact_title')}</Text>
              <Text style={styles.emergencyText}>
                {t('poison_control')} {chemicalData.emergency_contact}
              </Text>
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>{t('i_understand')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    height: '85%',
    overflow: 'hidden',
    borderColor: 'transparent',
  },
  headerBanner: {
    backgroundColor: Colors.severityHigh, // Red
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBannerText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.lg,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  scrollBody: {
    padding: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing.xl,
  },
  chemicalName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  activeIngredient: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  toxBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  toxBadgeText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.severityLow,
    borderColor: Colors.severityLow,
  },
  checkmark: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: 14,
  },
  checkboxText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  intervalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  intervalLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  intervalValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  emergencyText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.severityHigh,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  confirmBtn: {
    backgroundColor: Colors.severityHigh,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.lg,
  },
});
