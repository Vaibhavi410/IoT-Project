import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors as COLORS } from '../../constants/theme';
import { DEFAULT_LANG, LANGUAGE_CATALOG, TRANSLATIONS } from '../../constants/translations';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';
import VoiceWaveform from '../../components/VoiceWaveform';
import { getDummyVoiceResponse, getSpeechLocale } from '../../services/voiceAssistantLogic';

/**
 * Voice-first assistant (Pestify)
 *
 * - Tap the big mic: real recording with waveform + timer (max 30s, optional silence auto-stop).
 * - There is no free on-device STT in this demo: farmers type what they said in the box below
 *   (or use quick chips), then "Get advice" runs dummy keyword → Hindi/English answers + TTS.
 * - "Speaking in" opens the same language sheet but only changes reply/TTS language (onPickOverride).
 */

/**
 * Translate a key for the *voice reply* language (farmer may pick Hindi while UI is English).
 */
function translatePack(langCode, key) {
  const pack = TRANSLATIONS[langCode] || TRANSLATIONS[DEFAULT_LANG];
  const fb = TRANSLATIONS[DEFAULT_LANG];
  if (pack[key] != null) return pack[key];
  if (fb[key] != null) return fb[key];
  return key;
}

export default function VoiceAssistantScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { languageCode } = useLanguage();

  /** Language used for chips, AI text, and TTS (farmer’s language). */
  const [voiceLang, setVoiceLang] = useState(languageCode);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  /** idle | listening | processing | response */
  const [phase, setPhase] = useState('idle');
  const [draftText, setDraftText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [recent, setRecent] = useState([]);

  const [recordingMs, setRecordingMs] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const recordingRef = useRef(null);
  const lastSoundMsRef = useRef(Date.now());
  const pulse = useRef(new Animated.Value(1)).current;
  const speakPulse = useRef(new Animated.Value(1)).current;

  const tv = useCallback((key) => translatePack(voiceLang, key), [voiceLang]);

  useEffect(() => {
    setVoiceLang(languageCode);
  }, [languageCode]);

  const speakingLabel = useMemo(() => {
    const row = LANGUAGE_CATALOG.find((r) => r.id === voiceLang);
    return row ? row.nativeName : voiceLang;
  }, [voiceLang]);

  // Pulsing green mic while listening
  useEffect(() => {
    if (phase !== 'listening') {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  // Speaker icon pulse while TTS plays
  useEffect(() => {
    if (!speaking) {
      speakPulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(speakPulse, {
          toValue: 1.15,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(speakPulse, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [speaking, speakPulse]);

  const stopRecording = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) {
      setPhase('idle');
      return;
    }
    try {
      await rec.stopAndUnloadAsync();
    } catch {
      // ignore
    }
    setPhase('idle');
    setRecordingMs(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (phase === 'processing') return;
    Speech.stop();
    setSpeaking(false);

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(tv('voice_mic_title'), tv('voice_permission_needed'), [
        { text: tv('ok') },
      ]);
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Try metering-enabled preset first (helps ~3s silence auto-stop on iOS); fall back if unsupported.
    let rec = new Audio.Recording();
    try {
      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
    } catch {
      rec = new Audio.Recording();
      try {
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      } catch (e) {
        Alert.alert(tv('voice_mic_title'), String(e?.message || e));
        return;
      }
    }

    lastSoundMsRef.current = Date.now();
    rec.setOnRecordingStatusUpdate((st) => {
      if (!st.isRecording) return;
      if (st.durationMillis != null) setRecordingMs(st.durationMillis);

      if (st.durationMillis != null && st.durationMillis >= 30000) {
        stopRecording();
        return;
      }

      // ~3 s silence (iOS metering; may be undefined on some Android builds)
      if (st.metering != null && st.durationMillis != null && st.durationMillis > 800) {
        if (st.metering > -47) {
          lastSoundMsRef.current = Date.now();
        } else if (Date.now() - lastSoundMsRef.current > 3000) {
          stopRecording();
        }
      }
    });

    try {
      await rec.startAsync();
    } catch (e) {
      Alert.alert(tv('voice_mic_title'), String(e?.message || e));
      return;
    }

    recordingRef.current = rec;
    setPhase('listening');
  }, [phase, stopRecording, tv]);

  const toggleMic = useCallback(async () => {
    if (phase === 'listening') {
      await stopRecording();
      return;
    }
    if (phase === 'idle' || phase === 'response') {
      await startRecording();
    }
  }, [phase, startRecording, stopRecording]);

  const submitQuestion = useCallback(
    async (overrideText) => {
      await stopRecording();
      const q = (overrideText != null ? overrideText : draftText).trim();
      if (!q) {
        Alert.alert(tv('voice_assistant'), tv('voice_empty_question'));
        return;
      }
      Speech.stop();
      setSpeaking(false);
      setDraftText(q);
      setPhase('processing');
      await new Promise((r) => setTimeout(r, 900));
      const ans = getDummyVoiceResponse(q, voiceLang, tv);
      setResponseText(ans);
      setRecent((prev) => [{ q, a: ans }, ...prev].slice(0, 3));
      setPhase('response');
    },
    [draftText, stopRecording, tv, voiceLang]
  );

  const resetConversation = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
    setResponseText('');
    setDraftText('');
    setPhase('idle');
  }, []);

  const toggleSpeak = useCallback(() => {
    if (!responseText) return;
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(responseText, {
      language: getSpeechLocale(voiceLang),
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [responseText, speaking, voiceLang]);

  const fmtTime = (ms) => {
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const micLabel =
    phase === 'listening'
      ? tv('voice_listening')
      : phase === 'processing'
        ? tv('voice_analyzing')
        : tv('voice_tap_to_speak');

  const micColor =
    phase === 'listening' ? COLORS.danger : phase === 'processing' ? COLORS.gray : COLORS.primary;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backText}>‹ {tv('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {tv('voice_assistant')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Speaking language */}
        <TouchableOpacity
          style={styles.langRow}
          onPress={() => setLangPickerOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.langLabel}>
            {tv('voice_speaking_in')}: <Text style={styles.langBold}>{speakingLabel}</Text>
          </Text>
          <Text style={styles.langChange}>{tv('voice_tap_to_change')}</Text>
        </TouchableOpacity>

        {/* Quick chips */}
        <Text style={styles.sectionTitle}>{tv('voice_quick_title')}</Text>
        <View style={styles.chipsWrap}>
          {['voice_chip_pest', 'voice_chip_soil', 'voice_chip_spray', 'voice_chip_weather'].map(
            (k) => (
              <TouchableOpacity
                key={k}
                style={styles.chip}
                onPress={() => submitQuestion(tv(k))}
                activeOpacity={0.85}
              >
                <Text style={styles.chipText}>{tv(k)}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Mic + waveform */}
        <View style={styles.micSection}>
          {phase === 'listening' && (
            <>
              <VoiceWaveform active />
              <Text style={styles.timer}>{fmtTime(recordingMs)}</Text>
            </>
          )}

          <Animated.View style={{ transform: [{ scale: phase === 'listening' ? pulse : 1 }] }}>
            <TouchableOpacity
              style={[styles.micOuter, { borderColor: micColor }]}
              onPress={toggleMic}
              disabled={phase === 'processing'}
              activeOpacity={0.85}
            >
              {phase === 'processing' ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <Text style={styles.micEmoji}>{phase === 'listening' ? '⏹' : '🎤'}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.micHint}>{micLabel}</Text>
          {phase === 'listening' && (
            <TouchableOpacity onPress={stopRecording} style={styles.stopLink}>
              <Text style={styles.stopLinkText}>{tv('voice_stop')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transcript / question preview */}
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>{tv('voice_transcript_title')}</Text>
          <Text style={styles.transcriptBody} numberOfLines={4}>
            {draftText || (phase === 'listening' ? '…' : tv('voice_live_hint'))}
          </Text>
        </View>

        {/* Typed fallback */}
        <Text style={styles.fallbackLabel}>{tv('voice_or_type')}</Text>
        <TextInput
          style={styles.input}
          placeholder={tv('voice_input_placeholder')}
          placeholderTextColor={COLORS.gray}
          value={draftText}
          onChangeText={setDraftText}
          multiline
          editable={phase !== 'processing'}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, phase === 'processing' && styles.btnDisabled]}
          onPress={() => submitQuestion()}
          disabled={phase === 'processing'}
        >
          {phase === 'processing' ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryBtnText}>{tv('voice_get_advice')}</Text>
          )}
        </TouchableOpacity>

        {/* Response card */}
        {phase === 'response' && responseText ? (
          <View style={styles.responseCard}>
            <Text style={styles.responseText}>{responseText}</Text>
            <View style={styles.responseActions}>
              <Animated.View
                style={{ transform: [{ scale: speaking ? speakPulse : 1 }] }}
              >
                <TouchableOpacity
                  onPress={toggleSpeak}
                  style={styles.iconBtn}
                  accessibilityLabel={tv('voice_read_aloud_a11y')}
                >
                  <Text style={styles.iconBtnText}>{speaking ? '⏹' : '🔊'}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            <TouchableOpacity style={styles.secondaryBtn} onPress={resetConversation}>
              <Text style={styles.secondaryBtnText}>{tv('voice_ask_another')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Recent */}
        {recent.length > 0 ? (
          <View style={styles.recentBlock}>
            <Text style={styles.sectionTitle}>{tv('voice_recent_title')}</Text>
            {recent.map((item, idx) => (
              <View key={`${item.q}-${idx}`} style={styles.recentRow}>
                <Text style={styles.recentQ} numberOfLines={2}>
                  {item.q}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>

      <LanguageSelector
        visible={langPickerOpen}
        onClose={() => setLangPickerOpen(false)}
        onPickOverride={(id) => setVoiceLang(id)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    width: 72,
  },
  backText: {
    fontSize: 17,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 72,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  langRow: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  langLabel: {
    fontSize: 15,
    color: COLORS.text,
  },
  langBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  langChange: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  micSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  micOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  micEmoji: {
    fontSize: 48,
  },
  micHint: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  stopLink: {
    marginTop: 8,
  },
  stopLinkText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  transcriptBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 88,
  },
  transcriptLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 6,
  },
  transcriptBody: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  fallbackLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    padding: 12,
    minHeight: 88,
    textAlignVertical: 'top',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  responseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    marginBottom: 12,
  },
  responseActions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  iconBtnText: {
    fontSize: 24,
  },
  secondaryBtn: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentBlock: {
    marginBottom: 16,
  },
  recentRow: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  recentQ: {
    fontSize: 14,
    color: COLORS.text,
  },
});
