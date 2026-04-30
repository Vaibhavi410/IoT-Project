import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
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
import { LANGUAGE_CATALOG, TRANSLATIONS } from '../../constants/translations';
import { useLanguage } from '../../context/LanguageContext';

/** Bilingual demo line requested in the product spec (shown on this screen). */
const PREVIEW_BILINGUAL =
  'Crop health starts here / फसल स्वास्थ्य यहाँ से शुरू होता है';

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

export default function LanguageScreen() {
  const navigation = useNavigation();
  const { languageCode, setLanguage, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(languageCode);

  useEffect(() => {
    setSelectedId(languageCode);
  }, [languageCode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGE_CATALOG;
    return LANGUAGE_CATALOG.filter((row) => {
      return (
        row.englishName.toLowerCase().includes(q) ||
        row.nativeName.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const previewLine = TRANSLATIONS[selectedId]?.language_preview || TRANSLATIONS.english.language_preview;

  const onContinue = async () => {
    await setLanguage(selectedId);
    goBackCompat(navigation);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => goBackCompat(navigation)} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.toolbarTitle}>Language</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Choose Your Language / अपनी भाषा चुनें</Text>

        <TextInput
          style={styles.search}
          placeholder={t('search_languages')}
          placeholderTextColor={COLORS.gray}
          value={query}
          onChangeText={setQuery}
        />

        <View style={styles.grid}>
          {filtered.map((lang) => {
            const selected = selectedId === lang.id;
            return (
              <Pressable
                key={lang.id}
                onPress={() => setSelectedId(lang.id)}
                style={[styles.card, selected && styles.cardSelected]}
              >
                {selected ? (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : null}
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={styles.englishName}>{lang.englishName}</Text>
                <Text style={styles.nativeName}>{lang.nativeName}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Text style={styles.previewMain}>{previewLine}</Text>
          <Text style={styles.previewSub}>{PREVIEW_BILINGUAL}</Text>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.9}>
          <Text style={styles.continueText}>
            {TRANSLATIONS[selectedId]?.continue || t('continue')}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE8D5',
    backgroundColor: COLORS.background,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 8, minWidth: 72 },
  backBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  toolbarTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  toolbarSpacer: { minWidth: 72 },
  scroll: { padding: 16, paddingBottom: 32 },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 26,
  },
  search: {
    borderWidth: 1,
    borderColor: '#DCE8D5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0EDD8',
    position: 'relative',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  flag: { fontSize: 30, marginBottom: 8 },
  englishName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  nativeName: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  previewBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCE8D5',
  },
  previewLabel: { fontSize: 12, fontWeight: '700', color: COLORS.gray, marginBottom: 8 },
  previewMain: { fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 22 },
  previewSub: { fontSize: 13, color: COLORS.gray, marginTop: 8, lineHeight: 20 },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  continueText: { color: COLORS.white, fontWeight: '800', fontSize: 17 },
});
