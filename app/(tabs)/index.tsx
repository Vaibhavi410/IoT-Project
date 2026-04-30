import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LanguageSelector from '../../components/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const comingSoon = () => Alert.alert(t('coming_soon'));

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollPad}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.appName}>🌿 {t('app_name')}</Text>
              <Text style={styles.tagline}>{t('tagline')}</Text>
            </View>
            <TouchableOpacity
              style={styles.globeBtn}
              onPress={() => setLangOpen(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Language"
            >
              <Text style={styles.globeText}>🌐</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Features</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#FFF8E1' }]}
              onPress={() => router.push('/(tabs)/PestIdentificationScreen')}
            >
              <Text style={styles.cardIcon}>📷</Text>
              <Text style={styles.cardTitle}>📷 Pest Identification</Text>
              <Text style={styles.cardSubtitle}>Take photo or upload to identify pests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#F3E5F5' }]}
              onPress={() => router.push('/(tabs)/SoilAnalysisScreen')}
            >
              <Text style={styles.cardIcon}>🪱</Text>
              <Text style={styles.cardTitle}>🪱 Soil Analysis</Text>
              <Text style={styles.cardSubtitle}>Manual entry or IoT sensor readings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treatment &amp; Protocol</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/TreatmentScreen')}
            >
              <Text style={styles.cardIcon}>💊</Text>
              <Text style={styles.cardTitle}>💊 Treatment Plan</Text>
              <Text style={styles.cardSubtitle}>{t('treatment_sub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/CropProtocolScreen')}
            >
              <Text style={styles.cardIcon}>🌾</Text>
              <Text style={styles.cardTitle}>🌾 Crop Protocol</Text>
              <Text style={styles.cardSubtitle}>Stages, risks, and prevention schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoring</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#F1F8E9' }]}
              onPress={() => router.push('/(tabs)/PestTimelineScreen')}
            >
              <Text style={styles.cardIcon}>📅</Text>
              <Text style={styles.cardTitle}>📅 Pest Timeline</Text>
              <Text style={styles.cardSubtitle}>Track pest activity on your farm over time</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E3F2FD' }]}
              onPress={() => router.push('/(tabs)/WeatherAdvisoryScreen')}
            >
              <Text style={styles.cardIcon}>🌦️</Text>
              <Text style={styles.cardTitle}>🌦️ Weather Advisory</Text>
              <Text style={styles.cardSubtitle}>Pest risk forecast and spraying guidance</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports &amp; Tools</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#FFFDE7' }]}
              onPress={() => router.push('/(tabs)/PDFReportScreen')}
            >
              <Text style={styles.cardIcon}>📄</Text>
              <Text style={styles.cardTitle}>📄 PDF Reports</Text>
              <Text style={styles.cardSubtitle}>Auto-generate pest analysis PDF report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/LanguageScreen')}
            >
              <Text style={styles.cardIcon}>🌐</Text>
              <Text style={styles.cardTitle}>🌐 Language Support</Text>
              <Text style={styles.cardSubtitle}>Switch app language</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/VoiceAssistantScreen')}
            >
              <Text style={styles.cardIcon}>🎤</Text>
              <Text style={styles.cardTitle}>🎤 Voice Assistant</Text>
              <Text style={styles.cardSubtitle}>{t('voice_assistant_sub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/LowBandwidthScreen')}
            >
              <Text style={styles.cardIcon}>📶</Text>
              <Text style={styles.cardTitle}>📶 Low Bandwidth Mode</Text>
              <Text style={styles.cardSubtitle}>Optimize app usage for 2G and slow networks</Text>
            </TouchableOpacity>
          </View>
        </View>

        <LanguageSelector visible={langOpen} onClose={() => setLangOpen(false)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  scrollPad: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 10,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#2E7D32',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  globeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeText: {
    fontSize: 22,
  },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 14,
    color: '#C8E6C9',
    marginTop: 6,
  },
  grid: {
    gap: 12,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 32 : 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  fabEmoji: {
    fontSize: 28,
  },
});

