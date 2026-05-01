import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StageCard from '../../components/StageCard';
import { Colors as COLORS } from '../../constants/theme';

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Cotton', 'Corn', 'Potato'];

const PREVENTION_SCHEDULE = [
  { id: 'w1', week: 'Week 1', action: 'Apply basal fertilizer + soil treatment' },
  { id: 'w2', week: 'Week 2', action: 'First pest scouting' },
  { id: 'w3', week: 'Week 3', action: 'Apply neem oil spray preventively' },
  { id: 'w4', week: 'Week 4', action: 'Check for aphid colonies on young shoots' },
  { id: 'w6', week: 'Week 6', action: 'Install yellow sticky traps' },
  { id: 'w8', week: 'Week 8', action: 'Apply recommended fungicide' },
  { id: 'w10', week: 'Week 10', action: 'Final pest inspection before harvest' },
];

const TOMATO_PROTOCOL = {
  crop: 'Tomato',
  emoji: '🍅',
  season: 'Kharif / Rabi',
  duration: '95-120 days',
  vulnerableStage: 'Flowering to Fruit Set',
  feature: '',
  prevention_schedule: PREVENTION_SCHEDULE,
  stages: [
    {
      id: 1,
      name: 'Nursery & Transplant',
      days: 'Day 1-20',
      risk: 'green',
      pests: ['Damping-off', 'Thrips'],
      action: 'Use disease-free seedlings and apply neem-based drench once after transplant.',
    },
    {
      id: 2,
      name: 'Vegetative Growth',
      days: 'Day 21-40',
      risk: 'orange',
      pests: ['Leaf miner', 'Aphids'],
      action: 'Install yellow sticky traps and rotate biocontrol spray every 5-7 days.',
    },
    {
      id: 3,
      name: 'Pre-Flowering',
      days: 'Day 41-55',
      risk: 'orange',
      pests: ['Whitefly', 'Jassids'],
      action: 'Scout underside of leaves twice a week and remove heavily infested shoots.',
    },
    {
      id: 4,
      name: 'Flowering & Fruit Set',
      days: 'Day 56-80',
      risk: 'red',
      pests: ['Whitefly', 'Fruit borer'],
      action: 'Follow integrated schedule: pheromone traps + targeted evening spray at threshold.',
    },
    {
      id: 5,
      name: 'Fruit Development',
      days: 'Day 81-120',
      risk: 'green',
      pests: ['Mites', 'Helicoverpa'],
      action: 'Continue monitoring and spray only when ETL is crossed to protect beneficial insects.',
    },
  ],
};

function goBackCompat(navigation) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  const routeNames = navigation.getState?.()?.routeNames;
  if (Array.isArray(routeNames) && routeNames.includes('index')) {
    navigation.navigate('index');
    return;
  }
  navigation.navigate('Main');
}

export default function CropProtocolScreen() {
  const navigation = useNavigation();
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [expandedStageId, setExpandedStageId] = useState(1);
  const [preventionDone, setPreventionDone] = useState({});
  // Keep opacity high so the banner stays readable (0.35 looked “invisible” on many devices).
  const pulseAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 850, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const currentData = useMemo(() => {
    if (selectedCrop === 'Tomato') {
      return TOMATO_PROTOCOL;
    }
    return {
      ...TOMATO_PROTOCOL,
      crop: selectedCrop,
      emoji: '🌱',
    };
  }, [selectedCrop]);

  if (!currentData) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.toolbar}>
          <Pressable
            onPress={() => goBackCompat(navigation)}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.toolbarTitle}>Crop protocol</Text>
          <View style={styles.toolbarSpacer} />
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.cropTitle}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stages = currentData?.stages || [];
  const preventionSchedule = currentData?.prevention_schedule || PREVENTION_SCHEDULE;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.alertBanner, { opacity: pulseAnim }]}>
        <Text style={styles.alertText}>⚠️ Active Whitefly outbreak in Maharashtra</Text>
      </Animated.View>

      <View style={styles.toolbar}>
        <Pressable
          onPress={() => goBackCompat(navigation)}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.toolbarTitle}>Crop protocol</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CROPS.map((crop) => {
            const isSelected = crop === selectedCrop;
            return (
              <Pressable
                key={crop}
                onPress={() => setSelectedCrop(crop)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{crop}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.overviewCard}>
          <Text style={styles.cropTitle}>
            {currentData?.emoji || ''} {currentData?.crop || ''}
          </Text>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Season</Text>
            <Text style={styles.overviewValue}>{currentData?.season || ''}</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Duration</Text>
            <Text style={styles.overviewValue}>{currentData?.duration || ''}</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Most Vulnerable Stage</Text>
            <Text style={styles.overviewValue}>{currentData?.vulnerableStage || ''}</Text>
          </View>
        </View>

        <View style={styles.stepperWrap}>
          {stages?.map((stage, index) => (
            <View key={stage?.id ?? String(index)} style={styles.stageRow}>
              <View style={styles.stepperRail}>
                <View
                  style={[
                    styles.stepDot,
                    expandedStageId === stage?.id && { backgroundColor: COLORS.primary },
                  ]}
                />
                {index !== (stages?.length || 0) - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stageCardWrap}>
                <StageCard
                  stage={stage}
                  isExpanded={expandedStageId === stage?.id}
                  onPress={() =>
                    setExpandedStageId((prev) => (prev === stage?.id ? null : stage?.id))
                  }
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.preventionCard}>
          <Text style={styles.preventionTitle}>Prevention Schedule</Text>
          {preventionSchedule?.map((item, index) => {
            const id = item?.id || String(index);
            const isDone = !!preventionDone?.[id];
            return (
              <Pressable
                key={id}
                onPress={() =>
                  setPreventionDone((prev) => ({ ...prev, [id]: !prev?.[id] }))
                }
                style={[styles.preventionRow, index === 0 && styles.preventionRowFirst]}
              >
                <View style={[styles.checkbox, isDone && styles.checkboxChecked]}>
                  {isDone ? <Text style={styles.checkboxMark}>✓</Text> : null}
                </View>
                <View style={styles.preventionTextWrap}>
                  <Text style={[styles.preventionWeek, isDone && styles.preventionTextDone]}>
                    {item?.week || ''}
                  </Text>
                  <Text style={[styles.preventionAction, isDone && styles.preventionTextDone]}>
                    {item?.action || ''}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  alertBanner: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE8D5',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 72,
  },
  backBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  toolbarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#1B5E20',
  },
  toolbarSpacer: {
    minWidth: 72,
  },
  alertText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 28,
  },
  chipsRow: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C6D8BF',
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: '#2F4F2F',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  overviewCard: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  cropTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#4E6C50',
    flex: 1,
  },
  overviewValue: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  stepperWrap: {
    marginTop: 14,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  stepperRail: {
    width: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9DBF9A',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#BFD7B8',
    marginTop: 4,
  },
  stageCardWrap: {
    flex: 1,
  },
  preventionCard: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  preventionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  preventionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F0E4',
  },
  preventionRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxMark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  preventionTextWrap: {
    flex: 1,
  },
  preventionWeek: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 2,
  },
  preventionAction: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
  preventionTextDone: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
});
