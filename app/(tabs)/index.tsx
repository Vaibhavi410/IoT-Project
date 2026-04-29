import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>🌿 Pestify</Text>
        <Text style={styles.tagline}>Smart Crop & Soil Health Assistant</Text>
      </View>

      {/* Feature Buttons */}
      <View style={styles.grid}>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#E8F5E9' }]}
          onPress={() => router.push('/TreatmentScreen')}
        >
          <Text style={styles.cardIcon}>💊</Text>
          <Text style={styles.cardTitle}>Treatment Plan</Text>
          <Text style={styles.cardSubtitle}>Tiered organic to chemical treatments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#2E7D32',
            margin: 16,
            padding: 16,
            borderRadius: 14,
            alignItems: 'center'
          }}
          onPress={() => router.push('/TreatmentScreen')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            💊 View Treatment Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FFF8E1' }]}
          onPress={() => alert('Coming soon!')}
        >
          <Text style={styles.cardIcon}>🐛</Text>
          <Text style={styles.cardTitle}>Pest Identification</Text>
          <Text style={styles.cardSubtitle}>Upload crop photo to identify pests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#F3E5F5' }]}
          onPress={() => alert('Coming soon!')}
        >
          <Text style={styles.cardIcon}>🪱</Text>
          <Text style={styles.cardTitle}>Soil Analysis</Text>
          <Text style={styles.cardSubtitle}>Check NPK levels and soil health</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#E3F2FD' }]}
          onPress={() => alert('Coming soon!')}
        >
          <Text style={styles.cardIcon}>🌦️</Text>
          <Text style={styles.cardTitle}>Weather Advisory</Text>
          <Text style={styles.cardSubtitle}>Pest outbreak forecast</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#F1F8E9' }]}
          onPress={() => router.push('/(tabs)/PestTimelineScreen')}
        >
          <Text style={styles.cardTitle}>📅 Pest Timeline</Text>
          <Text style={styles.cardSubtitle}>Track pest activity on your farm over time</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FFFDE7' }]}
          onPress={() => router.push('/(tabs)/PDFReportScreen')}
        >
          <Text style={styles.cardTitle}>📄 PDF Reports</Text>
          <Text style={styles.cardSubtitle}>Auto-generate pest analysis PDF report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FCE4EC' }]}
          onPress={() => alert('Coming soon!')}
        >
          <Text style={styles.cardIcon}>💬</Text>
          <Text style={styles.cardTitle}>AI Chatbot</Text>
          <Text style={styles.cardSubtitle}>Ask anything about your crops</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#E0F7FA' }]}
          onPress={() => alert('Coming soon!')}
        >
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardTitle}>Crop Dashboard</Text>
          <Text style={styles.cardSubtitle}>Track crop health over time</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#2E7D32',
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
    padding: 16,
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
