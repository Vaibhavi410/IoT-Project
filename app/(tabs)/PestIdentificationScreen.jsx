import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Colors as COLORS } from '../../constants/theme';
import { getCurrentUserId, getPestHistory } from '../../services/pestAnalysis';

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
  const [recentScans, setRecentScans] = useState([]);

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
      const asset = result.assets[0];
      navigation.navigate('Analyze', {
        imageAsset: { uri: asset.uri, mimeType: asset.type || 'image/jpeg' },
      });
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
      const asset = result.assets[0];
      navigation.navigate('Analyze', {
        imageAsset: { uri: asset.uri, mimeType: asset.type || 'image/jpeg' },
      });
    }
  }


  useEffect(() => {
    let mounted = true;
    (async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const scans = await getPestHistory(userId);
      if (mounted) setRecentScans(scans.slice(0, 8));
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
        <View style={styles.card}>
          <Text style={styles.hint}>Capture or upload a crop image to run AI diagnosis.</Text>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={pickFromCamera}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>📷 Take Photo</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={pickFromGallery}>
              <Text style={styles.btnText}>🖼️ Upload from Gallery</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.length === 0 ? (
            <Text style={{ color: '#666' }}>No recent backend scans found.</Text>
          ) : (
            recentScans.map((item, i) => {
              const title = `${item.pestName || 'Scan'} - ${new Date(
                item.createdAt || item.updatedAt
              ).toLocaleDateString()}`;
              const status = item.status || 'new';
              return (
                <View key={i.toString()} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyTitle}>{title}</Text>
                  </View>
                  <View
                    style={[
                      styles.historyStatus,
                      status === 'resolved' ? styles.statusResolved : styles.statusOngoing,
                    ]}
                  >
                    <Text style={styles.historyStatusText}>{status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

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
  hint: {
    marginTop: 2,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B5E20',
    marginBottom: 10,
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

