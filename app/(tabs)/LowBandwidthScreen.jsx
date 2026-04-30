import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';

export default function LowBandwidthScreen() {
  const [lowBandwidthEnabled, setLowBandwidthEnabled] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSyncNow = () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage('');

    setTimeout(() => {
      setSyncing(false);
      setSyncMessage('✅ Synced successfully!');
      if (Platform.OS === 'android') {
        ToastAndroid.show('Synced successfully!', ToastAndroid.SHORT);
      }
    }, 2000);
  };

  const handleClearCache = () => {
    Alert.alert('Cache', 'Cache cleared (demo)');
  };

  const handleRefreshCache = () => {
    Alert.alert('Cache', 'Cache refresh started (demo)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Low Bandwidth Mode</Text>
        <Text style={styles.subtitle}>Optimized for 2G and slow networks</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connection Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>📶</Text>
          <Text style={styles.statusText}>2G / Slow Network Detected</Text>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Low Bandwidth Mode</Text>
          <Switch
            value={lowBandwidthEnabled}
            onValueChange={setLowBandwidthEnabled}
            thumbColor={COLORS.white}
            trackColor={{ false: '#C4C4C4', true: COLORS.primary }}
          />
        </View>

        <View
          style={[
            styles.banner,
            lowBandwidthEnabled ? styles.bannerActive : styles.bannerInactive,
          ]}
        >
          <Text
            style={[
              styles.bannerText,
              lowBandwidthEnabled ? styles.bannerActiveText : styles.bannerInactiveText,
            ]}
          >
            {lowBandwidthEnabled
              ? '✅ Low Bandwidth Mode Active'
              : 'Low Bandwidth Mode Disabled'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What's optimized</Text>
        <Text style={styles.listItem}>🖼️ Images compressed to 10% quality</Text>
        <Text style={styles.listItem}>📊 Charts replaced with text summaries</Text>
        <Text style={styles.listItem}>🔄 Auto-sync disabled — manual refresh only</Text>
        <Text style={styles.listItem}>📦 Data cached locally for offline use</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Usage Today</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Data Saved</Text>
            <Text style={styles.statValue}>2.4 MB</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Requests Made</Text>
            <Text style={styles.statValue}>18</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Cache Hits</Text>
            <Text style={styles.statValue}>14</Text>
          </View>
        </View>
        <Text style={styles.progressLabel}>Cache efficiency: 78%</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cached Data Available</Text>
        <Text style={styles.listItem}>✅ Last pest scan results</Text>
        <Text style={styles.listItem}>✅ Treatment recommendations</Text>
        <Text style={styles.listItem}>✅ Crop protocol - Tomato</Text>
        <Text style={styles.listItem}>✅ Weather advisory</Text>
        <Text style={styles.listItem}>❌ Knowledge feed (requires internet)</Text>

        <View style={styles.cacheButtonsRow}>
          <TouchableOpacity style={styles.clearCacheButton} onPress={handleClearCache}>
            <Text style={styles.clearCacheText}>Clear Cache</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshCacheButton} onPress={handleRefreshCache}>
            <Text style={styles.refreshCacheText}>Refresh Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manual Sync</Text>
        <Text style={styles.syncTime}>Last synced: Today, 10:32 AM</Text>
        <TouchableOpacity style={styles.syncButton} onPress={handleSyncNow} activeOpacity={0.85}>
          {syncing ? (
            <View style={styles.syncLoadingRow}>
              <ActivityIndicator color={COLORS.white} />
              <Text style={styles.syncButtonText}>Syncing...</Text>
            </View>
          ) : (
            <Text style={styles.syncButtonText}>🔄 Sync Now</Text>
          )}
        </TouchableOpacity>
        {!!syncMessage && <Text style={styles.syncSuccess}>{syncMessage}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tips for Slow Networks</Text>
        <Text style={styles.listItem}>
          📸 Take photos in good lighting for smaller file size
        </Text>
        <Text style={styles.listItem}>
          ⏰ Sync data during off-peak hours (early morning)
        </Text>
        <Text style={styles.listItem}>💾 Enable offline mode before going to field</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  header: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: '#D6F0D8',
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE9D4',
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  toggleLabel: {
    color: '#2F4F2F',
    fontWeight: '700',
    fontSize: 14,
  },
  banner: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bannerActive: {
    backgroundColor: '#E8F5E9',
  },
  bannerInactive: {
    backgroundColor: '#ECEFF1',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerActiveText: {
    color: COLORS.primary,
  },
  bannerInactiveText: {
    color: '#616161',
  },
  listItem: {
    color: '#425B42',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#5A735A',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '800',
  },
  progressLabel: {
    color: '#446344',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: {
    width: '78%',
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  cacheButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  clearCacheButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearCacheText: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  refreshCacheButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshCacheText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  syncTime: {
    color: '#5A735A',
    marginBottom: 10,
    fontSize: 13,
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
  },
  syncLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncSuccess: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: '800',
  },
});
