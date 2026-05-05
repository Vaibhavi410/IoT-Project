import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as COLORS } from '../../constants/theme';
import { getAdvice } from '../../services/pestAnalysis';

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
  const [crop, setCrop] = useState('Tomato');
  const [latitude, setLatitude] = useState('18.5204');
  const [longitude, setLongitude] = useState('73.8567');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const onRefresh = useCallback(() => {
    loadAdvice();
  }, [crop, latitude, longitude]);

  async function loadAdvice() {
    setRefreshing(true);
    setLoading(true);
    setError('');
    setNow(new Date());
    const data = await getAdvice(crop.trim() || 'crop', latitude.trim(), longitude.trim());
    if (!data) {
      setError('Unable to fetch weather advisory right now.');
      setAdvice(null);
    } else {
      setAdvice(data);
    }
    setRefreshing(false);
    setLoading(false);
  }

  useEffect(() => {
    loadAdvice();
  }, []);

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
          <Text style={styles.cityTitle}>Weather Advisory</Text>
          <Text style={styles.dateTime}>{formatDateTime(now)}</Text>
          <TextInput
            style={styles.input}
            value={crop}
            onChangeText={setCrop}
            placeholder="Crop (e.g. Tomato)"
            placeholderTextColor="#7B8F7B"
          />
          <View style={styles.coordsRow}>
            <TextInput
              style={[styles.input, styles.coordInput]}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="Latitude"
              placeholderTextColor="#7B8F7B"
            />
            <TextInput
              style={[styles.input, styles.coordInput]}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Longitude"
              placeholderTextColor="#7B8F7B"
            />
          </View>
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

        {loading ? (
          <View style={styles.sectionCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.emptyText}>Loading advisory...</Text>
          </View>
        ) : null}
        {!loading && error ? (
          <View style={styles.sectionCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loading && advice?.weather ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Current conditions</Text>
            <Text style={styles.statValue}>Temperature: {advice.weather.temperature_2m}°C</Text>
            <Text style={styles.statValue}>Precipitation: {advice.weather.precipitation} mm</Text>
            <Text style={styles.statValue}>Weather code: {advice.weather.weathercode}</Text>
          </View>
        ) : null}

        {!loading && advice?.tips?.length ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>AI crop advice</Text>
            {advice.tips.map((tip, i) => (
              <View key={`${tip}-${i}`} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{tip}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C6D8BF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  coordsRow: { flexDirection: 'row', gap: 8 },
  coordInput: { flex: 1 },
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
  statValue: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
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
  emptyText: { marginTop: 10, textAlign: 'center', color: COLORS.gray },
  errorText: { textAlign: 'center', color: COLORS.danger, fontWeight: '700' },
});
