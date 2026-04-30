import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LanguageSelector from '../../components/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? 'Good Morning ??'
      : hour >= 12 && hour < 17
        ? 'Good Afternoon ??'
        : hour >= 17 && hour < 21
          ? 'Good Evening ??'
          : 'Good Night ??';

  const comingSoon = () => Alert.alert(t('coming_soon'));

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollPad}>
        <View style={styles.header}>
          <Text style={styles.greetingText}>{greeting}</Text>

          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.appName}>?? {t('app_name')}</Text>
              <Text style={styles.tagline}>{t('tagline')}</Text>
            </View>
            <TouchableOpacity
              style={styles.globeBtn}
              onPress={() => setLangOpen(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Language"
            >
              <Text style={styles.globeText}>??</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient colors={['#1B5E20', '#2E7D32', '#43A047']} style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Protect Your Harvest</Text>
              <Text style={styles.heroSubtitle}>
                AI-powered pest detection for smarter farming
              </Text>
              <TouchableOpacity
                style={styles.scanNowButton}
                onPress={() => router.push('/(tabs)/PestIdentificationScreen')}
              >
                <Text style={styles.scanNowButtonText}>Scan Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroEmoji}>????</Text>
            </View>
          </LinearGradient>

          <View style={styles.statsRow}>
            <View style={[styles.statMiniCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.statMiniIcon}>??</Text>
              <Text style={styles.statMiniValue}>12 Scans</Text>
            </View>
            <View style={[styles.statMiniCard, { backgroundColor: '#DCEED8' }]}>
              <Text style={styles.statMiniIcon}>?</Text>
              <Text style={styles.statMiniValue}>8 Resolved</Text>
            </View>
            <View style={[styles.statMiniCard, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.statMiniIcon}>?</Text>
              <Text style={styles.statMiniValue}>4 Ongoing</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Features</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#FFF8E1' }]}
              onPress={() => router.push('/(tabs)/PestIdentificationScreen')}
            >
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Pest Identification</Text>
              <Text style={styles.cardSubtitle}>Take photo or upload to identify pests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#F3E5F5' }]}
              onPress={() => router.push('/(tabs)/SoilAnalysisScreen')}
            >
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Soil Analysis</Text>
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
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Treatment Plan</Text>
              <Text style={styles.cardSubtitle}>{t('treatment_sub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/CropProtocolScreen')}
            >
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Crop Protocol</Text>
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
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Pest Timeline</Text>
              <Text style={styles.cardSubtitle}>Track pest activity on your farm over time</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E3F2FD' }]}
              onPress={() => router.push('/(tabs)/WeatherAdvisoryScreen')}
            >
              <Text style={styles.cardIcon}>???</Text>
              <Text style={styles.cardTitle}>??? Weather Advisory</Text>
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
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? PDF Reports</Text>
              <Text style={styles.cardSubtitle}>Auto-generate pest analysis PDF report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/LanguageScreen')}
            >
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Language Support</Text>
              <Text style={styles.cardSubtitle}>Switch app language</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/VoiceAssistantScreen')}
            >
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Voice Assistant</Text>
              <Text style={styles.cardSubtitle}>{t('voice_assistant_sub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/(tabs)/LowBandwidthScreen')}
            >
              <Text style={styles.cardIcon}>??</Text>
              <Text style={styles.cardTitle}>?? Low Bandwidth Mode</Text>
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
  greetingText: {
    color: '#E8F5E9',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
  heroCard: {
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 34,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
  heroSubtitle: {
    color: '#E8F5E9',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  scanNowButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  scanNowButtonText: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  statMiniCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statMiniIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statMiniValue: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '800',
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
});
