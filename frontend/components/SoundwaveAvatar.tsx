import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BAR_COUNT = 40;
const BAR_WIDTH = 3;
const BAR_GAP = 2;

interface SoundwaveAvatarProps {
  isActive?: boolean;
  emotion?: string;
  colorScheme?: string;
}

export const SoundwaveAvatar: React.FC<SoundwaveAvatarProps> = ({
  isActive = false,
  emotion = 'calm',
  colorScheme = 'blue',
}) => {
  const animations = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive) {
      // Active speaking animation
      const staggeredAnimations = animations.map((anim, index) => {
        const delay = index * 20;
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 150 + Math.random() * 100,
              useNativeDriver: true,
              delay,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.5 + 0.2,
              duration: 150 + Math.random() * 100,
              useNativeDriver: true,
            }),
          ])
        );
      });

      Animated.stagger(10, staggeredAnimations).start();
    } else {
      // Idle gentle wave
      const idleAnimations = animations.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.4 + Math.sin(index * 0.3) * 0.1,
              duration: 1000 + index * 20,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3 + Math.sin(index * 0.3) * 0.1,
              duration: 1000 + index * 20,
              useNativeDriver: true,
            }),
          ])
        );
      });

      Animated.stagger(30, idleAnimations).start();
    }
  }, [isActive, animations]);

  const colors = getColorScheme(colorScheme);

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        {animations.map((anim, index) => {
          const height = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 120],
          });

          // Create gradient effect from center
          const distanceFromCenter = Math.abs(index - BAR_COUNT / 2) / (BAR_COUNT / 2);
          const opacity = 1 - distanceFromCenter * 0.5;

          return (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                {
                  height,
                  width: BAR_WIDTH,
                  backgroundColor: colors.primary,
                  opacity,
                  marginHorizontal: BAR_GAP / 2,
                },
              ]}
            />
          );
        })}
      </View>
      
      {/* Glow effect */}
      <View style={[styles.glow, { backgroundColor: colors.primary, opacity: 0.1 }]} />
    </View>
  );
};

const getColorScheme = (scheme: string) => {
  switch (scheme) {
    case 'blue':
      return {
        primary: '#00d4ff',
        secondary: '#0088ff',
      };
    case 'purple':
      return {
        primary: '#a855f7',
        secondary: '#7c3aed',
      };
    case 'green':
      return {
        primary: '#10b981',
        secondary: '#059669',
      };
    case 'orange':
      return {
        primary: '#f97316',
        secondary: '#ea580c',
      };
    default:
      return {
        primary: '#00d4ff',
        secondary: '#0088ff',
      };
  }
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  bar: {
    borderRadius: 2,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
});
