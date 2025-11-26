import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useFrameCallback,
} from 'react-native-reanimated';
import Svg, { Path, G, ClipPath, Defs, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAppFonts } from './useFonts';

// Rotation physics constants
const BASE_VELOCITY = 90; // degrees per second (1 rotation per 4 seconds)
const SPEED_BOOST = 1.4; // Multiplier on each tap (exponential)
const DECAY_HALF_LIFE = 1500; // ms - time to decay halfway back to base velocity
const MAX_VELOCITY = 1800; // Cap at ~5 rotations per second

// Simple theme config directly in App.tsx
const theme = {
  colors: {
    bg: '#EEEDED',
    fg: '#262626',
  },
} as const;

// Configure Unistyles directly
StyleSheet.configure({
  themes: {
    light: theme,
  },
  settings: {
    initialTheme: 'light',
  },
});

export default function App() {
  // Load Geist fonts from Google Fonts
  const [fontsLoaded] = useAppFonts();
  
  // Get viewport dimensions using Unistyles
  const screenHeight = UnistylesRuntime.screen.height;
  
  // Calculate movement range: 15% from top to 15% from bottom
  // Logo starts centered, so we calculate offsets from center
  // 15% from top = screenHeight * 0.15
  // 15% from bottom = screenHeight * 0.85
  // Center = screenHeight * 0.5
  // Top offset from center = 0.15 - 0.5 = -0.35
  // Bottom offset from center = 0.85 - 0.5 = 0.35
  const topOffset = screenHeight * -0.35;
  const bottomOffset = screenHeight * 0.35;

  // Reanimated animation values
  const translateY = useSharedValue(topOffset);
  const rotation = useSharedValue(0);
  const angularVelocity = useSharedValue(BASE_VELOCITY); // degrees per second
  const scale = useSharedValue(1); // Pulse effect

  // Frame-based rotation with dynamic velocity and decay
  useFrameCallback((frameInfo) => {
    'worklet';
    if (frameInfo.timeSincePreviousFrame) {
      const deltaSeconds = frameInfo.timeSincePreviousFrame / 1000;
      
      // Update rotation based on current velocity
      rotation.value = (rotation.value + angularVelocity.value * deltaSeconds) % 360;
      
      // Apply smooth decay toward base velocity (time-based for frame-rate independence)
      if (angularVelocity.value > BASE_VELOCITY) {
        const decayRate = Math.pow(0.5, frameInfo.timeSincePreviousFrame / DECAY_HALF_LIFE);
        const excess = angularVelocity.value - BASE_VELOCITY;
        angularVelocity.value = BASE_VELOCITY + excess * decayRate;
        
        // Snap to base if very close (avoid floating point drift)
        if (angularVelocity.value - BASE_VELOCITY < 0.5) {
          angularVelocity.value = BASE_VELOCITY;
        }
      }
    }
  });

  // Tap handler - exponentially boost rotation speed with haptic feedback
  const handleTap = useCallback(() => {
    // Changed haptic from Light to Medium for a stronger, but still comfortable, feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    angularVelocity.value = Math.min(angularVelocity.value * SPEED_BOOST, MAX_VELOCITY);
  }, [angularVelocity]);

  useEffect(() => {
    // Continuous flowy movement from 15% top to 15% bottom
    translateY.value = withRepeat(
      withTiming(bottomOffset, {
        duration: 3000, // Smooth, flowy movement
        easing: Easing.inOut(Easing.ease), // Smooth ease in-out
      }),
      -1,
      true // Reverse to go back up
    );

    // Continuous pulse (breathing effect)
    scale.value = withRepeat(
      withTiming(1.15, { 
        duration: 2000,
        easing: Easing.inOut(Easing.ease), // Smooth pulse
      }),
      -1,
      true // Reverse for continuous pulse
    );
  }, [topOffset, bottomOffset]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  // Wait for fonts to load on both platforms
  if (!fontsLoaded) {
    return null; // Loading screen
  }

  return (
    <Pressable 
      style={styles.container}
      onPress={handleTap}
      accessibilityLabel="Tap anywhere to spin the star faster"
      accessibilityRole="button"
    >
      <View style={styles.content}>
        {/* Centered Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>darkling</Text>
          <Text style={styles.subtitle}>
            An app starter template built 
          </Text>
          <Text style={styles.subtitle}>
            with @darkresearch/generative-ui
          </Text>
          <Text style={styles.hint}>tap to spin ✦</Text>
        </View>

        {/* Animated Dark Logo - Flowy Movement */}
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <Svg width="106" height="106" viewBox="0 0 133 133" fill="none">
            <G clipPath="url(#clip0_859_490)">
              <Path
                d="M72.4358 74.9066C72.4132 74.93 72.3776 74.9417 72.329 74.9417C55.0586 74.9417 31.0314 74.9585 0.24755 74.9919C0.181895 74.9919 0.118935 74.9649 0.0725103 74.9169C0.0260852 74.8689 0 74.8038 0 74.7359V59.4615C0 59.4082 0.0204558 59.3572 0.0568677 59.3195C0.0932795 59.2818 0.142662 59.2607 0.194156 59.2607C15.489 59.3561 29.682 53.2021 40.521 41.9734C51.3599 30.7397 57.2817 16.0475 57.1604 0.230944C57.1616 0.179425 57.1819 0.130376 57.2172 0.0939357C57.2524 0.0574955 57.2998 0.0364623 57.3497 0.0351896L72.1203 4.91983e-05C72.1532 -0.000618341 72.1859 0.00551315 72.2165 0.018079C72.2471 0.0306448 72.275 0.049387 72.2985 0.0732252C72.322 0.0970635 72.3407 0.125519 72.3534 0.15691C72.3662 0.1883 72.3727 0.222006 72.3727 0.25605C72.4018 32.0899 72.4342 56.9383 72.4698 74.8012C72.4698 74.848 72.4585 74.8832 72.4358 74.9066Z"
                fill="#262626"
              />
              <Path
                d="M60.5641 58.0934C60.5415 58.1169 60.5302 58.1537 60.5302 58.2039C60.5302 76.0634 60.514 100.91 60.4816 132.744C60.4816 132.812 60.5077 132.877 60.5541 132.925C60.6006 132.973 60.6635 133 60.7292 133L75.4998 133C75.5513 133 75.6007 132.979 75.6371 132.941C75.6735 132.904 75.694 132.852 75.694 132.799C75.6017 116.983 81.5527 102.306 92.411 91.0969C103.274 79.8883 117.482 73.7644 132.777 73.8899C132.826 73.8887 132.874 73.8676 132.909 73.8312C132.944 73.7947 132.965 73.7457 132.966 73.6942L133 58.4197C133.001 58.3857 132.995 58.3519 132.983 58.3202C132.97 58.2886 132.952 58.2598 132.929 58.2355C132.906 58.2111 132.879 58.1918 132.848 58.1787C132.818 58.1655 132.785 58.1587 132.752 58.1587C101.969 58.1286 77.9397 58.0951 60.6661 58.0583C60.6208 58.0583 60.5868 58.07 60.5641 58.0934Z"
                fill="#262626"
              />
            </G>
            <Defs>
              <ClipPath id="clip0_859_490">
                <Rect width="133" height="133" fill="white" />
              </ClipPath>
            </Defs>
          </Svg>
        </Animated.View>
      </View>
    </Pressable>
  );
}

// Simple styles using Unistyles directly
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: UnistylesRuntime.insets.top,
    paddingBottom: UnistylesRuntime.insets.bottom,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateY: -80 }],
  },
  title: {
    fontSize: 36,
    color: theme.colors.fg,
    marginBottom: 8,
    fontFamily: 'Geist_400Regular',
  },
  subtitle: {
    fontSize: 18,
    color: '#262626',
    opacity: 0.6,
    fontFamily: 'Geist_400Regular',
    lineHeight: 28,
    // width: '90%',
    // display: 'flex',
    // // justifyContent: 'center',
    // // alignItems: 'center',
    // textAlign: 'center',
    // // borderWidth: 1,
    // // borderColor: 'red',
  },
  hint: {
    fontSize: 14,
    color: '#262626',
    opacity: 0.4,
    fontFamily: 'Geist_400Regular',
    marginTop: 16,
  },
  logoContainer: {
    width: 106,
    height: 106,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
