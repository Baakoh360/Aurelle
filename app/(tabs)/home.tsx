import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/hooks/useAppStore';
import { formatReadable } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import CycleInfoCard from '@/components/CycleInfoCard';
import { Sun, Droplets, Moon, Sparkles, Lightbulb, Star, X } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Tip banks ────────────────────────────────────────────────────────────────

const TIPS_PERIOD = [
  'During your period, warm compresses can help relieve cramps.',
  'Staying hydrated can help reduce bloating and cramps.',
  'Light movement like walking or yoga can ease period pain.',
  'Iron-rich foods like spinach and beans help replace what your body loses.',
  'Dark chocolate (70%+) can help with mood swings.',
  'A heating pad on your lower abdomen for 15–20 minutes can ease cramps.',
  'Herbal teas like ginger or chamomile may help with discomfort.',
  'Rest when you need it — your body is doing important work.',
  'Avoid heavy exercise on heavy flow days; gentle movement is fine.',
  'Magnesium-rich foods like bananas and nuts can help with cramps.',
  'Track your flow so predictions stay accurate.',
  'Comfortable, breathable fabrics can make a difference.',
  'A warm bath may help relax muscles and ease pain.',
  'Reduce salt to help with bloating and water retention.',
  'Vitamin B6 from chickpeas or salmon can support mood.',
];

const TIPS_FERTILE = [
  "You're in your fertile window. Track any changes in cervical mucus.",
  'Your energy and confidence are naturally higher this week.',
  'Zinc-rich foods like pumpkin seeds support reproductive health.',
  "Your body temperature may rise slightly during fertile days — that's normal.",
  'This is a great week for gentle cardio or strength training.',
  'Leafy greens and whole grains support hormonal balance.',
  'Stay hydrated to help cervical mucus stay clear and stretchy.',
  "If you're TTC, ovulation tests can help pinpoint your peak day.",
  'Reduce stress with short walks or meditation.',
  'Omega-3s from fish or flax support cycle health.',
  'Sleep well — rest helps your body regulate hormones.',
  'You may feel more social or creative; lean into it.',
];

const TIPS_OVULATION = [
  'Today is your estimated ovulation day. You may notice increased energy.',
  "You're at peak fertility today — your body is working hard.",
  'Staying active today supports hormonal balance.',
  'Feeling more social or energetic? Ovulation often boosts mood.',
  'Light exercise like walking or yoga is ideal today.',
  'Eat a nutrient-dense meal to support your body.',
  'You might notice a slight rise in basal body temperature.',
  'Stay hydrated and avoid skipping meals.',
  'This is a high-energy day — good for important tasks or workouts.',
  'Gentle stretching can ease any mid-cycle discomfort.',
];

const TIPS_SAFE = [
  'Listen to your body and note any changes in how you feel today.',
  'Your energy is rising — a great time for light exercise.',
  'Leafy greens this week support healthy balance.',
  'Track your period regularly for more accurate predictions.',
  'In the week before your period, increase iron-rich foods like leafy greens.',
  'Reducing caffeine and salt can help reduce bloating.',
  'Getting 7–8 hours of sleep helps regulate your hormones.',
  'Schedule a workout or hobby you enjoy this week.',
  'Drink plenty of water to support your cycle and skin.',
  'A short walk after meals can help digestion and mood.',
  'Consider a multivitamin with iron if you have heavy periods.',
  'Spend time with people who lift you up.',
  'Journaling can help you notice cycle patterns over time.',
  'Limit screen time before bed for better sleep.',
  'Nuts and seeds are great for sustained energy.',
  "Take a rest day if you feel tired — it's valid.",
  'Breathing exercises can help with stress any day.',
  'Eat regular meals to keep blood sugar stable.',
  'Your follicular phase is a good time for new habits.',
  'Small acts of self-care add up.',
];

// ─── Daily tips data ──────────────────────────────────────────────────────────

