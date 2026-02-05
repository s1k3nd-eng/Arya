import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SIZE = width * 0.6;

interface HolographicAvatarProps {
  emotion?: string;
  style?: string; // 'holographic', 'geometric', 'particle'
  colorScheme?: string;
}

export const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
  emotion = 'calm',
  style = 'holographic',
  colorScheme = 'blue',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Pulse animation based on emotion
    const pulseSpeed = getEmotionSpeed(emotion);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: pulseSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: pulseSpeed,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [emotion]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const colors = getColorScheme(colorScheme);

  if (style === 'holographic') {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
                <Stop offset="50%" stopColor={colors.secondary} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.8" />
              </LinearGradient>
            </Defs>
            
            {/* Outer holographic ring */}
            <Circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#grad1)"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
            
            {/* Middle ring */}
            <Circle
              cx="100"
              cy="100"
              r="70"
              stroke={colors.secondary}
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
            
            {/* Face - Eyes based on emotion */}
            {renderEyes(emotion, colors)}
            
            {/* Mouth based on emotion */}
            {renderMouth(emotion, colors)}
            
            {/* Inner glow */}
            <Circle
              cx="100"
              cy="100"
              r="50"
              fill={colors.primary}
              opacity="0.1"
            />
          </Svg>
        </Animated.View>
        
        {/* Animated particles */}
        <View style={styles.particlesContainer}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: colors.accent,
                  opacity: glowAnim,
                  transform: [
                    {
                      rotate: `${i * 45}deg`,
                    },
                    {
                      translateX: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [SIZE / 2 - 20, SIZE / 2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  }

  // Geometric style
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }, { rotate: rotation }],
        },
      ]}
    >
      <Svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Geometric shape */}
        <Polygon
          points="100,20 180,80 180,120 100,180 20,120 20,80"
          stroke="url(#grad2)"
          strokeWidth="3"
          fill={colors.primary}
          fillOpacity="0.1"
        />
        
        {/* Inner geometric face */}
        {renderEyes(emotion, colors)}
        {renderMouth(emotion, colors)}
      </Svg>
    </Animated.View>
  );
};

const renderEyes = (emotion: string, colors: any) => {
  switch (emotion) {
    case 'happy':
    case 'excited':
      return (
        <>
          <Circle cx="80" cy="85" r="8" fill={colors.accent} />
          <Circle cx="120" cy="85" r="8" fill={colors.accent} />
          <Path
            d="M 75 80 Q 80 75 85 80"
            stroke={colors.accent}
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M 115 80 Q 120 75 125 80"
            stroke={colors.accent}
            strokeWidth="2"
            fill="none"
          />
        </>
      );
    case 'sad':
      return (
        <>
          <Circle cx="80" cy="85" r="6" fill={colors.secondary} opacity="0.6" />
          <Circle cx="120" cy="85" r="6" fill={colors.secondary} opacity="0.6" />
          <Path
            d="M 75 78 Q 80 82 85 78"
            stroke={colors.secondary}
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M 115 78 Q 120 82 125 78"
            stroke={colors.secondary}
            strokeWidth="2"
            fill="none"
          />
        </>
      );
    case 'thinking':
      return (
        <>
          <Circle cx="80" cy="85" r="7" fill={colors.accent} />
          <Circle cx="120" cy="85" r="7" fill={colors.accent} />
          <Path
            d="M 75 78 L 85 78"
            stroke={colors.accent}
            strokeWidth="2"
          />
        </>
      );
    case 'curious':
      return (
        <>
          <Circle cx="80" cy="85" r="9" fill={colors.accent} />
          <Circle cx="120" cy="85" r="9" fill={colors.accent} />
          <Circle cx="80" cy="83" r="4" fill={colors.primary} />
          <Circle cx="120" cy="83" r="4" fill={colors.primary} />
        </>
      );
    default: // calm
      return (
        <>
          <Circle cx="80" cy="85" r="7" fill={colors.accent} />
          <Circle cx="120" cy="85" r="7" fill={colors.accent} />
        </>
      );
  }
};

const renderMouth = (emotion: string, colors: any) => {
  switch (emotion) {
    case 'happy':
    case 'excited':
      return (
        <Path
          d="M 70 110 Q 100 130 130 110"
          stroke={colors.accent}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'sad':
      return (
        <Path
          d="M 70 120 Q 100 110 130 120"
          stroke={colors.secondary}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'thinking':
      return (
        <Path
          d="M 80 115 L 120 115"
          stroke={colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    case 'curious':
      return (
        <Circle
          cx="100"
          cy="115"
          r="8"
          stroke={colors.accent}
          strokeWidth="2"
          fill="none"
        />
      );
    default: // calm
      return (
        <Path
          d="M 75 115 Q 100 120 125 115"
          stroke={colors.accent}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
};

const getEmotionSpeed = (emotion: string): number => {
  switch (emotion) {
    case 'excited':
      return 400;
    case 'happy':
      return 600;
    case 'thinking':
      return 1200;
    case 'sad':
      return 1500;
    default:
      return 1000;
  }
};

const getColorScheme = (scheme: string) => {
  switch (scheme) {
    case 'blue':
      return {
        primary: '#00d4ff',
        secondary: '#0088ff',
        accent: '#00ffff',
      };
    case 'purple':
      return {
        primary: '#a855f7',
        secondary: '#7c3aed',
        accent: '#c084fc',
      };
    case 'green':
      return {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
      };
    case 'orange':
      return {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
      };
    default:
      return {
        primary: '#00d4ff',
        secondary: '#0088ff',
        accent: '#00ffff',
      };
  }
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});