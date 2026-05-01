import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const userRef = useRef(user);
  userRef.current = user;

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const nameScale = useRef(new Animated.Value(0.6)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(nameScale, {
              toValue: 1.05,
              duration: 500,
              easing: Easing.out(Easing.back(1.4)),
              useNativeDriver: true,
            }),
            Animated.timing(nameOpacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(nameScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
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
  }, [router, imageOpacity, nameScale, nameOpacity, taglineOpacity]);

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageWrap, { opacity: imageOpacity }]}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </Animated.View>

      <View style={styles.content} pointerEvents="none">
        <Animated.View
          style={[
            styles.nameContainer,
            {
              opacity: nameOpacity,
              transform: [{ scale: nameScale }],
            },
          ]}
        >
          <Text style={styles.logoText}>Aurelle</Text>
        </Animated.View>
        <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
          <Text style={styles.tagline}>Your Cycle, Your Glow ✨</Text>
        </Animated.View>
      </View>

      <View style={[styles.footer, { bottom: (insets.bottom || 24) + 32 }]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a12',
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  coverImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 2,
  },
  taglineWrap: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  footer: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 0.4 },
});
