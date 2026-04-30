import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

const REPORT_TYPES = [
  {
    id: 'weekly',
    title: 'Weekly Summary',
    subtitle: 'Last 7 days of pest activity',
  },
  {
    id: 'monthly',
    title: 'Monthly Report',
    subtitle: 'Full month analysis',
  },
  {
    id: 'custom',
    title: 'Custom Range',
    subtitle: 'Select start and end date',
  },
];

const CUSTOM_RANGE_DUMMY = {
  start: 'April 10, 2026',
  end: 'April 22, 2026',
};

const PREVIEW_BY_TYPE = {
  weekly: {
    dateRange: 'April 24 - April 30, 2026',
    farmName: "Vaibhavi's Farm",
    totalPests: 6,
    resolved: 4,
    ongoing: 2,
    topCrop: 'Cotton',
    treatments: 5,
  },
  monthly: {
    dateRange: 'April 1 - April 30, 2026',
    farmName: "Vaibhavi's Farm",
    totalPests: 6,
    resolved: 4,
    ongoing: 2,
    topCrop: 'Cotton',
    treatments: 5,
  },
  custom: {
    dateRange: 'April 10 - April 22, 2026',
    farmName: "Vaibhavi's Farm",
    totalPests: 6,
    resolved: 4,
    ongoing: 2,
    topCrop: 'Cotton',
    treatments: 5,
  },
};

const PREVIOUS_REPORTS = [
  {
    id: 'r1',
    name: 'March 2026 Report',
    generatedOn: 'Generated April 1',
    size: '245 KB',
  },
  {
    id: 'r2',
    name: 'Week 3 April Report',
    generatedOn: 'Generated April 21',
    size: '198 KB',
  },
  {
    id: 'r3',
    name: 'Week 2 April Report',
    generatedOn: 'Generated April 14',
    size: '312 KB',
  },
];

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

export default function PDFReportScreen() {
  const navigation = useNavigation();
  const [reportType, setReportType] = useState('monthly');
  const [generating, setGenerating] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const preview = useMemo(() => PREVIEW_BY_TYPE[reportType], [reportType]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setSuccessVisible(true);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => goBackCompat(navigation)} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.toolbarTitle}>Reports</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Generate Report</Text>
        <Text style={styles.pageSubtitle}>Auto-generate pest analysis PDF report</Text>

        <Text style={styles.sectionHeading}>Report type</Text>
        {REPORT_TYPES.map((t) => {
          const selected = reportType === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setReportType(t.id)}
              style={[styles.typeCard, selected && styles.typeCardSelected]}
            >
              {selected ? (
                <View style={styles.checkWrap}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              ) : null}
              <Text style={styles.typeTitle}>{t.title}</Text>
              <Text style={styles.typeSub}>{t.subtitle}</Text>
            </Pressable>
          );
        })}

        {reportType === 'custom' ? (
          <View style={styles.customBox}>
            <Text style={styles.customLabel}>Selected range (demo)</Text>
            <Text style={styles.customLine}>Start: {CUSTOM_RANGE_DUMMY.start}</Text>
            <Text style={styles.customLine}>End: {CUSTOM_RANGE_DUMMY.end}</Text>
          </View>
        ) : null}

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Report preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Farm name</Text>
            <Text style={styles.previewVal}>{preview.farmName}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Date range</Text>
            <Text style={styles.previewVal}>{preview.dateRange}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Total pests detected</Text>
            <Text style={styles.previewVal}>{preview.totalPests}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Resolved cases</Text>
            <Text style={styles.previewVal}>{preview.resolved}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Ongoing cases</Text>
            <Text style={styles.previewVal}>{preview.ongoing}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Most affected crop</Text>
            <Text style={styles.previewVal}>{preview.topCrop}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Treatments applied</Text>
            <Text style={styles.previewVal}>{preview.treatments}</Text>
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={generating}
            activeOpacity={0.85}
          >
            <Text style={styles.generateBtnText}>Generate PDF</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>Previous Reports</Text>
        {PREVIOUS_REPORTS.map((r) => (
          <View key={r.id} style={styles.listCard}>
            <View style={styles.listMain}>
              <Text style={styles.listName}>{r.name}</Text>
              <Text style={styles.listDate}>{r.generatedOn}</Text>
              <Text style={styles.listSize}>{r.size}</Text>
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => Alert.alert('Download', `Downloading "${r.name}" (${r.size})`)}
                hitSlop={8}
              >
                <Text style={styles.iconBtnText}>⬇️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => Alert.alert('Share', `Sharing "${r.name}"`)}
                hitSlop={8}
              >
                <Text style={styles.iconBtnText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {generating ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Building your PDF…</Text>
        </View>
      ) : null}

      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>✅ Report Generated!</Text>
            <Text style={styles.successSub}>Your report is ready to download</Text>
            <TouchableOpacity
              style={styles.successPrimary}
              onPress={() => Alert.alert('Download', 'Report saved to Downloads (demo)')}
            >
              <Text style={styles.successPrimaryText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.successSecondary}
              onPress={() => Alert.alert('Share', 'Opening share sheet (demo)')}
            >
              <Text style={styles.successSecondaryText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.successClose} onPress={() => setSuccessVisible(false)}>
              <Text style={styles.successCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#DCE8D5',
    backgroundColor: COLORS.background,
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
  scroll: {
    padding: 16,
    paddingBottom: 28,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  typeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0EDD8',
    position: 'relative',
  },
  typeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  checkWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  typeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    paddingRight: 36,
  },
  typeSub: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 6,
    lineHeight: 18,
  },
  customBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  customLine: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  previewKey: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
  },
  previewVal: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  generateBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateBtnDisabled: {
    opacity: 0.75,
  },
  generateBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  listMain: {
    flex: 1,
    paddingRight: 8,
  },
  listName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  listDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  listSize: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  iconBtnText: {
    fontSize: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(241,248,233,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  successPrimary: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  successPrimaryText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  successSecondary: {
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  successSecondaryText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  successClose: {
    paddingVertical: 10,
    marginTop: 4,
  },
  successCloseText: {
    color: COLORS.gray,
    fontWeight: '700',
    fontSize: 15,
  },
});
