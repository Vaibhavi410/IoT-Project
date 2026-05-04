import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import TreatmentCard from '../../components/TreatmentCard';
import { useLanguage } from '../../context/LanguageContext';

import { Colors as COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../../services/apiBaseUrl';

const API_URL = getApiBaseUrl();

export default function TreatmentScreen() {
  const { t } = useLanguage();
  // State to track which tier is expanded (1 is expanded by default)
  const [expandedTier, setExpandedTier] = useState(1);

  // State to track applied treatments
  const [appliedTiers, setAppliedTiers] = useState({});
  const [treatments, setTreatments] = useState([]);

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
          dosage: tr.pesticide?.dosage || '',
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

  const handleToggle = (tierNum) => {
    // If tapping already expanded tier, collapse it; otherwise expand tapped tier
    setExpandedTier(expandedTier === tierNum ? null : tierNum);
  };

  const handleApply = (tierNum) => {
    setAppliedTiers(prev => ({
      ...prev,
      [tierNum]: true
    }));
  };

  // Determine current active tier
  // Lowest tier that hasn't been applied yet. If all applied, it's complete.
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerInfoContainer}>
        <Text style={styles.title}>Treatment Plan</Text>
        <Text style={styles.subtitle}>Target: {treatments[0]?.raw?.pestId?.pestName || '—'}</Text>
        {/* Progress indicator */}
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
        <View style={{ padding: 16 }}>
          <Text style={{ color: COLORS.textSecondary }}>No treatments found</Text>
        </View>
      ) : (
        treatments.map((treatment) => (
          <TreatmentCard
            key={treatment._id || treatment.tier}
            treatment={treatment}
            isExpanded={expandedTier === treatment.tier}
            onToggle={() => handleToggle(treatment.tier)}
            isApplied={!!appliedTiers[treatment.tier]}
            onApply={() => handleApply(treatment.tier)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerInfoContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    elevation: 5,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },
  progressContainer: {
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  progressText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
