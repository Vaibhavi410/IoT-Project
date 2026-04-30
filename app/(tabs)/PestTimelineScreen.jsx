import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeMode } from '../../context/ThemeModeContext';

const FIELDS = [
  { id: 'A', label: 'Field A' },
  { id: 'B', label: 'Field B' },
  { id: 'C', label: 'Field C' },
];

const FILTER_OPTIONS = ['All', 'Resolved', 'Ongoing'];

const CROP_OPTIONS = ['Wheat', 'Rice', 'Tomato', 'Cotton'];

const SEVERITY_ORDER = ['Low', 'Medium', 'High', 'Critical'];

const GLOBAL_SUMMARY = {
  totalScans: 6,
  resolved: 4,
  ongoing: 2,
  mostCommonPest: 'Aphids',
};

const DUMMY_ENTRIES = [
  {
    id: 'e1',
    fieldId: 'A',
    dateLabel: 'April 20, 2026',
    pestName: 'Whitefly',
    emoji: '🦟',
    severity: 'High',
    crop: 'Cotton',
    treatment: 'Imidacloprid schedule + yellow traps',
    status: 'Resolved',
  },
  {
    id: 'e2',
    fieldId: 'A',
    dateLabel: 'April 15, 2026',
    pestName: 'Aphids',
    emoji: '🐜',
    severity: 'Medium',
    crop: 'Tomato',
    treatment: 'Neem oil spray (organic tier)',
    status: 'Resolved',
  },
  {
    id: 'e3',
    fieldId: 'B',
    dateLabel: 'April 12, 2026',
    pestName: 'Aphids',
    emoji: '🐜',
    severity: 'Low',
    crop: 'Wheat',
    treatment: 'Insecticidal soap foliar wash',
    status: 'Resolved',
  },
  {
    id: 'e4',
    fieldId: 'B',
    dateLabel: 'April 8, 2026',
    pestName: 'Fruit Borer',
    emoji: '🐛',
    severity: 'Critical',
    crop: 'Tomato',
    treatment: 'Bt spray + pheromone traps',
    status: 'Ongoing',
  },
  {
    id: 'e5',
    fieldId: 'C',
    dateLabel: 'April 5, 2026',
    pestName: 'Jassids',
    emoji: '🪲',
    severity: 'Medium',
    crop: 'Rice',
    treatment: 'Neem-based botanical spray',
    status: 'Resolved',
  },
  {
    id: 'e6',
    fieldId: 'A',
    dateLabel: 'April 1, 2026',
    pestName: 'Aphids',
    emoji: '🐜',
    severity: 'High',
    crop: 'Cotton',
    treatment: 'Systemic soil drench',
    status: 'Ongoing',
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

function severityColors(sev) {
  switch (sev) {
    case 'Low':
      return { bg: COLORS.primary + '22', border: COLORS.primary, text: COLORS.primary };
    case 'Medium':
      return { bg: COLORS.warning + '22', border: COLORS.warning, text: COLORS.warning };
    case 'High':
      return { bg: COLORS.danger + '22', border: COLORS.danger, text: COLORS.danger };
    case 'Critical':
      return { bg: COLORS.danger + '33', border: COLORS.danger, text: COLORS.danger };
    default:
      return { bg: '#EEE', border: COLORS.gray, text: COLORS.gray };
  }
}

export default function PestTimelineScreen() {
  const navigation = useNavigation();
  const [selectedField, setSelectedField] = useState('A');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [formPest, setFormPest] = useState('');
  const [formSeverity, setFormSeverity] = useState('Medium');
  const [formCrop, setFormCrop] = useState('Tomato');
  const [formTreatment, setFormTreatment] = useState('');

  const filtered = useMemo(() => {
    return DUMMY_ENTRIES.filter((e) => {
      if (e.fieldId !== selectedField) return false;
      if (filterStatus === 'All') return true;
      return e.status === filterStatus;
    });
  }, [selectedField, filterStatus]);

  const openModal = () => {
    setFormPest('');
    setFormSeverity('Medium');
    setFormCrop('Tomato');
    setFormTreatment('');
    setModalOpen(true);
  };

  const saveEntry = () => {
    setModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => goBackCompat(navigation)} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <View style={styles.toolbarCenter}>
          <Text style={styles.toolbarTitle} numberOfLines={1}>
            Timeline
          </Text>
        </View>
        <View style={styles.toolbarSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Pest Timeline Tracker</Text>
        <Text style={styles.pageSubtitle}>Track pest activity on your farm over time</Text>

        <Text style={styles.sectionLabel}>Field</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fieldChipsRow}
        >
          {FIELDS.map((f) => {
            const on = f.id === selectedField;
            return (
              <Pressable
                key={f.id}
                onPress={() => setSelectedField(f.id)}
                style={[styles.fieldChip, on && styles.fieldChipOn]}
              >
                <Text style={[styles.fieldChipText, on && styles.fieldChipTextOn]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{GLOBAL_SUMMARY.totalScans}</Text>
            <Text style={styles.statLab}>Total Scans</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{GLOBAL_SUMMARY.resolved}</Text>
            <Text style={styles.statLab}>Resolved</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{GLOBAL_SUMMARY.ongoing}</Text>
            <Text style={styles.statLab}>Ongoing</Text>
          </View>
          <View style={[styles.statCell, styles.statCellWide]}>
            <Text style={styles.statValSmall} numberOfLines={1}>
              {GLOBAL_SUMMARY.mostCommonPest}
            </Text>
            <Text style={styles.statLab}>Most Common Pest</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Filter</Text>
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((opt) => {
            const on = filterStatus === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setFilterStatus(opt)}
                style={[styles.filterChip, on && styles.filterChipOn]}
              >
                <Text style={[styles.filterChipText, on && styles.filterChipTextOn]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Timeline</Text>
        <View style={styles.timelineBlock}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No events for this field and filter.</Text>
          ) : (
            filtered.map((ev, index) => {
              const sev = severityColors(ev.severity);
              const last = index === filtered.length - 1;
              return (
                <View key={ev.id} style={styles.timelineRow}>
                  <View style={styles.rail}>
                    <View style={[styles.railDot, { borderColor: COLORS.primary }]} />
                    {!last && <View style={styles.railLine} />}
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardDate}>{ev.dateLabel}</Text>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardPestTitle}>
                        {ev.emoji} {ev.pestName}
                      </Text>
                      <View style={[styles.sevBadge, { borderColor: sev.border, backgroundColor: sev.bg }]}>
                        <Text style={[styles.sevBadgeText, { color: sev.text }]}>{ev.severity}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardMeta}>
                      <Text style={styles.cardMetaBold}>Crop: </Text>
                      {ev.crop}
                    </Text>
                    <Text style={styles.cardMeta}>
                      <Text style={styles.cardMetaBold}>Treatment: </Text>
                      {ev.treatment}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        ev.status === 'Resolved' ? styles.statusResolved : styles.statusOngoing,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          ev.status === 'Resolved' ? styles.statusResolvedText : styles.statusOngoingText,
                        ]}
                      >
                        {ev.status === 'Resolved' ? 'Resolved ✅' : 'Ongoing 🔴'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 88 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openModal} activeOpacity={0.85}>
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalOpen} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New pest entry</Text>

            <Text style={styles.modalLabel}>Pest name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Whitefly"
              placeholderTextColor={COLORS.gray}
              value={formPest}
              onChangeText={setFormPest}
            />

            <Text style={styles.modalLabel}>Severity</Text>
            <View style={styles.chipWrap}>
              {SEVERITY_ORDER.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setFormSeverity(s)}
                  style={[styles.modalChip, formSeverity === s && styles.modalChipOn]}
                >
                  <Text style={[styles.modalChipText, formSeverity === s && styles.modalChipTextOn]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Crop</Text>
            <View style={styles.chipWrap}>
              {CROP_OPTIONS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setFormCrop(c)}
                  style={[styles.modalChip, formCrop === c && styles.modalChipOn]}
                >
                  <Text style={[styles.modalChipText, formCrop === c && styles.modalChipTextOn]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Treatment applied</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe treatment"
              placeholderTextColor={COLORS.gray}
              value={formTreatment}
              onChangeText={setFormTreatment}
              multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveEntry} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Save Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  toolbarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  toolbarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  toolbarSpacer: {
    minWidth: 72,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
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
    marginBottom: 18,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  fieldChipsRow: {
    paddingVertical: 4,
    gap: 8,
    paddingRight: 8,
  },
  fieldChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C6D8BF',
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  fieldChipOn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fieldChipText: {
    fontWeight: '600',
    color: '#2F4F2F',
  },
  fieldChipTextOn: {
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  statCell: {
    flexGrow: 1,
    minWidth: '22%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DCE8D5',
    alignItems: 'center',
  },
  statCellWide: {
    minWidth: '100%',
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  statValSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  statLab: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C6D8BF',
    backgroundColor: COLORS.white,
  },
  filterChipOn: {
    backgroundColor: COLORS.primary + '33',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 13,
  },
  filterChipTextOn: {
    color: COLORS.primary,
  },
  timelineBlock: {
    marginTop: 8,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rail: {
    width: 28,
    alignItems: 'center',
    paddingTop: 8,
  },
  railDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    borderWidth: 3,
  },
  railLine: {
    width: 3,
    flex: 1,
    minHeight: 24,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    borderRadius: 2,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  cardPestTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  sevBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardMeta: {
    fontSize: 13,
    color: '#37474F',
    marginBottom: 4,
    lineHeight: 18,
  },
  cardMetaBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusResolved: {
    backgroundColor: COLORS.primary + '22',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusOngoing: {
    backgroundColor: COLORS.danger + '18',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusResolvedText: {
    color: COLORS.primary,
  },
  statusOngoingText: {
    color: COLORS.danger,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabPlus: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 28,
    maxHeight: '92%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCE8D5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6D8BF',
    backgroundColor: COLORS.white,
  },
  modalChipOn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalChipTextOn: {
    color: COLORS.white,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelBtnText: {
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 15,
  },
});
