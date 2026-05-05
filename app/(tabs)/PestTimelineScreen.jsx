import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as COLORS } from '../../constants/theme';
import { getCurrentUserId, getPestHistory } from '../../services/pestAnalysis';

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
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const scans = await getPestHistory(userId);
      if (mounted) setEntries(scans || []);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const total = entries.length;
  const resolved = entries.filter((r) => String(r.status).toLowerCase() === 'resolved').length;
  const ongoing = total - resolved;

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
        <Text style={styles.pageSubtitle}>Live timeline from your backend scan history</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{total}</Text>
            <Text style={styles.statLab}>Total Scans</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{resolved}</Text>
            <Text style={styles.statLab}>Resolved</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{ongoing}</Text>
            <Text style={styles.statLab}>Ongoing</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Timeline</Text>
        <View style={styles.timelineBlock}>
          {entries.length === 0 ? (
            <Text style={styles.emptyText}>No backend entries found.</Text>
          ) : (
            entries.map((ev, index) => {
              const sev = severityColors(ev.severity);
              const last = index === entries.length - 1;
              return (
                <View key={ev._id || index} style={styles.timelineRow}>
                  <View style={styles.rail}>
                    <View style={[styles.railDot, { borderColor: COLORS.primary }]} />
                    {!last && <View style={styles.railLine} />}
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardDate}>
                      {new Date(ev.createdAt || ev.updatedAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardPestTitle}>
                        🐛 {ev.pestName}
                      </Text>
                      <View style={[styles.sevBadge, { borderColor: sev.border, backgroundColor: sev.bg }]}>
                        <Text style={[styles.sevBadgeText, { color: sev.text }]}>{ev.severity}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardMeta}>
                      <Text style={styles.cardMetaBold}>Crop: </Text>
                      {ev.cropType || '-'}
                    </Text>
                    <Text style={styles.cardMeta}>
                      <Text style={styles.cardMetaBold}>Treatment: </Text>
                      {(ev.recommendations || []).join(', ') || '-'}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        String(ev.status).toLowerCase() === 'resolved'
                          ? styles.statusResolved
                          : styles.statusOngoing,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          String(ev.status).toLowerCase() === 'resolved'
                            ? styles.statusResolvedText
                            : styles.statusOngoingText,
                        ]}
                      >
                        {String(ev.status).toLowerCase() === 'resolved' ? 'Resolved ✅' : 'Ongoing 🔴'}
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
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLab: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
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
});
