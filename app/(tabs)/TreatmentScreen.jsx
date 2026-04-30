import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import TreatmentCard from '../../components/TreatmentCard';
import { COLORS } from '../../constants/colors';

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

export default function TreatmentScreen() {
  // State to track which tier is expanded (1 is expanded by default)
  const [expandedTier, setExpandedTier] = useState(1);

  // State to track applied treatments
  const [appliedTiers, setAppliedTiers] = useState({});

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
        <Text style={styles.subtitle}>Target: {pestData.pest_name}</Text>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {currentTier === 'Complete' ? 'All Treatments Applied' : `Currently on Tier ${currentTier}`}
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
          onApply={() => handleApply(treatment.tier)}
        />
      ))}
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
