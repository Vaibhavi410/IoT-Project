import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as COLORS } from '../../constants/theme';

const CITY = 'Pune, Maharashtra';

const CURRENT_WEATHER = {
  temperatureC: 32,
  humidityPct: 85,
  rainfallMm: 12,
  windKmh: 18,
  condition: 'Partly Cloudy',
};

const PEST_RISKS = [
  {
    name: 'Whitefly',
    level: 'HIGH',
    colorKey: 'danger',
    reason: 'High humidity favors rapid spread',
  },
  {
    name: 'Aphids',
    level: 'MEDIUM',
    colorKey: 'warning',
    reason: 'Warm, muggy conditions boost reproduction',
  },
  {
    name: 'Fungal Blight',
    level: 'HIGH',
    colorKey: 'danger',
    reason: 'Moist foliage + incoming rain ideal for spores',
  },
];

const FORECAST_DAYS = [
  { id: 'd0', label: 'Today', emoji: '⛅', tempC: 32, humidityPct: 85 },
  { id: 'd1', label: 'Tomorrow', emoji: '🌤️', tempC: 31, humidityPct: 78 },
  { id: 'd2', label: 'Wed', emoji: '🌧️', tempC: 29, humidityPct: 82 },
  { id: 'd3', label: 'Thu', emoji: '☀️', tempC: 33, humidityPct: 65 },
  { id: 'd4', label: 'Fri', emoji: '⛈️', tempC: 28, humidityPct: 88 },
];

const PRECAUTIONS = [
  'Apply fungicide before expected rainfall',
  'Scout for whitefly early morning',
  'Avoid chemical spray — wind speed too high',
];

const ADVISORY_HIGH_RISK = true;

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

function formatDateTime(d) {
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function WeatherAdvisoryScreen() {
  const navigation = useNavigation();
  const [now, setNow] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNow(new Date());
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const riskBadgeStyle = (colorKey) =>
    colorKey === 'danger' ? styles.badgeHigh : styles.badgeMedium;

  const riskBadgeTextStyle = (colorKey) =>
    colorKey === 'danger' ? styles.badgeTextHigh : styles.badgeTextMedium;

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
        <Text style={styles.toolbarTitle}>Weather</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.locationCard}>
          <Text style={styles.cityTitle}>{CITY}</Text>
          <Text style={styles.dateTime}>{formatDateTime(now)}</Text>
          <Pressable
            style={styles.refreshBtn}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.refreshBtnText}>Refresh</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Current conditions</Text>
          <Text style={styles.conditionMain}>⛅ {CURRENT_WEATHER.condition}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statEmoji}>🌡️</Text>
              <Text style={styles.statLabel}>Temperature</Text>
              <Text style={styles.statValue}>{CURRENT_WEATHER.temperatureC}°C</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statEmoji}>💧</Text>
              <Text style={styles.statLabel}>Humidity</Text>
              <Text style={styles.statValue}>{CURRENT_WEATHER.humidityPct}%</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statEmoji}>🌧️</Text>
              <Text style={styles.statLabel}>Rainfall</Text>
              <Text style={styles.statValue}>{CURRENT_WEATHER.rainfallMm} mm</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statEmoji}>💨</Text>
              <Text style={styles.statLabel}>Wind</Text>
              <Text style={styles.statValue}>{CURRENT_WEATHER.windKmh} km/h</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pest Risk Forecast</Text>
          {PEST_RISKS.map((p, idx) => (
            <View key={p.name} style={[styles.pestRow, idx === 0 && styles.pestRowFirst]}>
              <View style={styles.pestRowTop}>
                <Text style={styles.pestName}>{p.name}</Text>
                <View style={[styles.riskBadge, riskBadgeStyle(p.colorKey)]}>
                  <Text style={[styles.riskBadgeText, riskBadgeTextStyle(p.colorKey)]}>
                    {p.level}
                  </Text>
                </View>
              </View>
              <Text style={styles.pestReason}>{p.reason}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.stripHeading}>5-Day outlook</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastStrip}
        >
          {FORECAST_DAYS.map((day) => {
            const humidAlert = day.humidityPct > 80;
            return (
              <View
                key={day.id}
                style={[styles.dayCard, humidAlert && styles.dayCardHumid]}
              >
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.dayEmoji}>{day.emoji}</Text>
                <Text style={styles.dayTemp}>{day.tempC}°C</Text>
                <Text style={styles.dayHumid}>{day.humidityPct}% RH</Text>
              </View>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.advisoryBanner,
            ADVISORY_HIGH_RISK ? styles.advisoryDanger : styles.advisorySafe,
          ]}
        >
          <Text
            style={[
              styles.advisoryText,
              ADVISORY_HIGH_RISK ? styles.advisoryTextDanger : styles.advisoryTextSafe,
            ]}
          >
            {ADVISORY_HIGH_RISK
              ? '⚠️ Avoid spraying — high wind and rain expected'
              : '✅ Conditions are safe for spraying today'}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{"Today's Precautions"}</Text>
          {PRECAUTIONS.map((tip, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
  },
  toolbarSpacer: {
    minWidth: 72,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 28,
  },
  locationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE8D5',
    marginBottom: 14,
  },
  cityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  dateTime: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  refreshBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE8D5',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  conditionMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 14,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCell: {
    width: '47%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0EDD8',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  pestRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF5EA',
  },
  pestRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  pestRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pestName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeHigh: {
    backgroundColor: COLORS.danger + '22',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  badgeMedium: {
    backgroundColor: COLORS.warning + '22',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextHigh: {
    color: COLORS.danger,
  },
  badgeTextMedium: {
    color: COLORS.warning,
  },
  pestReason: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  stripHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  forecastStrip: {
    paddingBottom: 14,
    gap: 10,
    paddingRight: 8,
  },
  dayCard: {
    width: 104,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0EDD8',
  },
  dayCardHumid: {
    borderColor: COLORS.warning,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  dayEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  dayTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  dayHumid: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  advisoryBanner: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  advisorySafe: {
    backgroundColor: COLORS.primary + '33',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  advisoryDanger: {
    backgroundColor: COLORS.danger + '22',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  advisoryText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  advisoryTextDanger: {
    color: COLORS.danger,
  },
  advisoryTextSafe: {
    color: COLORS.primary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#37474F',
    lineHeight: 20,
  },
});
