import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/hooks/useAppStore';

const SPLASH_LOGO = require('../assets/images/splash-icon.png');

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const userRef = useRef(user);
  userRef.current = user;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.out(Easing.back(1.7)),
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      if (userRef.current?.name) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [router, backgroundOpacity, logoScale, logoOpacity, textOpacity]);

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradientContainer, { opacity: backgroundOpacity }]}>
        <LinearGradient
          colors={['#FF6B9D', '#9D71E8', '#5BBFDD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: logoScale }],
                  opacity: logoOpacity,
                },
              ]}
            >
              <View style={styles.logoCircle}>
                <Image source={SPLASH_LOGO} style={styles.logoImage} resizeMode="contain" />
              </View>
            </Animated.View>

            <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
              <Text style={styles.logoText}>FloAura</Text>
              <Text style={styles.tagline}>Your Cycle, Your Glow ✨</Text>
            </Animated.View>

            <View style={[styles.footer, { bottom: (insets.bottom || 24) + 32 }]}>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B9D',
  },
  gradientContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  textContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 80,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.4,
  },
});
