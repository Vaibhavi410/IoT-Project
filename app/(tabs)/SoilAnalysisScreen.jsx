import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors as COLORS } from '../../constants/theme';
import { saveScanResult, saveScanResultRemote } from '../../services/historyStorage';

const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Black', 'Red'];

const SENSOR_DATA = {
  ph: 6.8,
  n: 45,
  p: 22,
  k: 180,
  moisture: 68,
  lastUpdated: '2 mins ago',
};

const RESULTS = {
  score: 72,
  label: 'Good Soil Health',
  npk: {
    n: { value: 45, max: 100, label: 'Low', color: COLORS.danger },
    p: { value: 22, max: 100, label: 'Medium', color: COLORS.warning },
    k: { value: 80, max: 100, label: 'Good', color: COLORS.primary },
  },
  ph: {
    value: 6.8,
    text: 'Slightly Acidic — Good for most crops',
  },
  crops: [
    { name: 'Tomato', status: 'good', chip: '✅', why: 'Prefers slightly acidic pH and good moisture.' },
    { name: 'Wheat', status: 'good', chip: '✅', why: 'Tolerates this pH and benefits from balanced K.' },
    { name: 'Cotton', status: 'warn', chip: '⚠️', why: 'Needs improved nitrogen for stronger early growth.' },
    { name: 'Rice', status: 'bad', chip: '❌', why: 'High moisture increases fungal risk; not ideal now.' },
  ],
  fertilizer: [
    { icon: '⚠️', text: 'Add Urea — Nitrogen is low (45 kg/ha)' },
    { icon: '⚠️', text: 'Apply DAP — Phosphorus needs boost' },
    { icon: '✅', text: 'Potassium levels are adequate' },
  ],
  pestRisk: [
    { icon: '🔴', text: 'High moisture → Fungal disease risk' },
    { icon: '🟡', text: 'Low N → Attracts aphids in weak plants' },
  ],
};

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
  const [tab, setTab] = useState('manual'); // manual | sensor
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedWhy, setSelectedWhy] = useState(null);

  const [ph, setPh] = useState('');
  const [n, setN] = useState('');
  const [p, setP] = useState('');
  const [k, setK] = useState('');
  const [moisture, setMoisture] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [soilTypeOpen, setSoilTypeOpen] = useState(false);

  useEffect(() => {
    if (!loading) return undefined;
    const id = setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 2000);
    return () => clearTimeout(id);
  }, [loading]);

  const scoreColor = useMemo(() => COLORS.warning, []);

  function startAnalysis() {
    setSelectedWhy(null);
    setShowResults(false);
    setLoading(true);
  }

  function useSensorData() {
    // Disabled for now (future scope)
  }

  async function handleSaveReport() {
    try {
      const payload = {
        pestName: 'Soil Report',
        confidence: RESULTS.score || null,
        severity: RESULTS.label ? RESULTS.label.split(' ')[0].toLowerCase() : 'medium',
        cropType: RESULTS.crops?.[0]?.name || '',
        imageUrl: null,
        recommendations: RESULTS.fertilizer?.map((f) => f.text) || [],
        notes: RESULTS.pestRisk?.map((p) => p.text).join('; ') || RESULTS.ph?.text || '',
      };

      // Save locally
      await saveScanResult(null, payload);

      // Try remote save (non-blocking)
      saveScanResultRemote(null, payload).then((res) => {
        if (res) {
          Alert.alert('Saved', 'Soil report saved to your account');
        } else {
          Alert.alert('Saved', 'Soil report saved locally');
        }
      }).catch(() => {
        Alert.alert('Saved', 'Soil report saved locally');
      });
    } catch (e) {
      console.warn('Save soil report failed', e);
      Alert.alert('Error', 'Failed to save soil report');
    }
  }

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
        {/* Tabs */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setTab('manual')}
            style={[styles.tabBtn, tab === 'manual' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === 'manual' && styles.tabTextActive]}>
              Manual Entry
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('sensor')}
            style={[styles.tabBtn, tab === 'sensor' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === 'sensor' && styles.tabTextActive]}>
              Sensor Data
            </Text>
          </Pressable>
        </View>

        {/* Manual form */}
        {tab === 'manual' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Soil Parameters</Text>

            <View style={styles.formRow}>
              <Text style={styles.label}>Soil pH (0–14)</Text>
              <TextInput
                value={ph}
                onChangeText={(v) => setPh(clampNumber(v, 0, 14))}
                keyboardType="numeric"
                placeholder="6.8"
                placeholderTextColor="#8AA08A"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Nitrogen (N) kg/ha</Text>
              <TextInput
                value={n}
                onChangeText={(v) => setN(clampNumber(v, 0, 999))}
                keyboardType="numeric"
                placeholder="45"
                placeholderTextColor="#8AA08A"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Phosphorus (P) kg/ha</Text>
              <TextInput
                value={p}
                onChangeText={(v) => setP(clampNumber(v, 0, 999))}
                keyboardType="numeric"
                placeholder="22"
                placeholderTextColor="#8AA08A"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Potassium (K) kg/ha</Text>
              <TextInput
                value={k}
                onChangeText={(v) => setK(clampNumber(v, 0, 999))}
                keyboardType="numeric"
                placeholder="180"
                placeholderTextColor="#8AA08A"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Moisture %</Text>
              <TextInput
                value={moisture}
                onChangeText={(v) => setMoisture(clampNumber(v, 0, 100))}
                keyboardType="numeric"
                placeholder="68"
                placeholderTextColor="#8AA08A"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Soil Type</Text>
              <Pressable
                onPress={() => setSoilTypeOpen((o) => !o)}
                style={styles.picker}
              >
                <Text style={styles.pickerText}>{soilType}</Text>
                <Text style={styles.pickerChevron}>{soilTypeOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {soilTypeOpen && (
                <View style={styles.pickerMenu}>
                  {SOIL_TYPES.map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        setSoilType(opt);
                        setSoilTypeOpen(false);
                      }}
                      style={styles.pickerOption}
                    >
                      <Text style={styles.pickerOptionText}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Pressable style={styles.primaryBtn} onPress={startAnalysis} disabled={loading}>
              <Text style={styles.primaryBtnText}>Analyse Soil</Text>
            </Pressable>
          </View>
        )}

        {/* Sensor tab */}
        {tab === 'sensor' && (
          <View style={styles.card}>
            <View style={styles.sensorHeaderRow}>
              <Text style={styles.cardTitle}>Sensor Integration</Text>
              <Text style={styles.sensorIcon}>📡</Text>
            </View>

            <Text style={styles.sensorSoonText}>
              IoT sensor connectivity is coming soon.{'\n'}Use manual entry for now.
            </Text>

            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>

            <Pressable style={[styles.primaryBtn, styles.primaryBtnDisabled]} onPress={useSensorData} disabled>
              <Text style={[styles.primaryBtnText, styles.primaryBtnTextDisabled]}>Use Sensor Data</Text>
            </Pressable>

            <Text style={styles.smallText}>Future scope feature</Text>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.card}>
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Analysing soil…</Text>
            </View>
          </View>
        )}

        {/* Results */}
        {showResults && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Soil Health Score</Text>
              <View style={styles.scoreRow}>
                <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                  <Text style={[styles.scoreText, { color: scoreColor }]}>{RESULTS.score}/100</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreLabel}>{RESULTS.label}</Text>
                  <Text style={styles.scoreSub}>Medium score — improve N and manage moisture</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>NPK Status</Text>
              {(['n', 'p', 'k']).map((key) => {
                const item = RESULTS.npk[key];
                const pct = Math.max(0, Math.min(100, (item.value / item.max) * 100));
                return (
                  <View key={key} style={styles.barRow}>
                    <Text style={styles.barLabel}>{key.toUpperCase()}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: item.color }]} />
                    </View>
                    <Text style={styles.barValue}>
                      {item.value}/{item.max}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>pH Status</Text>
              <View style={styles.phRow}>
                <Text style={styles.phText}>
                  pH {RESULTS.ph.value} — {RESULTS.ph.text}
                </Text>
                <View style={styles.goodBadge}>
                  <Text style={styles.goodBadgeText}>Good</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Best Crops for Your Soil</Text>
              <View style={styles.chipsRow}>
                {RESULTS.crops.map((c) => {
                  const bg =
                    c.status === 'good'
                      ? '#E8F5E9'
                      : c.status === 'warn'
                        ? '#FFF3E0'
                        : '#FFEBEE';
                  const border =
                    c.status === 'good'
                      ? '#BFD7B8'
                      : c.status === 'warn'
                        ? '#FFD7B2'
                        : '#F7C9CF';
                  const color =
                    c.status === 'good'
                      ? COLORS.primary
                      : c.status === 'warn'
                        ? COLORS.warning
                        : COLORS.danger;
                  return (
                    <Pressable
                      key={c.name}
                      onPress={() => setSelectedWhy(c.why)}
                      style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
                    >
                      <Text style={[styles.chipText, { color }]}>
                        {c.name} {c.chip}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {!!selectedWhy && <Text style={styles.tooltip}>{selectedWhy}</Text>}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fertilizer Plan</Text>
              {RESULTS.fertilizer.map((r) => (
                <View key={r.text} style={styles.listRow}>
                  <Text style={styles.listIcon}>{r.icon}</Text>
                  <Text style={styles.listText}>{r.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Soil-Based Pest Risk</Text>
              {RESULTS.pestRisk.map((r) => (
                <View key={r.text} style={styles.listRow}>
                  <Text style={styles.listIcon}>{r.icon}</Text>
                  <Text style={styles.listText}>{r.text}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.primaryBtn, { marginBottom: 6 }]}
              onPress={handleSaveReport}
            >
              <Text style={styles.primaryBtnText}>Save Report</Text>
            </Pressable>
          </>
        )}
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

