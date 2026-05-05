import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as COLORS } from '../../constants/theme';
import { getAdvice } from '../../services/pestAnalysis';

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

export default function CropProtocolScreen() {
  const navigation = useNavigation();
  const [crop, setCrop] = useState('tomato');
  const [tips, setTips] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getAdvice(crop);
      setTips(data?.tips || []);
    })();
  }, [crop]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => goBackCompat(navigation)}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.toolbarTitle}>Crop protocol</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewCard}>
          <Text style={styles.cropTitle}>Crop Protocol Advice</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter crop type"
            placeholderTextColor="#8AA08A"
            value={crop}
            onChangeText={setCrop}
          />
          <Text style={styles.overviewLabel}>
            Protocol tips are fetched from backend AI advice endpoint.
          </Text>
          {tips.map((tip, i) => (
            <View key={`${tip}-${i}`} style={styles.preventionRow}>
              <Text style={styles.preventionAction}>{tip}</Text>
            </View>
          ))}
        </View>
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
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE8D5',
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
    color: '#1B5E20',
  },
  toolbarSpacer: {
    minWidth: 72,
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 28,
  },
  overviewCard: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  cropTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#4E6C50',
    flex: 1,
  },
  overviewValue: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#C6D8BF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    color: '#1B5E20',
  },
  preventionCard: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  preventionRow: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F0E4',
  },
  preventionAction: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
});
