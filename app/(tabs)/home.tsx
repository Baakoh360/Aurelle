import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/hooks/useAppStore';
import { formatReadable } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import CycleInfoCard from '@/components/CycleInfoCard';
import { Sun, Droplets, Moon, Sparkles, Lightbulb } from 'lucide-react-native';

// Large banks so "Today's tip" and daily tips vary by day and by app restart
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
  'Your body temperature may rise slightly during fertile days — that\'s normal.',
  'This is a great week for gentle cardio or strength training.',
  'Leafy greens and whole grains support hormonal balance.',
  'Stay hydrated to help cervical mucus stay clear and stretchy.',
  'If you\'re TTC, ovulation tests can help pinpoint your peak day.',
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
  'Take a rest day if you feel tired — it\'s valid.',
  'Breathing exercises can help with stress any day.',
  'Eat regular meals to keep blood sugar stable.',
  'Your follicular phase is a good time for new habits.',
  'Small acts of self-care add up.',
];

// Deeper icon colors so icons are clearly visible on light card backgrounds
const ICON_COLORS = {
  water: '#0369A1',    // deep blue for Droplets
  moon: '#5B21B6',     // deep purple for Moon
  sun: '#B45309',      // deep amber for Sun
  sparkles: '#9D174D', // deep pink for Sparkles
  lightbulb: '#92400E', // deep amber for Lightbulb
};

const ALL_DAILY_TIPS = [
  { icon: Droplets, text: 'Stay hydrated — aim for 8 glasses of water today.', colors: [Colors.tertiary, '#7DD3F0'] as [string, string], iconColor: ICON_COLORS.water },
  { icon: Moon, text: 'Get 7–8 hours of sleep to support your cycle and mood.', colors: [Colors.secondary, '#B794F6'] as [string, string], iconColor: ICON_COLORS.moon },
  { icon: Sun, text: 'A few minutes of morning sunlight can boost your energy.', colors: [Colors.warning, '#FFD54F'] as [string, string], iconColor: ICON_COLORS.sun },
  { icon: Sparkles, text: 'Take a short walk or stretch to ease any tension.', colors: [Colors.primary, '#FF8FB3'] as [string, string], iconColor: ICON_COLORS.sparkles },
  { icon: Lightbulb, text: 'Eat a balanced breakfast to keep energy steady.', colors: ['#F59E0B', '#FBBF24'] as [string, string], iconColor: ICON_COLORS.lightbulb },
  { icon: Droplets, text: 'Limit caffeine after 2 PM for better sleep.', colors: [Colors.tertiary, '#7DD3F0'] as [string, string], iconColor: ICON_COLORS.water },
  { icon: Moon, text: 'Wind down with a book or calm music before bed.', colors: [Colors.secondary, '#B794F6'] as [string, string], iconColor: ICON_COLORS.moon },
  { icon: Sun, text: 'Spend time outdoors — even 10 minutes helps.', colors: [Colors.warning, '#FFD54F'] as [string, string], iconColor: ICON_COLORS.sun },
  { icon: Sparkles, text: 'Try 5 minutes of deep breathing or meditation.', colors: [Colors.primary, '#FF8FB3'] as [string, string], iconColor: ICON_COLORS.sparkles },
  { icon: Lightbulb, text: 'Add a vegetable or fruit to every meal today.', colors: ['#F59E0B', '#FBBF24'] as [string, string], iconColor: ICON_COLORS.lightbulb },
  { icon: Droplets, text: 'Keep a water bottle nearby as a reminder.', colors: [Colors.tertiary, '#7DD3F0'] as [string, string], iconColor: ICON_COLORS.water },
  { icon: Moon, text: 'Stick to a consistent bedtime tonight.', colors: [Colors.secondary, '#B794F6'] as [string, string], iconColor: ICON_COLORS.moon },
  { icon: Sun, text: 'Open the curtains or step outside in the morning.', colors: [Colors.warning, '#FFD54F'] as [string, string], iconColor: ICON_COLORS.sun },
  { icon: Sparkles, text: 'Do one thing that feels good for your body.', colors: [Colors.primary, '#FF8FB3'] as [string, string], iconColor: ICON_COLORS.sparkles },
  { icon: Lightbulb, text: 'Snack on nuts or fruit instead of processed options.', colors: ['#F59E0B', '#FBBF24'] as [string, string], iconColor: ICON_COLORS.lightbulb },
  { icon: Droplets, text: 'Herbal tea counts toward your fluid intake.', colors: [Colors.tertiary, '#7DD3F0'] as [string, string], iconColor: ICON_COLORS.water },
  { icon: Moon, text: 'Avoid screens 30 minutes before sleep.', colors: [Colors.secondary, '#B794F6'] as [string, string], iconColor: ICON_COLORS.moon },
  { icon: Sun, text: 'Take a break outside if you work indoors.', colors: [Colors.warning, '#FFD54F'] as [string, string], iconColor: ICON_COLORS.sun },
  { icon: Sparkles, text: 'Stretch your neck and shoulders if you sit a lot.', colors: [Colors.primary, '#FF8FB3'] as [string, string], iconColor: ICON_COLORS.sparkles },
  { icon: Lightbulb, text: 'Eat slowly and notice how your body feels.', colors: ['#F59E0B', '#FBBF24'] as [string, string], iconColor: ICON_COLORS.lightbulb },
  { icon: Droplets, text: 'Start the day with a full glass of water.', colors: [Colors.tertiary, '#7DD3F0'] as [string, string], iconColor: ICON_COLORS.water },
  { icon: Moon, text: 'Dim the lights in the evening to support sleep.', colors: [Colors.secondary, '#B794F6'] as [string, string], iconColor: ICON_COLORS.moon },
  { icon: Sun, text: 'Get natural light in the first hour after waking.', colors: [Colors.warning, '#FFD54F'] as [string, string], iconColor: ICON_COLORS.sun },
  { icon: Sparkles, text: 'Do one small act of kindness for yourself.', colors: [Colors.primary, '#FF8FB3'] as [string, string], iconColor: ICON_COLORS.sparkles },
];

