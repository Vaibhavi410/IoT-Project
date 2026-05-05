import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors as COLORS } from '../../constants/theme';
import { getAdvice } from '../../services/pestAnalysis';

function goBackCompat(navigation) {
  if (navigation?.canGoBack?.()) {
    navigation.goBack();
    return;
  }
  const routeNames = navigation?.getState?.()?.routeNames;
  if (Array.isArray(routeNames) && routeNames.includes('index')) {
    navigation.navigate('index');
    return;
  }
  navigation?.navigate?.('Main');
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return String(Math.min(max, Math.max(min, n)));
}

export default function SoilAnalysisScreen() {
  const navigation = useNavigation();
  const [crop, setCrop] = useState('tomato');
  const [tips, setTips] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getAdvice(crop);
      setTips(data?.tips || []);
    })();
  }, [crop]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBackCompat(navigation)} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Soil Analysis</Text>
          <Text style={styles.headerSub}>Check soil health and get crop recommendations</Text>
        </View>
        <View style={styles.backSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crop-wise Soil Advice</Text>
          <TextInput
            style={styles.input}
            value={crop}
            onChangeText={(v) => setCrop(v.toLowerCase())}
            placeholder="Crop type"
            placeholderTextColor="#8AA08A"
          />
          <Text style={styles.smallText}>
            This module now uses backend AI advice instead of local mock soil datasets.
          </Text>
          {tips.length === 0 ? (
            <Text style={styles.smallText}>No advice available yet.</Text>
          ) : (
            tips.map((tip, i) => (
              <View key={`${tip}-${i}`} style={styles.listRow}>
                <Text style={styles.listIcon}>•</Text>
                <Text style={styles.listText}>{tip}</Text>
              </View>
            ))
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE8D5',
    backgroundColor: COLORS.background,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 72,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  backSpacer: {
    minWidth: 72,
  },
  headerText: {
    flex: 1,
    paddingTop: 2,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1B5E20',
  },
  headerSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#4E6C50',
    textAlign: 'center',
  },
  content: {
    padding: 14,
    paddingBottom: 24,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#DCE8D5',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4E6C50',
  },
  tabTextActive: {
    color: '#1B5E20',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE8D5',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B5E20',
    marginBottom: 10,
  },
  sensorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sensorIcon: {
    fontSize: 18,
  },
  sensorSoonText: {
    color: '#4E6C50',
    fontWeight: '700',
    lineHeight: 19,
  },
  comingSoonBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#ECEFF1',
    borderWidth: 1,
    borderColor: '#D3D8DC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  comingSoonText: {
    color: '#607D8B',
    fontWeight: '900',
    fontSize: 12,
  },
  primaryBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  primaryBtnTextDisabled: {
    color: '#607D8B',
  },
  formRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4E6C50',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C6D8BF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: '800',
    color: '#1B5E20',
    backgroundColor: '#F7FBF6',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#C6D8BF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F7FBF6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontWeight: '900',
    color: '#1B5E20',
  },
  pickerChevron: {
    color: '#4E6C50',
    fontWeight: '900',
  },
  pickerMenu: {
    borderWidth: 1,
    borderColor: '#C6D8BF',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: COLORS.white,
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F0E4',
  },
  pickerOptionText: {
    fontWeight: '800',
    color: '#1B5E20',
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 14,
  },
  sensorGrid: {
    gap: 6,
    marginBottom: 12,
  },
  sensorItem: {
    color: '#1B5E20',
    fontWeight: '800',
  },
  smallText: {
    marginTop: 10,
    color: '#4E6C50',
    fontWeight: '600',
    fontSize: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontWeight: '900',
    color: '#1B5E20',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
  },
  scoreText: {
    fontWeight: '900',
    fontSize: 16,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1B5E20',
  },
  scoreSub: {
    marginTop: 4,
    color: '#4E6C50',
    fontWeight: '600',
    fontSize: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  barLabel: {
    width: 18,
    fontWeight: '900',
    color: '#1B5E20',
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E8F0E4',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  barValue: {
    width: 64,
    textAlign: 'right',
    fontWeight: '800',
    color: '#4E6C50',
    fontSize: 12,
  },
  phRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phText: {
    flex: 1,
    fontWeight: '700',
    color: '#1B5E20',
    lineHeight: 18,
  },
  goodBadge: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#BFD7B8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  goodBadgeText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '900',
    fontSize: 13,
  },
  tooltip: {
    marginTop: 6,
    color: '#4E6C50',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 18,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8F0E4',
  },
  listIcon: {
    width: 22,
    textAlign: 'center',
    fontSize: 14,
  },
  listText: {
    flex: 1,
    color: '#1B5E20',
    fontWeight: '700',
    lineHeight: 19,
  },
});

