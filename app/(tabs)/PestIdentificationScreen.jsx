import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Colors as COLORS } from '../../constants/theme';

const DUMMY_RESULT = {
  pestName: 'Whitefly (Bemisia tabaci)',
  confidence: '94% Match',
  severity: 'High Risk 🔴',
  crop: 'Tomato',
  description:
    'Whitefly colonies found on leaf undersides.\nRapid reproduction in humid conditions.',
};

const TREATMENTS = [
  { tier: 1, type: 'Organic', name: 'Neem oil spray', dosage: '5ml per litre' },
  { tier: 2, type: 'Bio', name: 'Beauveria bassiana fungal spray', dosage: '' },
  { tier: 3, type: 'Chemical', name: 'Imidacloprid 17.8% SL', dosage: '' },
];

const RECENT_SCANS = [
  { title: 'Aphids on Cotton - April 28', status: 'Resolved' },
  { title: 'Fungal Blight on Wheat - April 25', status: 'Ongoing' },
  { title: 'Spider Mites on Tomato - April 20', status: 'Resolved' },
];

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

export default function PestIdentificationScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | analyzing | done
  const [dots, setDots] = useState('');
  const [appliedTiers, setAppliedTiers] = useState({});

  const pulseAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (phase !== 'analyzing') return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulseAnim]);

  useEffect(() => {
    if (phase !== 'analyzing') return undefined;
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 350);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'analyzing') return undefined;
    const id = setTimeout(() => {
      setPhase('done');
    }, 3000);
    return () => clearTimeout(id);
  }, [phase]);

  const isReadyForResults = phase === 'done' && !!imageUri;

  const previewSource = useMemo(() => {
    if (!imageUri) return null;
    return { uri: imageUri };
  }, [imageUri]);

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Camera permission required', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
      setAppliedTiers({});
      setPhase('analyzing');
    }
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Gallery permission required', 'Please allow gallery access to upload an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
      setAppliedTiers({});
      setPhase('analyzing');
    }
  }

  function scanAgain() {
    setImageUri(null);
    setAppliedTiers({});
    setPhase('idle');
    setDots('');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => goBackCompat(navigation)} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Pest Identification</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Camera / Upload */}
        <View style={styles.card}>
          <View style={styles.previewFrame}>
            {previewSource ? (
              <Image source={previewSource} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewPlaceholderText}>Camera Preview</Text>
              </View>
            )}
          </View>

          <Text style={styles.hint}>Point camera at affected crop or pest</Text>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={pickFromCamera}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>📷 Take Photo</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={pickFromGallery}>
              <Text style={styles.btnText}>🖼️ Upload from Gallery</Text>
            </Pressable>
          </View>
        </View>

        {/* Loading */}
        {phase === 'analyzing' && (
          <View style={styles.card}>
            <View style={styles.loadingRow}>
              <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.loadingTextWrap}>
                <Text style={styles.loadingTitle}>Analyzing pest{dots}</Text>
                <Text style={styles.loadingSub}>Please wait while we run AI detection</Text>
              </View>
            </View>
          </View>
        )}

        {/* Results */}
        {isReadyForResults && (
          <View style={styles.card}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{DUMMY_RESULT.pestName}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{DUMMY_RESULT.confidence}</Text>
              </View>
            </View>

            <View style={styles.resultMediaRow}>
              <Image source={previewSource} style={styles.resultImage} resizeMode="cover" />
              <View style={styles.resultBadges}>
                <View style={styles.severityBadge}>
                  <Text style={styles.severityText}>{DUMMY_RESULT.severity}</Text>
                </View>
                <View style={styles.cropBadge}>
                  <Text style={styles.cropText}>Affected crop: {DUMMY_RESULT.crop}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.desc}>{DUMMY_RESULT.description}</Text>
          </View>
        )}

        {/* Treatments */}
        {isReadyForResults && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recommended Treatment</Text>

            {TREATMENTS.map((tr) => {
              const isApplied = !!appliedTiers[tr.tier];
              return (
                <View key={tr.tier} style={styles.treatmentCard}>
                  <View style={styles.treatmentLeft}>
                    <View style={styles.tierBadge}>
                      <Text style={styles.tierText}>Tier {tr.tier}</Text>
                    </View>
                    <Text style={styles.treatmentName}>
                      ({tr.type}) {tr.name}
                    </Text>
                    {!!tr.dosage && <Text style={styles.treatmentDose}>{tr.dosage}</Text>}
                  </View>

                  <Pressable
                    style={[styles.applyBtn, isApplied && styles.applyBtnApplied]}
                    onPress={() => setAppliedTiers((p) => ({ ...p, [tr.tier]: !p[tr.tier] }))}
                  >
                    <Text style={[styles.applyText, isApplied && styles.applyTextApplied]}>
                      {isApplied ? 'Applied' : 'Apply'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* Actions */}
        {isReadyForResults && (
          <View style={styles.actionsWrap}>
            <Pressable
              style={[styles.actionBtn, styles.actionPrimary]}
              onPress={() => Alert.alert('Report', 'Dummy report generated.')}
            >
              <Text style={[styles.actionText, styles.actionTextPrimary]}>📄 Generate Report</Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, styles.actionOutline]}
              onPress={() => navigation.navigate?.('Treatment')}
            >
              <Text style={[styles.actionText, styles.actionTextOutline]}>
                💊 View Full Treatment Plan
              </Text>
            </Pressable>

            <Pressable style={[styles.actionBtn, styles.actionGrey]} onPress={scanAgain}>
              <Text style={styles.actionText}>🔄 Scan Again</Text>
            </Pressable>
          </View>
        )}

        {/* History */}
        {isReadyForResults && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            {RECENT_SCANS.map((item) => (
              <View key={item.title} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                </View>
                <View
                  style={[
                    styles.historyStatus,
                    item.status === 'Resolved' ? styles.statusResolved : styles.statusOngoing,
                  ]}
                >
                  <Text style={styles.historyStatusText}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 28 }} />
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE8D5',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 70,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: '#1B5E20',
  },
  toolbarSpacer: {
    minWidth: 70,
  },
  content: {
    padding: 14,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE8D5',
    marginBottom: 12,
  },
  previewFrame: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EAF4EA',
    height: 220,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholderText: {
    color: '#4E6C50',
    fontWeight: '700',
  },
  hint: {
    marginTop: 10,
    color: '#4E6C50',
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnSecondary: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C6D8BF',
  },
  btnText: {
    fontWeight: '800',
    color: '#1B5E20',
    fontSize: 13,
  },
  btnTextPrimary: {
    color: COLORS.white,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  loadingTextWrap: {
    flex: 1,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B5E20',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#4E6C50',
    fontWeight: '600',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  resultTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#1B5E20',
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#BFD7B8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confidenceText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 12,
  },
  resultMediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  resultImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#EAF4EA',
  },
  resultBadges: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  severityBadge: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F7C9CF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  severityText: {
    color: COLORS.danger,
    fontWeight: '900',
    fontSize: 13,
  },
  cropBadge: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#C9E0F8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cropText: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 13,
  },
  desc: {
    marginTop: 12,
    color: '#2F4F2F',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B5E20',
    marginBottom: 10,
  },
  treatmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F0E4',
    gap: 10,
  },
  treatmentLeft: {
    flex: 1,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#C6D8BF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1B5E20',
  },
  treatmentName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1B5E20',
  },
  treatmentDose: {
    marginTop: 4,
    fontSize: 13,
    color: '#4E6C50',
    fontWeight: '700',
  },
  applyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnApplied: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#BFD7B8',
  },
  applyText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
  },
  applyTextApplied: {
    color: COLORS.primary,
  },
  actionsWrap: {
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionOutline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  actionGrey: {
    backgroundColor: '#E8F0E4',
  },
  actionText: {
    fontWeight: '900',
    fontSize: 14,
    color: '#1B5E20',
  },
  actionTextPrimary: {
    color: COLORS.white,
  },
  actionTextOutline: {
    color: COLORS.primary,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F0E4',
    gap: 10,
  },
  historyLeft: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B5E20',
  },
  historyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusResolved: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#BFD7B8',
  },
  statusOngoing: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFD7B2',
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1B5E20',
  },
});

