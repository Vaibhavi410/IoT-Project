import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

const RISK_COLORS = {
  green: COLORS.primary,
  orange: COLORS.warning,
  red: COLORS.danger,
};

export default function StageCard({ stage, isExpanded, onPress }) {
  const [animatedHeight] = useState(new Animated.Value(isExpanded ? 1 : 0));
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animatedHeight, isExpanded]);

  const riskColor = RISK_COLORS[stage.risk] || COLORS.primary;
  const maxHeight = contentHeight > 0 ? contentHeight + 4 : 120;

  const containerAnimatedStyle = {
    maxHeight: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxHeight],
    }),
    opacity: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.header} android_ripple={{ color: '#E8F5E9' }}>
        <View style={styles.titleWrap}>
          <Text style={styles.stageName}>{stage.name}</Text>
          <Text style={styles.dayRange}>{stage.days}</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
          <Text style={styles.riskText}>{stage.risk.toUpperCase()} RISK</Text>
        </View>
      </Pressable>

      <Animated.View style={[styles.expandWrap, containerAnimatedStyle]}>
        <View
          style={styles.expandContent}
          onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
        >
          <Text style={styles.sectionLabel}>Common Pests</Text>
          {stage.pests.map((pest) => (
            <Text key={pest} style={styles.pestItem}>
              {'\u2022'} {pest}
            </Text>
          ))}
          <Text style={styles.sectionLabel}>Recommended Action</Text>
          <Text style={styles.actionText}>{stage.action}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE8D5',
    overflow: 'hidden',
  },
  header: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  dayRange: {
    marginTop: 2,
    fontSize: 13,
    color: '#4E6C50',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  riskText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  expandWrap: {
    overflow: 'hidden',
  },
  expandContent: {
    borderTopWidth: 1,
    borderTopColor: '#E5EFE0',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionLabel: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
  },
  pestItem: {
    color: '#1B5E20',
    fontSize: 14,
    marginBottom: 4,
  },
  actionText: {
    color: '#1B5E20',
    lineHeight: 20,
    fontSize: 14,
  },
});
