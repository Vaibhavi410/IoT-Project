import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import TreatmentCard from '../components/TreatmentCard';
import ToxicityWarningModal from '../components/ToxicityWarningModal';
import { useLanguage } from '../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL =
  (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) ||
  'https://iot-project-a0ho.onrender.com';

// Runtime-loaded treatments (fetched from backend when authenticated)

export default function TreatmentScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [expandedTier, setExpandedTier] = useState(1);
  const [appliedTiers, setAppliedTiers] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingChemicalTier, setPendingChemicalTier] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('pestify_token');
        if (!token) return;
        const resp = await fetch(`${API_URL}/api/treatment/my-treatments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return;
        const body = await resp.json();
        const mapped = (body?.data || []).map((tr, idx) => ({
          _id: tr._id,
          tier: idx + 1,
          type: tr.pesticide?.name ? 'Chemical' : tr.organicAlternative?.name ? 'Organic' : 'Biological',
          name: tr.treatmentName,
          dosage: tr.pesticide?.dosage || tr.dosage || '',
          dilution_ratio: tr.pesticide?.dilution_ratio || '',
          spray_schedule: tr.frequency ? `${tr.frequency.interval || ''} ${tr.frequency.unit || ''}`.trim() : '',
          reentry_interval: tr.pesticide?.reentry_interval || '',
          effectiveness: tr.effectiveness || 0,
          cost: tr.estimatedCost || '',
          raw: tr,
        }));
        if (mounted) setTreatments(mapped);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
            {t('target_label')}: {treatments[0]?.raw?.pestId?.pestName || '—'}
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

        {treatments.length === 0 ? (
          <View style={{ padding: Spacing.md }}>
            <Text style={{ color: Colors.textSecondary }}>No treatments available</Text>
          </View>
        ) : (
          treatments.map((treatment) => (
            <TreatmentCard
              key={treatment._id || treatment.tier}
              treatment={treatment}
              isExpanded={expandedTier === treatment.tier}
              onToggle={() => handleToggle(treatment.tier)}
              isApplied={!!appliedTiers[treatment.tier]}
              onApply={() => {
                if (treatment.type === 'Chemical') {
                  setSelectedTreatment(treatment);
                }
                handleApply(treatment.tier, treatment.type);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Chemical Warning Modal */}
      <ToxicityWarningModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setPendingChemicalTier(null);
        }}
        onConfirm={confirmChemicalUse}
        chemicalData={
          selectedTreatment?.raw?.pesticide || {
            chemical_name: selectedTreatment?.name || '',
            active_ingredient: '',
            toxicity_level: '',
            who_class: '',
            safety_gear: [],
            pre_harvest_interval: 0,
            reentry_interval: 0,
            first_aid: {},
            environmental: {},
            emergency_contact: '',
          }
        }
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