/** Seed from date — same day = same number (no hooks) */
function getDaySeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return y * 372 + m * 31 + d;
}

/** Session seed: set once per app launch so tips change when user closes and reopens the app */
let sessionTipSeed: number | null = null;
function getSessionTipSeed(): number {
  if (sessionTipSeed === null) {
    sessionTipSeed = Math.floor(Date.now() * (Math.random() + 0.5)) & 0x7fffffff;
    if (sessionTipSeed === 0) sessionTipSeed = 1;
  }
  return sessionTipSeed;
}

/** Combined seed: day + session so tips vary by day AND by app restart */
function getTipSeed(): number {
  const daySeed = getDaySeed(new Date());
  const session = getSessionTipSeed();
  return ((daySeed * 7907 + session) & 0x7fffffff) >>> 0;
}

/** Pick first 4 tips in a deterministic order by seed (changes on app restart) */
function getDailyTipsForDay(seed: number) {
  const out = [...ALL_DAILY_TIPS];
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, 4);
}

/** All hooks and logic live here. The tab screen itself has no hooks. */
function HomeContent() {
  const insets = useSafeAreaInsets();
  const { user, cycleData, isLoading, getPhaseForDate } = useAppStore();
  
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

  const today = new Date();
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
    const bank = phase === 'period' ? TIPS_PERIOD : phase === 'fertile' ? TIPS_FERTILE : phase === 'ovulation' ? TIPS_OVULATION : TIPS_SAFE;
    todayTip = bank[tipSeed % bank.length];
  }

  const dailyTipsShuffled = getDailyTipsForDay(tipSeed);

  const headerPaddingTop = insets.top + spacing.sm;
  const contentBottom = insets.bottom + 20;
  
  return (
    <View style={styles.container}>
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
      
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottom }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
          <CycleInfoCard />
        
        {/* Today's wellness tip — same gradient on iOS and Android */}
        <LinearGradient
          colors={['#FFE5F1', '#F0E6FF', '#E8F4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tipCard}
        >
          <View style={styles.tipCardHeader}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.tipIconWrap}
            >
              <Lightbulb size={22} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.tipCardTitle}>Today&apos;s wellness tip</Text>
          </View>
          <Text style={styles.tipCardText}>{todayTip}</Text>
        </LinearGradient>
        
        {/* Daily tips — colorful cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily tips</Text>
          <Text style={styles.sectionSubtitle}>Small habits for a better you</Text>
          {dailyTipsShuffled.map((item, index) => {
            const Icon = item.icon;
            const key = `${tipSeed}-${index}-${item.text.slice(0, 12)}`;

            // Same design on iOS and Android: bright colored cards
            return (
              <View
                key={key}
                style={[
                  styles.tipRowCard,
                  {
                    backgroundColor: item.colors[0] + '28',
                    borderLeftColor: item.colors[0],
                    borderLeftWidth: 5,
                  },
                ]}
              >
                <View style={[styles.tipRowIconWrapCard, { backgroundColor: item.colors[0] + '50' }]}>
                  <Icon size={22} color={item.iconColor} />
                </View>
                <Text style={styles.tipRowText}>{item.text}</Text>
            </View>
            );
          })}
          </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

/** Tab screen: no hooks here so hook order can never change. */
export default function HomeScreen() {
  return <HomeContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  datePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    marginLeft: spacing.base,
  },
  date: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  tipCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
      },
      android: { elevation: 4 },
    }),
  },
  tipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  tipCardText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.lightText,
    fontWeight: '500',
    marginBottom: spacing.base,
  },
  tipRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: spacing.md,
    ...Platform.select({
      ios: {
    shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  tipRowIconWrapCard: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipRowText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: spacing.base,
  },
});
