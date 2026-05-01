import React, { useMemo, useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors as COLORS } from '../constants/theme';
import { LANGUAGE_CATALOG } from '../constants/translations';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ visible, onClose, onPickOverride = undefined }) {
  const insets = useSafeAreaInsets();
  const { languageCode, setLanguage, t } = useLanguage();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGE_CATALOG;
    return LANGUAGE_CATALOG.filter((row) =>
      row.englishName.toLowerCase().includes(q) ||
      row.nativeName.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q)
    );
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
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16) }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{t('choose_language_sheet_title') || 'Choose Language'}</Text>

          <TextInput
            style={styles.search}
            placeholder={t('search_languages') || 'Search languages'}
            placeholderTextColor="#7B8F7B"
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
                    {selected && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.flag}>{lang.flag}</Text>
                    <Text style={styles.englishName}>{lang.englishName}</Text>
                    <Text style={styles.nativeName}>{lang.nativeName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.doneBtnText}>{t('close') || 'Close'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
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
    color: '#1B5E20',
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
    color: '#1B5E20',
    backgroundColor: '#F1F8E9',
    marginBottom: 12,
  },
  gridContent: { paddingBottom: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#F1F8E9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0EDD8',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  flag: { fontSize: 28, marginBottom: 6 },
  englishName: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
  nativeName: { fontSize: 13, color: '#757575', marginTop: 2 },
  doneBtn: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});