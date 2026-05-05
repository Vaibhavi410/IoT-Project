import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors as COLORS } from '../../constants/theme';
import { getAdvice, getCurrentUserId, getPestHistory } from '../../services/pestAnalysis';

export default function KnowledgeFeedScreen() {
  const [feedItems, setFeedItems] = useState([]);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    (async () => {
      const userId = await getCurrentUserId();
      const [history, advice] = await Promise.all([
        userId ? getPestHistory(userId) : Promise.resolve([]),
        getAdvice('tomato'),
      ]);
      setFeedItems(history || []);
      setTips(advice?.tips || []);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Farmer Knowledge Feed</Text>
          <Text style={styles.subtitle}>Live crop tips and recent field detections</Text>
        </View>

        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>AI Tips</Text>
          {tips.length === 0 ? <Text style={styles.empty}>No tips available.</Text> : null}
          {tips.map((tip, i) => (
            <View key={`${tip}-${i}`} style={styles.tipCard}>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Recent Detections</Text>
          {feedItems.length === 0 ? <Text style={styles.empty}>No recent backend detections.</Text> : null}
          {feedItems.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.pestName || 'Detected disease'}</Text>
              <Text style={styles.postBody}>
                Crop: {post.cropType || '-'} | Severity: {post.severity || '-'}
              </Text>
              <Text style={styles.postMeta}>
                {new Date(post.createdAt || post.updatedAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 120 },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#D7F0D9', fontSize: 14, marginTop: 6 },
  feedSection: { paddingHorizontal: 16, gap: 12, marginTop: 14 },
  sectionTitle: { color: '#143915', fontSize: 16, fontWeight: '900' },
  empty: { color: '#456346' },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDEDD8',
    padding: 12,
  },
  tipText: { color: '#315B33', fontWeight: '700', lineHeight: 20 },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDEDD8',
  },
  postTitle: { color: '#143915', fontSize: 15, fontWeight: '900' },
  postBody: { color: '#456346', fontSize: 14, lineHeight: 21, marginTop: 6 },
  postMeta: { color: COLORS.gray, fontSize: 12, marginTop: 6 },
});