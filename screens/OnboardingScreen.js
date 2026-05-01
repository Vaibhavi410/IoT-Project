// screens/OnboardingScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    emoji: "🐛",
    title: "Identify Any Pest\nInstantly",
    subtitle:
      "Take a photo of your crop and AI identifies the pest within seconds with 95% accuracy",
    bg: "#EEF7EE",
    dotColor: "#2E7D32",
  },
  {
    id: "2",
    emoji: "🪱",
    title: "Analyze Your\nSoil Health",
    subtitle:
      "Check NPK levels, detect soil diseases, and get fertilizer recommendations instantly",
    bg: "#FEF9EC",
    dotColor: "#F59E0B",
  },
  {
    id: "3",
    emoji: "🌾",
    title: "Protect Your\nHarvest",
    subtitle:
      "Get tiered treatment plans, weather advisories, and expert crop protocols — all in one app",
    bg: "#EEF4FB",
    dotColor: "#3B82F6",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("has_onboarded", "true");
    navigation.replace("SignIn");
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("has_onboarded", "true");
    navigation.replace("SignIn");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const currentSlide = SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.bg }]}>
      {/* Skip button */}
      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            {/* Large illustration emoji */}
            <View style={styles.illustrationContainer}>
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
            </View>

            {/* Text content */}
            <View style={styles.textContainer}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i && {
                  backgroundColor: currentSlide.dotColor,
                  width: 24,
                },
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: currentSlide.dotColor }]}
          onPress={
            currentIndex === SLIDES.length - 1 ? handleGetStarted : handleNext
          }
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  illustrationContainer: {
    width: width * 0.6,
    height: width * 0.6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  slideEmoji: {
    fontSize: 120,
  },
  textContainer: {
    alignItems: "center",
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1A3C1A",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 38,
  },
  slideSubtitle: {
    fontSize: 16,
    color: "#4A6741",
    textAlign: "center",
    lineHeight: 26,
  },
  bottomSection: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5CB",
    marginHorizontal: 4,
  },
  nextBtn: {
    width: "100%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
