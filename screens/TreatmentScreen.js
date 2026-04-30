import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import TreatmentCard from '../components/TreatmentCard';
import ToxicityWarningModal from '../components/ToxicityWarningModal';
import { useLanguage } from '../context/LanguageContext';

// Dummy data for testing
const pestData = {
  pest_name: "Aphid",
  treatments: [
    {
      tier: 1,
      type: "Organic",
      name: "Neem Oil Spray",
      dosage: "5ml per litre of water",
      dilution_ratio: "1:200",
      spray_schedule: "Every 3 days for 2 weeks",
      reentry_interval: "4 hours",
      effectiveness: 65,
      cost: "Low"
    },
    {
      tier: 2,
      type: "Biological",
      name: "Ladybug Introduction + Beauveria bassiana",
      dosage: "2g per litre of water",
      dilution_ratio: "1:500",
      spray_schedule: "Once a week for 3 weeks",
      reentry_interval: "2 hours",
      effectiveness: 78,
      cost: "Medium"
    },
    {
      tier: 3,
      type: "Chemical",
      name: "Imidacloprid 17.8% SL",
      dosage: "0.3ml per litre of water",
      dilution_ratio: "1:3333",
      spray_schedule: "Once, repeat after 15 days if needed",
      reentry_interval: "48 hours",
      effectiveness: 95,
      cost: "Medium"
    }
  ]
};

// Dummy toxicity data
const dummyToxicityData = {
  chemical_name: "Imidacloprid 17.8% SL",
  active_ingredient: "Imidacloprid",
  toxicity_level: "HIGH",
  who_class: "Class II - Moderately Hazardous",
  safety_gear: ["Gloves", "Mask", "Goggles", "Full body suit"],
  pre_harvest_interval: 21,
  reentry_interval: 48,
  first_aid: {
    skin_contact: "Remove contaminated clothing. Wash skin thoroughly with soap and water.",
    if_inhaled: "Move to fresh air immediately. If breathing is difficult, seek medical help.",
    if_swallowed: "Do NOT induce vomiting. Call poison control immediately."
  },
  environmental: {
    bees: true,
    fish: true,
    birds: false
  },
  emergency_contact: "1800-180-1551"
};

export default function TreatmentScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [expandedTier, setExpandedTier] = useState(1);
  const [appliedTiers, setAppliedTiers] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingChemicalTier, setPendingChemicalTier] = useState(null);

  const handleToggle = (tierNum) => {
    setExpandedTier(expandedTier === tierNum ? null : tierNum);
  };

  const handleApply = (tierNum, type) => {
    if (type === 'Chemical') {
      setPendingChemicalTier(tierNum);
      setModalVisible(true);
    } else {
      markAsApplied(tierNum);
    }
  };

  const confirmChemicalUse = () => {
    if (pendingChemicalTier) {
      markAsApplied(pendingChemicalTier);
    }
    setModalVisible(false);
    setPendingChemicalTier(null);
  };

  const markAsApplied = (tierNum) => {
    setAppliedTiers(prev => ({
      ...prev,
      [tierNum]: true
    }));
  };

  let currentTier = 1;
  const tiersCount = pestData.treatments.length;
  for (let i = 1; i <= tiersCount; i++) {
    if (!appliedTiers[i]) {
      currentTier = i;
      break;
    }
    if (i === tiersCount) {
      currentTier = 'Complete';
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('treatment'),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}
        >
          <Text
            style={{
              fontSize: Typography.sizes.md,
              color: Colors.white,
              fontWeight: Typography.weights.medium,
            }}
          >
            ‹ {t('back')}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, t]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerInfoContainer}>
          <Text style={styles.title}>{t('treatment')}</Text>
          <Text style={styles.subtitle}>
            {t('target_label')}: {pestData.pest_name}
          </Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {t('progress_label')}:{' '}
              {currentTier === 'Complete'
                ? t('all_treatments_applied')
                : `${t('currently_on_tier')} ${currentTier}`}
            </Text>
          </View>
        </View>

        {pestData.treatments.map((treatment) => (
          <TreatmentCard
            key={treatment.tier}
            treatment={treatment}
            isExpanded={expandedTier === treatment.tier}
            onToggle={() => handleToggle(treatment.tier)}
            isApplied={!!appliedTiers[treatment.tier]}
            onApply={() => handleApply(treatment.tier, treatment.type)}
          />
        ))}
      </ScrollView>

      {/* Chemical Warning Modal */}
      <ToxicityWarningModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setPendingChemicalTier(null);
        }}
        onConfirm={confirmChemicalUse}
        chemicalData={dummyToxicityData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  headerInfoContainer: {
    marginBottom: Spacing.xxl,
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
  },
});
