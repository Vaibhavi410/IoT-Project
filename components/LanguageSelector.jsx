import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { LANGUAGE_CATALOG } from '../constants/translations';
import { useLanguage } from '../context/LanguageContext';

/**
 * Reusable bottom-sheet style modal to pick a language from anywhere in the app.
 * Selecting a language updates the whole app instantly via LanguageContext.
 * If onPickOverride is set (e.g. voice reply language only), it is called instead of setLanguage.
 */
export default function LanguageSelector({ visible, onClose, onPickOverride }) {
  const insets = useSafeAreaInsets();
  const { languageCode, setLanguage, t } = useLanguage();
  const [query, setQuery] = useState('');

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

  const pick = async (id) => {
    if (onPickOverride) {
      onPickOverride(id);
      setQuery('');
      onClose?.();
      return;
    }
    await setLanguage(id);
    setQuery('');
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdropFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>{t('choose_language_sheet_title')}</Text>

        <TextInput
          style={styles.search}
          placeholder={t('search_languages')}
          placeholderTextColor={COLORS.gray}
          value={query}
          onChangeText={setQuery}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        >
          <View style={styles.grid}>
            {filtered.map((lang) => {
              const selected = languageCode === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  style={[styles.card, selected && styles.cardSelected]}
                  onPress={() => pick(lang.id)}
                  activeOpacity={0.85}
                >
                  {selected ? (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  ) : null}
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text style={styles.englishName}>{lang.englishName}</Text>
                  <Text style={styles.nativeName}>{lang.nativeName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.9}>
          <Text style={styles.doneBtnText}>{t('close')}</Text>
        </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '88%',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#DCE8D5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 12,
  },
  gridContent: {
    paddingBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
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
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  flag: {
    fontSize: 28,
    marginBottom: 6,
  },
  englishName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  nativeName: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  doneBtn: {
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
});