const ALL_DAILY_TIPS = [
  {
    icon: Droplets,
    text: 'Stay hydrated — aim for 8 glasses of water today.',
    detail: "Water supports every system in your body — from digestion to skin health. Try keeping a bottle nearby as a visual reminder. Herbal teas and water-rich foods like cucumber and watermelon count too.",
    gradient: ['#C9EEFF', '#90D8F5'] as [string, string],
    iconGradient: ['#38BDF8', '#0EA5E9'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#0369A1',
  },
  {
    icon: Moon,
    text: 'Get 7–8 hours of sleep to support your cycle and mood.',
    detail: "Sleep is when your body balances hormones like cortisol and estrogen. Even one night of poor sleep can affect your mood and energy. A consistent bedtime — even on weekends — makes a big difference.",
    gradient: ['#EAE0FF', '#C9B8FB'] as [string, string],
    iconGradient: ['#A78BFA', '#7C3AED'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#5B21B6',
  },
  {
    icon: Sun,
    text: 'A few minutes of morning sunlight can boost your energy.',
    detail: "Morning light signals your brain to stop producing melatonin and start the day. Just 5–10 minutes outside — even on a cloudy day — helps regulate your sleep-wake rhythm and lifts your mood naturally.",
    gradient: ['#FFF5CC', '#FFE066'] as [string, string],
    iconGradient: ['#FBBF24', '#F59E0B'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#92400E',
  },
  {
    icon: Sparkles,
    text: 'Take a short walk or stretch to ease any tension.',
    detail: "Even a 10-minute walk lowers cortisol and boosts endorphins. Gentle stretching — especially your hips and lower back — releases tension that builds up from sitting or hormonal shifts during your cycle.",
    gradient: ['#FFD6E8', '#FF9EC4'] as [string, string],
    iconGradient: ['#FF6B9D', '#D873C9'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#9D174D',
  },
  {
    icon: Lightbulb,
    text: 'Eat a balanced breakfast to keep energy steady.',
    detail: "A breakfast with protein, healthy fat, and complex carbs keeps your blood sugar stable for hours. Think eggs with toast, yogurt with fruit, or oats with nuts. Skipping it often leads to energy crashes and cravings later.",
    gradient: ['#FFE8CC', '#FFBF7A'] as [string, string],
    iconGradient: ['#FB923C', '#EA580C'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#7C2D12',
  },
  {
    icon: Droplets,
    text: 'Limit caffeine after 2 PM for better sleep.',
    detail: "Caffeine has a half-life of about 5–6 hours, meaning half of a 3 PM coffee is still in your system at 8 PM. Cutting off by 2 PM gives your body time to wind down naturally and makes falling asleep much easier.",
    gradient: ['#C9EEFF', '#90D8F5'] as [string, string],
    iconGradient: ['#38BDF8', '#0EA5E9'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#0369A1',
  },
  {
    icon: Moon,
    text: 'Wind down with a book or calm music before bed.',
    detail: "Screens emit blue light that suppresses melatonin. Swapping your phone for a book or soft music 30 minutes before bed signals your nervous system to relax. Even a short ritual trains your brain to associate it with sleep.",
    gradient: ['#EAE0FF', '#C9B8FB'] as [string, string],
    iconGradient: ['#A78BFA', '#7C3AED'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#5B21B6',
  },
  {
    icon: Sun,
    text: 'Spend time outdoors — even 10 minutes helps.',
    detail: "Nature exposure reduces stress hormones and lowers blood pressure within minutes. Fresh air, natural light, and even the sound of wind or birds activate your parasympathetic nervous system — your body's calm mode.",
    gradient: ['#FFF5CC', '#FFE066'] as [string, string],
    iconGradient: ['#FBBF24', '#F59E0B'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#92400E',
  },
  {
    icon: Sparkles,
    text: 'Try 5 minutes of deep breathing or meditation.',
    detail: "Slow, deep breaths activate your vagus nerve, which calms your heart rate and nervous system. Box breathing — inhale 4 counts, hold 4, exhale 4, hold 4 — is a simple technique you can do anywhere, anytime.",
    gradient: ['#FFD6E8', '#FF9EC4'] as [string, string],
    iconGradient: ['#FF6B9D', '#D873C9'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#9D174D',
  },
  {
    icon: Lightbulb,
    text: 'Add a vegetable or fruit to every meal today.',
    detail: "Fruits and vegetables are packed with antioxidants, fiber, and micronutrients that support hormone balance. Aim for color variety — leafy greens, berries, orange vegetables — to cover a broad range of nutrients throughout the day.",
    gradient: ['#FFE8CC', '#FFBF7A'] as [string, string],
    iconGradient: ['#FB923C', '#EA580C'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#7C2D12',
  },
  {
    icon: Droplets,
    text: 'Keep a water bottle nearby as a reminder.',
    detail: "Out of sight often means out of mind. Placing a water bottle on your desk, next to your bed, or in your bag is one of the simplest habit nudges you can use. Aim to finish it before noon, then refill.",
    gradient: ['#C9EEFF', '#90D8F5'] as [string, string],
    iconGradient: ['#38BDF8', '#0EA5E9'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#0369A1',
  },
  {
    icon: Moon,
    text: 'Stick to a consistent bedtime tonight.',
    detail: "Your body's internal clock thrives on routine. Going to bed at the same time each night — even if you're not tired — trains your circadian rhythm. Over a week or two, you'll likely fall asleep faster and wake feeling more rested.",
    gradient: ['#EAE0FF', '#C9B8FB'] as [string, string],
    iconGradient: ['#A78BFA', '#7C3AED'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#5B21B6',
  },
  {
    icon: Sun,
    text: 'Open the curtains or step outside in the morning.',
    detail: "Light is the most powerful cue for your body clock. Exposure to bright light within the first hour of waking anchors your circadian rhythm, improves alertness, and leads to better sleep quality that same night.",
    gradient: ['#FFF5CC', '#FFE066'] as [string, string],
    iconGradient: ['#FBBF24', '#F59E0B'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#92400E',
  },
  {
    icon: Sparkles,
    text: 'Do one thing that feels good for your body.',
    detail: "Self-care doesn't have to be elaborate. A warm shower, a nourishing meal, dancing to a song you love, or simply sitting in quiet for five minutes — these small acts of kindness toward yourself compound over time.",
    gradient: ['#FFD6E8', '#FF9EC4'] as [string, string],
    iconGradient: ['#FF6B9D', '#D873C9'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#9D174D',
  },
  {
    icon: Lightbulb,
    text: 'Snack on nuts or fruit instead of processed options.',
    detail: "Nuts provide healthy fats and protein that keep you full longer, while fruit offers natural sugar with fiber to slow absorption. Together they make a balanced snack that won't spike your blood sugar or leave you crashing.",
    gradient: ['#FFE8CC', '#FFBF7A'] as [string, string],
    iconGradient: ['#FB923C', '#EA580C'] as [string, string],
    iconColor: '#FFFFFF',
    accent: '#7C2D12',
  },
];

const SELF_LOVE_AFFIRMATIONS = [
  { emoji: '🌸', text: 'You are enough, exactly as you are.' },
  { emoji: '💖', text: 'Your body is doing amazing things every day.' },
  { emoji: '✨', text: 'You deserve rest, joy, and kindness.' },
  { emoji: '🌺', text: 'Celebrating every phase of your beautiful cycle.' },
  { emoji: '💫', text: 'Your feelings are valid. You are seen.' },
  { emoji: '🩷', text: 'Softness is strength. You have both.' },
  { emoji: '🌷', text: 'You are resilient, radiant, and whole.' },
  { emoji: '💝', text: "Every day is a fresh start. You've got this." },
];

const QUOTES = [
  { text: 'She believed she could, so she did.', author: 'R.S. Grey' },
  { text: 'You are braver than you believe, stronger than you seem.', author: 'A.A. Milne' },
  { text: "Take care of your body. It's the only place you have to live.", author: 'Jim Rohn' },
  { text: 'Nourishing yourself in a way that helps you blossom is self-love.', author: 'Deborah Day' },
  { text: 'Your body is your most priceless possession.', author: 'Jack LaLanne' },
  { text: 'The most powerful thing you can do is embrace who you are.', author: 'Unknown' },
  { text: 'A flower does not think of competing with the flower next to it.', author: 'Zen Shin' },
];

// ─── Seeds ────────────────────────────────────────────────────────────────────

function getDaySeed(date: Date): number {
  return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
}

let sessionTipSeed: number | null = null;
function getSessionTipSeed(): number {
  if (sessionTipSeed === null) {
    sessionTipSeed = Math.floor(Date.now() * (Math.random() + 0.5)) & 0x7fffffff;
    if (sessionTipSeed === 0) sessionTipSeed = 1;
  }
  return sessionTipSeed;
}

function getTipSeed(): number {
  const daySeed = getDaySeed(new Date());
  const session = getSessionTipSeed();
  return ((daySeed * 7907 + session) & 0x7fffffff) >>> 0;
}

function getDailyTipsForDay(seed: number) {
  const out = [...ALL_DAILY_TIPS];
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, 4);
}

// ─── Floating Bubble ──────────────────────────────────────────────────────────

type BubbleConfig = {
  size: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  startY: number;
};

const BUBBLE_CONFIGS: BubbleConfig[] = [
  { size: 56, left: 0.07, color: 'rgba(255,107,157,0.12)', duration: 7200, delay: 0,    startY: 140 },
  { size: 38, left: 0.80, color: 'rgba(216,115,201,0.10)', duration: 9000, delay: 1400, startY: 80  },
  { size: 26, left: 0.48, color: 'rgba(157,113,232,0.09)', duration: 6600, delay: 2800, startY: 260 },
  { size: 46, left: 0.63, color: 'rgba(255,107,157,0.08)', duration: 8400, delay: 500,  startY: 400 },
  { size: 20, left: 0.25, color: 'rgba(216,115,201,0.11)', duration: 7600, delay: 3200, startY: 560 },
];

const AFFIRM_BUBBLES: BubbleConfig[] = [
  { size: 22, left: 0.06, color: 'rgba(255,107,157,0.20)', duration: 5800, delay: 0,    startY: 60 },
  { size: 14, left: 0.84, color: 'rgba(216,115,201,0.18)', duration: 7200, delay: 900,  startY: 40 },
  { size: 18, left: 0.55, color: 'rgba(157,113,232,0.17)', duration: 6400, delay: 2000, startY: 80 },
  { size: 10, left: 0.30, color: 'rgba(255,255,255,0.30)', duration: 5200, delay: 3500, startY: 30 },
  { size: 16, left: 0.70, color: 'rgba(255,107,157,0.14)', duration: 6800, delay: 1500, startY: 70 },
];

const QUOTE_BUBBLES: BubbleConfig[] = [
  { size: 16, left: 0.10, color: 'rgba(255,255,255,0.22)', duration: 5600, delay: 0,    startY: 50 },
  { size: 10, left: 0.72, color: 'rgba(255,255,255,0.18)', duration: 6800, delay: 1200, startY: 30 },
  { size: 12, left: 0.45, color: 'rgba(255,200,230,0.20)', duration: 5000, delay: 2400, startY: 60 },
  { size: 8,  left: 0.88, color: 'rgba(255,255,255,0.24)', duration: 7000, delay: 3600, startY: 20 },
];

const TODAYTIP_BUBBLES: BubbleConfig[] = [
  { size: 20, left: 0.87, color: 'rgba(255,107,157,0.13)', duration: 6200, delay: 0,    startY: 70 },
  { size: 14, left: 0.10, color: 'rgba(157,113,232,0.13)', duration: 7400, delay: 1600, startY: 50 },
  { size: 10, left: 0.60, color: 'rgba(255,255,255,0.22)', duration: 5400, delay: 3000, startY: 90 },
  { size: 16, left: 0.35, color: 'rgba(216,115,201,0.12)', duration: 6600, delay: 800,  startY: 40 },
];

function FloatingBubble({ config }: { config: BubbleConfig }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 1,                  duration: 900,             useNativeDriver: true }),
          Animated.timing(scale,      { toValue: 1,                  duration: 900, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -(config.size * 5), duration: config.duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0,   duration: 0, useNativeDriver: true }),
          Animated.timing(scale,      { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: config.left * SCREEN_WIDTH,
        top: config.startY,
        width: config.size,
        height: config.size,
        borderRadius: config.size / 2,
        backgroundColor: config.color,
        borderWidth: 1,
        borderColor: 'rgba(255,107,157,0.16)',
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    />
  );
}

function BubbleLayer({ configs = BUBBLE_CONFIGS }: { configs?: BubbleConfig[] }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {configs.map((cfg, i) => (
        <FloatingBubble key={i} config={cfg} />
      ))}
    </View>
  );
}

// ─── Floating sparkle ─────────────────────────────────────────────────────────

function FloatingSparkle({ style }: { style?: object }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1, 0.4] });
  return (
    <Animated.View style={[style, { transform: [{ translateY }], opacity }]}>
      <Text style={{ fontSize: 14 }}>✨</Text>
    </Animated.View>
  );
}

// ─── Tip Detail Modal ─────────────────────────────────────────────────────────

type TipItem = (typeof ALL_DAILY_TIPS)[number];

function TipModal({
  item,
  visible,
  onClose,
}: {
  item: TipItem | null;
  visible: boolean;
  onClose: () => void;
}) {
  const slideY    = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1,    duration: 260, easing: Easing.out(Easing.cubic),        useNativeDriver: true }),
        Animated.timing(slideY,    { toValue: 0,    duration: 300, easing: Easing.out(Easing.back(1.05)),   useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 280, easing: Easing.out(Easing.cubic),        useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0,    duration: 180, useNativeDriver: true }),
        Animated.timing(slideY,    { toValue: 40,   duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.94, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!item) return null;

  const Icon = item.icon;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop — tap to dismiss */}
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, modalStyles.backdropInner, { opacity: fadeAnim }]} />
      </Pressable>

      {/* Bottom sheet card */}
      <Animated.View
        style={[
          modalStyles.sheet,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideY }, { scale: scaleAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={modalStyles.sheetInner}
        >
          {/* Decorative rings */}
          <View style={modalStyles.decorRingLarge} />
          <View style={modalStyles.decorRingMed} />

          {/* Close button */}
          <TouchableOpacity
            style={modalStyles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[modalStyles.closeBtnInner, { backgroundColor: item.accent + '22' }]}>
              <X size={16} color={item.accent} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* Icon */}
          <LinearGradient colors={item.iconGradient} style={modalStyles.icon}>
            <Icon size={26} color="#FFFFFF" />
          </LinearGradient>

          {/* Title */}
          <Text style={[modalStyles.title, { color: item.accent }]}>{item.text}</Text>

          {/* Divider */}
          <View style={[modalStyles.divider, { backgroundColor: item.accent + '30' }]} />

          {/* Detail text */}
          <Text style={[modalStyles.detail, { color: item.accent + 'CC' }]}>{item.detail}</Text>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

// ─── Daily Tip Card (rectangular, full-width) ─────────────────────────────────

function DailyTipCard({
  item,
  index,
  onPress,
}: {
  item: TipItem;
  index: number;
  onPress: () => void;
}) {
  const Icon       = item.icon;
  const slideIn    = useRef(new Animated.Value(24)).current;
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0, duration: 420, delay: index * 90,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1, duration: 420, delay: index * 90, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  const handlePressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View
      style={[
        tipCardStyles.wrapper,
        { opacity: fadeIn, transform: [{ translateY: slideIn }, { scale: pressScale }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tipCardStyles.card}
        >
          {/* Decorative rings */}
          <View style={tipCardStyles.ringLarge} />
          <View style={tipCardStyles.ringSmall} />

          {/* Row: icon + text */}
          <View style={tipCardStyles.row}>
            <LinearGradient colors={item.iconGradient} style={tipCardStyles.iconWrap}>
              <Icon size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[tipCardStyles.tipText, { color: item.accent }]} numberOfLines={3}>
              {item.text}
            </Text>
          </View>

          {/* "Tap to learn more" pill */}
          <View style={[tipCardStyles.tapHint, { backgroundColor: item.accent + '18' }]}>
            <Text style={[tipCardStyles.tapHintText, { color: item.accent }]}>Tap to learn more</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Affirmation banner ───────────────────────────────────────────────────────

function AffirmationBanner({ seed }: { seed: number }) {
  const item  = SELF_LOVE_AFFIRMATIONS[seed % SELF_LOVE_AFFIRMATIONS.length];
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <LinearGradient
      colors={['#FF6B9D22', '#D873C922', '#9D71E822']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={affirmStyles.card}
    >
      <BubbleLayer configs={AFFIRM_BUBBLES} />
      <View style={affirmStyles.decorLeft}><FloatingSparkle /></View>
      <View style={affirmStyles.decorRight}><FloatingSparkle style={{ marginTop: 12 }} /></View>
      <Animated.Text style={[affirmStyles.emoji, { transform: [{ scale: pulse }] }]}>
        {item.emoji}
      </Animated.Text>
      <Text style={affirmStyles.text}>{item.text}</Text>
      <View style={affirmStyles.divider} />
      <Text style={affirmStyles.sub}>✦ Daily affirmation ✦</Text>
    </LinearGradient>
  );
}

// ─── Quote strip ──────────────────────────────────────────────────────────────

function QuoteStrip({ seed }: { seed: number }) {
  const q = QUOTES[seed % QUOTES.length];
  return (
    <LinearGradient
      colors={['#FF6B9D', '#D873C9', '#9D71E8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={quoteStyles.strip}
    >
      <BubbleLayer configs={QUOTE_BUBBLES} />
      <Star size={14} color="rgba(255,255,255,0.7)" />
      <View style={quoteStyles.inner}>
        <Text style={quoteStyles.text}>"{q.text}"</Text>
        <Text style={quoteStyles.author}>— {q.author}</Text>
      </View>
      <Star size={14} color="rgba(255,255,255,0.7)" />
    </LinearGradient>
  );
}

// ─── Home screen ─────────────────────────────────────────────────────────────

function HomeContent() {
  const insets = useSafeAreaInsets();
  const { user, cycleData, isLoading, getPhaseForDate } = useAppStore();
  const [selectedTip, setSelectedTip] = useState<TipItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openTip = (item: TipItem) => {
    setSelectedTip(item);
    setModalVisible(true);
  };

  const closeTip = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTip(null), 300);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Please complete onboarding</Text>
      </View>
    );
  }

  const today   = new Date();
  const tipSeed = getTipSeed();

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  let todayTip: string;
  if (!cycleData) {
    todayTip = TIPS_SAFE[tipSeed % TIPS_SAFE.length];
  } else {
    const phase = getPhaseForDate(today);
    const bank  =
      phase === 'period'    ? TIPS_PERIOD    :
      phase === 'fertile'   ? TIPS_FERTILE   :
      phase === 'ovulation' ? TIPS_OVULATION :
      TIPS_SAFE;
    todayTip = bank[tipSeed % bank.length];
  }

  const dailyTipsShuffled = getDailyTipsForDay(tipSeed);
  const headerPaddingTop  = insets.top + spacing.sm;
  const contentBottom     = insets.bottom + 20;

  return (
    <View style={styles.container}>
      {/* Tip modal */}
      <TipModal item={selectedTip} visible={modalVisible} onClose={closeTip} />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: headerPaddingTop }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{user.name} ✨</Text>
          </View>
          <View style={styles.datePill}>
            <Text style={styles.date}>{formatReadable(new Date())}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Body ── */}
      <View style={{ flex: 1 }}>
        <BubbleLayer configs={BUBBLE_CONFIGS} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottom }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <CycleInfoCard />

          <AffirmationBanner seed={tipSeed} />

          <QuoteStrip seed={tipSeed} />

          {/* Today's wellness tip */}
          <LinearGradient
            colors={['#FFE5F1', '#F0E6FF', '#E8F4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipCard}
          >
            <BubbleLayer configs={TODAYTIP_BUBBLES} />
            <View style={styles.tipCardHeader}>
              <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.tipIconWrap}>
                <Lightbulb size={22} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.tipCardTitle}>Today&apos;s wellness tip</Text>
            </View>
            <Text style={styles.tipCardText}>{todayTip}</Text>
          </LinearGradient>

          {/* ── Daily tips — full-width rectangular list ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily tips</Text>
            <Text style={styles.sectionSubtitle}>Tap any card to learn more</Text>
            <View style={tipCardStyles.list}>
              {dailyTipsShuffled.map((item, index) => (
                <DailyTipCard
                  key={`${tipSeed}-${index}`}
                  item={item}
                  index={index}
                  onPress={() => openTip(item)}
                />
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return <HomeContent />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.lightBackground },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.lightBackground },
  errorContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.lightBackground },
  errorText:        { color: Colors.error, fontSize: 16, fontWeight: '600' },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  headerContent:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft:     { flex: 1, minWidth: 0 },
  greeting: {
    fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase',
  },
  name: {
    fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  datePill: {
    backgroundColor: 'rgba(255,255,255,0.25)', paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, borderRadius: radius.full, marginLeft: spacing.base,
  },
  date:           { fontSize: 13, color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.2 },
  scroll:         { flex: 1 },
  scrollContent:  { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  tipCard: {
    borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,107,157,0.2)', minHeight: 110,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 18 },
      android: { elevation: 4 },
    }),
  },
  tipCardHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  tipIconWrap:    { width: 44, height: 44, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  tipCardTitle:   { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: 0.2 },
  tipCardText:    { fontSize: 16, color: Colors.text, lineHeight: 24, fontWeight: '500', letterSpacing: 0.1 },
  section:        { marginBottom: spacing.xl },
  sectionTitle:   { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4, letterSpacing: 0.2 },
  sectionSubtitle:{ fontSize: 14, color: Colors.lightText, fontWeight: '500', marginBottom: spacing.base },
  bottomSpacer:   { height: spacing.base },
});

// ─── Tip card styles ──────────────────────────────────────────────────────────

const tipCardStyles = StyleSheet.create({
  list: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  wrapper: {
    width: '100%',
  },
  card: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    gap: spacing.sm,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  // Large frosted ring — top right
  ringLarge: {
    position: 'absolute',
    top: -28, right: -28,
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  // Small accent blob — bottom left
  ringSmall: {
    position: 'absolute',
    bottom: -14, left: -20,
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  tipText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    flex: 1,
  },
  tapHint: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 46 + spacing.md, // align under tip text, past icon
  },
  tapHintText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    opacity: 0.85,
  },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  backdropInner: {
    backgroundColor: 'rgba(30,10,40,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  sheetInner: {
    borderRadius: 28,
    padding: spacing.xl,
    paddingTop: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.50)',
    ...Platform.select({
      ios:     { shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.20, shadowRadius: 24 },
      android: { elevation: 10 },
    }),
  },
  decorRingLarge: {
    position: 'absolute',
    top: -40, right: -40,
    width: 130, height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  decorRingMed: {
    position: 'absolute',
    bottom: -20, left: -24,
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  closeBtn: {
    position: 'absolute',
    top: 16, right: 16,
    zIndex: 10,
  },
  closeBtnInner: {
    width: 32, height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 56, height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 25,
    letterSpacing: 0.1,
    marginBottom: spacing.md,
    paddingRight: 36,
  },
  divider: {
    height: 1.5,
    borderRadius: 99,
    marginBottom: spacing.md,
  },
  detail: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
});
const affirmStyles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.text,
    lineHeight: 22,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: spacing.sm,
    borderRadius: 10,
  },
  sub: {
    fontSize: 12,
    color: Colors.lightText,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  decorLeft: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  decorRight: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
});
const quoteStyles = StyleSheet.create({
  strip: {
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '600',
  },
});