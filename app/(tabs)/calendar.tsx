import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/hooks/useAppStore';
import { formatReadable, differenceInDays, parseISO, format, addDays } from '@/utils/dateUtils';
import { getInsightsForDayLog } from '@/utils/logInsights';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import CalendarView from '@/components/CalendarView';
import DayLogForm from '@/components/DayLogForm';
import {
  X,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Trash2,
  Droplets,
  Moon,
  Sun,
  Wind,
  CheckCircle2,
  Activity,
} from 'lucide-react-native';
import type { DayLog } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Phase types ───────────────────────────────────────────────────────────────
// Maps the store's raw CycleDayType values to the 4 named UI phases.
//
// Store value  →  UI phase
// 'period'     →  'period'
// 'safe'       →  'follicular' (before ovulation) or 'luteal' (after)
// 'fertile'    →  'follicular'  (fertile window is still pre-ovulation)
// 'ovulation'  →  'ovulation'
// null         →  'unknown'
type UIPhase = 'period' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

interface PhaseInfo {
  phase: UIPhase;
  dayOfCycle: number;    // 1-based day within the current cycle
  daysRemaining: number; // days left in this phase
  cycleLength: number;
  periodLength: number;
}

// ─── Phase metadata ────────────────────────────────────────────────────────────
const PHASE_META: Record<
  UIPhase,
  {
    label: string;
    color: string;
    bg: string;
    borderColor: string;
    gradient: [string, string];
    icon: (active: boolean) => React.ReactNode;
    tip: string;
  }
> = {
  period: {
    label: 'Period',
    color: '#FF6B9D',
    bg: '#FF6B9D18',
    borderColor: '#FF6B9D40',
    gradient: ['#FF6B9D', '#FF8FB3'],
    icon: (active) => <Droplets size={active ? 16 : 13} color={active ? '#fff' : '#FF6B9D'} strokeWidth={2.5} />,
    tip: 'Rest, warmth, and gentle movement like yoga or walking support your body best right now.',
  },
  follicular: {
    label: 'Follicular',
    color: '#9D71E8',
    bg: '#9D71E818',
    borderColor: '#9D71E840',
    gradient: ['#9D71E8', '#B48EF0'],
    icon: (active) => <Wind size={active ? 16 : 13} color={active ? '#fff' : '#9D71E8'} strokeWidth={2.5} />,
    tip: 'Energy is rising! Great time to start new projects, try new workouts, and socialise.',
  },
  ovulation: {
    label: 'Ovulation',
    color: '#F5A623',
    bg: '#F5A62318',
    borderColor: '#F5A62340',
    gradient: ['#F5A623', '#F7C063'],
    icon: (active) => <Sun size={active ? 16 : 13} color={active ? '#fff' : '#F5A623'} strokeWidth={2.5} />,
    tip: 'Peak energy and confidence. You may feel your most communicative and radiant today.',
  },
  luteal: {
    label: 'Luteal',
    color: '#D873C9',
    bg: '#D873C918',
    borderColor: '#D873C940',
    gradient: ['#D873C9', '#E499DC'],
    icon: (active) => <Moon size={active ? 16 : 13} color={active ? '#fff' : '#D873C9'} strokeWidth={2.5} />,
    tip: 'Wind down and prioritise self-care. Nourishing food, rest, and gentle exercise help ease PMS.',
  },
  unknown: {
    label: 'Cycle',
    color: Colors.primary,
    bg: Colors.primary + '18',
    borderColor: Colors.primary + '40',
    gradient: [Colors.primary, Colors.primary],
    icon: (active) => <CalendarDays size={active ? 16 : 13} color={active ? '#fff' : Colors.primary} strokeWidth={2.5} />,
    tip: 'Set your cycle start date in Settings to see personalised phase insights.',
  },
};

const UI_PHASE_ORDER: UIPhase[] = ['period', 'follicular', 'ovulation', 'luteal'];

// ─── Phase calculator ──────────────────────────────────────────────────────────
// Replicates the EXACT same date-range logic as getPhaseForDate() in the store,
// using the same constants (14 days before next period = ovulation,
// 5 days before ovulation = fertile window start).
// This guarantees the phase strip is always in sync with the calendar colours.
//
// The key difference from the old hardcoded version:
//   - Period ends on day `periodLength` (not always day 5)
//   - Ovulation day = cycleLength - 14 (not always day 14)
//   - All boundaries scale with the user's actual cycleLength + periodLength
//
function buildPhaseInfo(cycleData: {
  periodStartDate: string;
  cycleLength: number;
  periodLength: number;
} | null): PhaseInfo {
  if (!cycleData) {
    return { phase: 'unknown', dayOfCycle: 0, daysRemaining: 0, cycleLength: 28, periodLength: 5 };
  }

  const OVULATION_DAYS_BEFORE_NEXT = 14;
  const FERTILE_DAYS_BEFORE_OVULATION = 5;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseISO(cycleData.periodStartDate);
  start.setHours(0, 0, 0, 0);

  const cycleLength  = cycleData.cycleLength;
  const periodLength = cycleData.periodLength;

  const daysSinceStart = differenceInDays(today, start);

  // Today is before the stored period start date → treat as day 1 of period
  if (daysSinceStart < 0) {
    return { phase: 'period', dayOfCycle: 1, daysRemaining: periodLength, cycleLength, periodLength };
  }

  // Which cycle are we in and where does it start?
  const cycleIndex = Math.floor(daysSinceStart / cycleLength);
  const cycleStart = addDays(start, cycleIndex * cycleLength);
  cycleStart.setHours(0, 0, 0, 0);

  // 1-based day within current cycle
  const dayOfCycle = differenceInDays(today, cycleStart) + 1;

  // ── Key day numbers (1-based, matching the store's date-range logic) ────────
  // Period:       day 1  ..  periodLength
  // Follicular:   periodLength+1  ..  fertileStartDay-1   (safe zone pre-fertile)
  // Fertile:      fertileStartDay ..  ovulationDayNum-1   (still follicular in UI)
  // Ovulation:    ovulationDayNum
  // Post-fertile: ovulationDayNum+1  ..  ovulationDayNum+2 (luteal in UI)
  // Luteal:       ovulationDayNum+3  ..  cycleLength
  const ovulationDayNum   = cycleLength - OVULATION_DAYS_BEFORE_NEXT + 1; // e.g. 28-14+1=15, 25-14+1=12
  const fertileStartDay   = ovulationDayNum - FERTILE_DAYS_BEFORE_OVULATION; // e.g. 15-5=10, 12-5=7
  const periodEndDay      = periodLength;                                    // e.g. 5
  const postFertileEndDay = ovulationDayNum + 2;

  let phase: UIPhase;
  let phaseEndDay: number;

  if (dayOfCycle <= periodEndDay) {
    // Period phase
    phase = 'period';
    phaseEndDay = periodEndDay;
  } else if (dayOfCycle < fertileStartDay) {
    // Safe zone before fertile window → follicular
    phase = 'follicular';
    phaseEndDay = fertileStartDay - 1;
  } else if (dayOfCycle < ovulationDayNum) {
    // Fertile window (pre-ovulation) → follicular in UI
    phase = 'follicular';
    phaseEndDay = ovulationDayNum - 1;
  } else if (dayOfCycle === ovulationDayNum) {
    // Ovulation day
    phase = 'ovulation';
    phaseEndDay = ovulationDayNum;
  } else if (dayOfCycle <= postFertileEndDay) {
    // Post-fertile (store marks these as 'fertile' too) → luteal in UI
    phase = 'luteal';
    phaseEndDay = postFertileEndDay;
  } else {
    // Safe zone after ovulation → luteal
    phase = 'luteal';
    phaseEndDay = cycleLength;
  }

  return {
    phase,
    dayOfCycle,
    daysRemaining: phaseEndDay - dayOfCycle + 1,
    cycleLength,
    periodLength,
  };
}

// ─── Floating orb ─────────────────────────────────────────────────────────────
function FloatingOrb({ color, size, style, duration = 5000 }: {
  color: string; size: number; style?: object; duration?: number;
}) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -8, duration, useNativeDriver: true }),
        Animated.timing(y, { toValue: 8, duration, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.13, transform: [{ translateY: y }] }, style]}
    />
  );
}

// ─── Shimmer ──────────────────────────────────────────────────────────────────
function Shimmer() {
  const x = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(x, { toValue: SCREEN_WIDTH * 2, duration: 2600, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: x }] }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

// ─── Cycle Phase Strip ─────────────────────────────────────────────────────────
function CyclePhaseStrip({ phaseInfo }: { phaseInfo: PhaseInfo }) {
  const mount   = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  const { phase, dayOfCycle, daysRemaining, cycleLength, periodLength } = phaseInfo;
  const meta     = PHASE_META[phase];
  const progress = cycleLength > 0 ? dayOfCycle / cycleLength : 0;

  // ── Bar zone widths, derived from the user's real cycle/period lengths ──────
  // These widths match the store's phase boundaries exactly so the coloured
  // segments always align with what the calendar is showing.
  const OVULATION_DAYS_BEFORE_NEXT    = 14;
  const FERTILE_DAYS_BEFORE_OVULATION = 5;
  const ovulationDayNum = cycleLength - OVULATION_DAYS_BEFORE_NEXT + 1; // 1-based
  const fertileStartDay = ovulationDayNum - FERTILE_DAYS_BEFORE_OVULATION;

  // Number of days in each segment
  const periodDays      = periodLength;                         // period
  const follicularDays  = fertileStartDay - 1 - periodLength;  // safe pre-fertile
  const fertileDays     = FERTILE_DAYS_BEFORE_OVULATION;        // fertile (shown as follicular)
  const ovulationDays   = 1;
  const postFertileDays = 2;
  const lutealDays      = cycleLength - (ovulationDayNum + 2); // safe post-ovulation

  const toPct = (d: number) => `${(d / cycleLength) * 100}%`;

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, delay: 120, useNativeDriver: true, tension: 55, friction: 8 }).start();
    Animated.timing(barAnim, { toValue: progress, delay: 400, duration: 1000, useNativeDriver: false }).start();
  }, [phase]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={{
      opacity: mount,
      transform: [{ translateY: mount.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
    }}>
      <View style={phaseStyles.strip}>

        {/* ── Active phase banner ── */}
        <View style={[phaseStyles.activeBanner, { backgroundColor: meta.bg, borderColor: meta.borderColor }]}>
          <LinearGradient colors={meta.gradient} style={phaseStyles.activeIconCircle}>
            {meta.icon(true)}
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[phaseStyles.activePhaseName, { color: meta.color }]}>
              {meta.label} phase
            </Text>
            <Text style={phaseStyles.activePhaseSub}>
              Day {dayOfCycle} of {cycleLength} · {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
            </Text>
          </View>
          <LinearGradient colors={meta.gradient} style={phaseStyles.dayBadge}>
            <Text style={phaseStyles.dayBadgeNumber}>{dayOfCycle}</Text>
            <Text style={phaseStyles.dayBadgeLabel}>day</Text>
          </LinearGradient>
        </View>

        {/* ── Progress bar (segmented, proportional to user's cycle) ── */}
        <View style={phaseStyles.progressSection}>
          <View style={phaseStyles.progressLabelRow}>
            <Text style={phaseStyles.progressLabel}>Cycle progress</Text>
            <Text style={[phaseStyles.progressPct, { color: meta.color }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>

          <View style={phaseStyles.barTrack}>
            {/* Coloured zone segments — widths scale with actual cycle data */}
            <View style={[phaseStyles.phaseZone, { width: toPct(periodDays),      backgroundColor: '#FF6B9D28' }]} />
            <View style={[phaseStyles.phaseZone, { width: toPct(follicularDays),  backgroundColor: '#9D71E820' }]} />
            <View style={[phaseStyles.phaseZone, { width: toPct(fertileDays),     backgroundColor: '#9D71E82C' }]} />
            <View style={[phaseStyles.phaseZone, { width: toPct(ovulationDays),   backgroundColor: '#F5A62330' }]} />
            <View style={[phaseStyles.phaseZone, { width: toPct(postFertileDays), backgroundColor: '#D873C920' }]} />
            <View style={[phaseStyles.phaseZone, { width: toPct(lutealDays),      backgroundColor: '#D873C928' }]} />

            {/* Animated progress fill */}
            <Animated.View style={[StyleSheet.absoluteFill, { right: undefined, width: barWidth, overflow: 'hidden', borderRadius: 6 }]}>
              <LinearGradient colors={meta.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
            </Animated.View>

            {/* Day cursor dot */}
            <Animated.View style={[phaseStyles.dayDot, { left: barWidth, backgroundColor: meta.color }]} />
          </View>

          <View style={phaseStyles.phaseLabelsRow}>
            {UI_PHASE_ORDER.map((p) => (
              <Text
                key={p}
                style={[
                  phaseStyles.phaseBarLabel,
                  { color: p === phase ? PHASE_META[p].color : Colors.lightText },
                  p === phase && phaseStyles.phaseBarLabelActive,
                ]}
              >
                {PHASE_META[p].label}
              </Text>
            ))}
          </View>
        </View>

        {/* ── Pills ── */}
        <Text style={phaseStyles.pillsHeading}>All phases</Text>
        <View style={phaseStyles.pills}>
          {UI_PHASE_ORDER.map((p) => {
            const isActive = p === phase;
            const pm = PHASE_META[p];
            return isActive ? (
              <LinearGradient
                key={p}
                colors={pm.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[phaseStyles.pill, phaseStyles.activePill]}
              >
                {pm.icon(true)}
                <Text style={[phaseStyles.pillText, { color: '#fff' }]}>{pm.label}</Text>
              </LinearGradient>
            ) : (
              <View key={p} style={[phaseStyles.pill, { backgroundColor: pm.bg }]}>
                {pm.icon(false)}
                <Text style={[phaseStyles.pillText, { color: pm.color, opacity: 0.6 }]}>{pm.label}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Phase tip ── */}
        <View style={[phaseStyles.tipBox, { borderColor: meta.borderColor, backgroundColor: meta.bg }]}>
          <View style={phaseStyles.tipHeader}>
            <Activity size={13} color={meta.color} strokeWidth={2.5} />
            <Text style={[phaseStyles.tipHeaderText, { color: meta.color }]}>What to expect</Text>
          </View>
          <Text style={phaseStyles.tipText}>{meta.tip}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const phaseStyles = StyleSheet.create({
  strip: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(157,113,232,0.1)',
    ...Platform.select({
      ios: { shadowColor: '#D873C9', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  activeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.base,
    borderRadius: radius.lg, borderWidth: 1,
    padding: spacing.base, marginBottom: spacing.lg,
  },
  activeIconCircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  activePhaseName: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  activePhaseSub: { fontSize: 12, color: Colors.lightText, fontWeight: '600', marginTop: 2 },
  dayBadge: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  dayBadgeNumber: { fontSize: 18, fontWeight: '900', color: '#fff', lineHeight: 20 },
  dayBadgeLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressSection: { marginBottom: spacing.lg },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  progressLabel: { fontSize: 11, fontWeight: '800', color: Colors.lightText, textTransform: 'uppercase', letterSpacing: 1.0 },
  progressPct: { fontSize: 12, fontWeight: '800' },
  barTrack: {
    height: 12, borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  phaseZone: { height: '100%' },
  dayDot: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    top: -1, marginLeft: -7,
    borderWidth: 2, borderColor: '#fff',
  },
  phaseLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  phaseBarLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.6 },
  phaseBarLabelActive: { opacity: 1, fontWeight: '900' },
  pillsHeading: { fontSize: 11, fontWeight: '800', color: Colors.lightText, letterSpacing: 1.0, textTransform: 'uppercase', marginBottom: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  activePill: { paddingHorizontal: 14, paddingVertical: 7 },
  pillText: { fontSize: 12, fontWeight: '700' },
  tipBox: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.base },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  tipHeaderText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  tipText: { fontSize: 13, fontWeight: '600', color: Colors.text, lineHeight: 20 },
});

// ─── Month summary card ────────────────────────────────────────────────────────
function MonthSummaryCard({ logCount }: { logCount: number }) {
  const mount = useRef(new Animated.Value(0)).current;
  const bar   = useRef(new Animated.Value(0)).current;
  const pct   = Math.min(logCount / 31, 1);

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, delay: 200, useNativeDriver: true, tension: 55, friction: 8 }).start();
    Animated.timing(bar, { toValue: pct, delay: 400, duration: 900, useNativeDriver: false }).start();
  }, [logCount]);

  const barWidth = bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={{ opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <LinearGradient colors={['#FF6B9D14', '#9D71E80E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={summaryStyles.card}>
        <View style={summaryStyles.left}>
          <View style={summaryStyles.iconWrap}>
            <CheckCircle2 size={20} color="#FF6B9D" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={summaryStyles.title}>This month</Text>
            <Text style={summaryStyles.sub}>{logCount} day{logCount !== 1 ? 's' : ''} logged</Text>
          </View>
        </View>
        <View style={summaryStyles.barWrap}>
          <View style={summaryStyles.barTrack}>
            <Animated.View style={{ width: barWidth, overflow: 'hidden', borderRadius: 4, height: '100%' }}>
              <LinearGradient colors={['#FF6B9D', '#9D71E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
            </Animated.View>
          </View>
          <Text style={summaryStyles.pct}>{Math.round(pct * 100)}%</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.base,
    flexDirection: 'column', gap: spacing.base,
    borderWidth: 1, borderColor: 'rgba(255,107,157,0.12)',
    ...Platform.select({
      ios: { shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  iconWrap: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FF6B9D18', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '800', color: Colors.text },
  sub:   { fontSize: 12, color: Colors.lightText, fontWeight: '600', marginTop: 2 },
  barWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(157,113,232,0.12)', overflow: 'hidden' },
  pct: { fontSize: 12, fontWeight: '800', color: Colors.primary, minWidth: 36, textAlign: 'right' },
});

// ─── Calendar wrapper card ─────────────────────────────────────────────────────
function CalendarCard({ onDayPress }: { onDayPress: (date: string) => void }) {
  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(mount, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: mount, transform: [{ scale: mount.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
      <LinearGradient colors={['#FF6B9D', '#D873C9', '#9D71E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={calStyles.border}>
        <View style={calStyles.inner}>
          <FloatingOrb color="#FF6B9D" size={100} style={{ top: -20, right: -20 }} duration={4800} />
          <FloatingOrb color="#9D71E8" size={70}  style={{ bottom: 10, left: -15 }} duration={5600} />
          <Shimmer />
          <View style={calStyles.labelRow}>
            <LinearGradient colors={['#FF6B9D30', '#9D71E828']} style={calStyles.labelPill}>
              <CalendarDays size={13} color={Colors.primary} strokeWidth={2.5} />
              <Text style={calStyles.labelText}>TAP A DAY TO LOG</Text>
            </LinearGradient>
          </View>
          <CalendarView onDayPress={onDayPress} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const calStyles = StyleSheet.create({
  border: {
    borderRadius: radius.xxl, padding: 2, overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#C060D0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 22 },
      android: { elevation: 7 },
    }),
  },
  inner: { backgroundColor: '#FFFFFF', borderRadius: radius.xxl - 2, overflow: 'hidden', paddingBottom: spacing.base },
  labelRow: { paddingTop: spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, alignItems: 'flex-start' },
  labelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.primary + '22',
  },
  labelText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.1 },
});

// ─── LogInsightCard ────────────────────────────────────────────────────────────
function LogInsightCard({ log, onOpen, onDelete }: { log: DayLog; onOpen: () => void; onDelete: () => void }) {
  const tips = useMemo(() => getInsightsForDayLog(log), [log]);

  return (
    <TouchableOpacity style={styles.insightCardWrap} onPress={onOpen} activeOpacity={0.92}>
      <LinearGradient colors={['#FF6B9D', '#D873C9', '#9D71E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.insightCardBorder}>
        <View style={styles.insightCardBody}>
          <View style={styles.insightCardTop}>
            <View style={styles.dateBlock}>
              <Text style={styles.insightDatePrimary}>{formatReadable(log.date)}</Text>
              <Text style={styles.insightDateIso}>{log.date}</Text>
            </View>
            <View style={styles.insightTopActions}>
              {log.flow ? (
                <LinearGradient
                  colors={log.flow === 'light' ? ['#FFE5F1', '#FFF0F7'] : log.flow === 'medium' ? ['#FF6B9D', '#FF8FB3'] : ['#E91E63', '#F06292']}
                  style={styles.flowBadge}
                >
                  <Text style={[styles.flowText, log.flow !== 'light' && styles.whiteText]}>{log.flow}</Text>
                </LinearGradient>
              ) : null}
              <TouchableOpacity
                style={styles.insightDeleteBtn}
                onPress={(e) => { e.stopPropagation(); onDelete(); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#FFF0F3', '#FFE8EC']} style={styles.insightDeleteInner}>
                  <Trash2 size={18} color={Colors.error} strokeWidth={2.2} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {((log.symptoms?.length ?? 0) > 0 || (log.pain ?? 0) > 0 || log.mood) ? (
            <View style={styles.metaRow}>
              {(log.symptoms || []).map((s) => (
                <View key={s} style={styles.symptomChip}>
                  <Text style={styles.symptomChipText}>{s}</Text>
                </View>
              ))}
              {(log.pain ?? 0) > 0 ? (
                <View style={styles.symptomChip}>
                  <Text style={styles.symptomChipText}>Pain {log.pain}/4</Text>
                </View>
              ) : null}
              {log.mood ? (
                <View style={[styles.symptomChip, styles.moodChip]}>
                  <Text style={styles.symptomChipText}>{log.mood}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.tipsBlock}>
            <Text style={styles.tipsLabel}>Ideas for you</Text>
            {tips.map((line, i) => (
              <View key={i} style={styles.tipLine}>
                <LinearGradient colors={[Colors.primary + 'AA', Colors.secondary + '99']} style={styles.tipDot} />
                <Text style={styles.tipLineText}>{line}</Text>
              </View>
            ))}
          </View>

          {log.notes ? <Text style={styles.insightNotes} numberOfLines={3}>"{log.notes}"</Text> : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { dayLogs, deleteDayLog, cycleData } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible]   = useState<boolean>(false);

  const handleDayPress = (date: string) => { setSelectedDate(date); setModalVisible(true); };
  const closeModal = () => setModalVisible(false);

  const contentBottom    = insets.bottom + 20;
  const headerPaddingTop = insets.top + spacing.sm;

  // ── Derive today's phase from the store's cycleData ────────────────────────
  // buildPhaseInfo() uses the identical date-range math as getPhaseForDate()
  // in the store, so the strip is always in sync with the calendar colours.
  const phaseInfo  = useMemo<PhaseInfo>(() => buildPhaseInfo(cycleData), [cycleData]);
  const activeMeta = PHASE_META[phaseInfo.phase];

  const currentMonth  = new Date().toISOString().slice(0, 7);
  const monthLogCount = useMemo(
    () => dayLogs.filter((l) => l.date.startsWith(currentMonth)).length,
    [dayLogs, currentMonth]
  );
  const sortedLogs = useMemo(
    () => [...dayLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [dayLogs]
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>

      {/* ── Header ── */}
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: headerPaddingTop }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.2)']} style={styles.headerIconWrap}>
              <CalendarDays size={24} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Calendar</Text>
              <Text style={styles.headerSubtitle}>Track your cycle</Text>
            </View>
          </View>

          {/* Phase pill in header — shows current phase + day number */}
          <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.18)']} style={styles.headerPhasePill}>
            {activeMeta.icon(false)}
            <View>
              <Text style={styles.headerPhaseLabel}>{activeMeta.label}</Text>
              {phaseInfo.dayOfCycle > 0 && (
                <Text style={styles.headerPhaseDay}>Day {phaseInfo.dayOfCycle}</Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentScroll, { paddingHorizontal: spacing.xl, paddingBottom: contentBottom }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <CalendarCard onDayPress={handleDayPress} />

        {/* Phase strip shown only when cycleData is available */}
        {cycleData ? (
          <CyclePhaseStrip phaseInfo={phaseInfo} />
        ) : (
          <View style={styles.noDataBanner}>
            <Text style={styles.noDataText}>
              Set your last period date in Settings to see your cycle phases here.
            </Text>
          </View>
        )}

        <MonthSummaryCard logCount={monthLogCount} />

        {/* ── Logs & insights ── */}
        <LinearGradient
          colors={['#2D1B4E08', '#FF6B9D10', '#9D71E815']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.insightsSection}
        >
          <LinearGradient colors={['#FFFFFF', '#FFFAFC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.insightsInner}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={[Colors.primary + '35', Colors.secondary + '35']} style={styles.sectionIconWrap}>
                <Sparkles size={22} color={Colors.primary} strokeWidth={2.4} />
              </LinearGradient>
              <View style={styles.sectionTitleBlock}>
                <Text style={styles.sectionTitle}>Your logs & insights</Text>
                <Text style={styles.sectionSubtitle}>Wellness ideas from what you saved — tap to edit</Text>
              </View>
              <View style={styles.logCount}>
                <Text style={styles.logCountText}>{dayLogs.length}</Text>
              </View>
            </View>

            {sortedLogs.length > 0 ? (
              sortedLogs.map((log) => (
                <LogInsightCard
                  key={log.date}
                  log={log}
                  onOpen={() => handleDayPress(log.date)}
                  onDelete={() => {
                    Alert.alert(
                      'Delete log',
                      `Remove log for ${formatReadable(log.date)} (${log.date})?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            await deleteDayLog(log.date);
                            if (selectedDate === log.date) closeModal();
                          },
                        },
                      ]
                    );
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <LinearGradient colors={['#FFE5F1', '#F3E8FF']} style={styles.emptyIconBubble}>
                  <TrendingUp size={40} color={Colors.primary} strokeWidth={2} />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No logs yet</Text>
                <Text style={styles.emptyText}>
                  Tap any day on the calendar to log flow, cramps, mood, and more. Insights will
                  show up here with the date — and you can delete a log anytime.
                </Text>
              </View>
            )}

            <Text style={styles.miniDisclaimer}>Tips are for wellness only, not medical advice.</Text>
          </LinearGradient>
        </LinearGradient>
      </ScrollView>

      {/* ── Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FFFFFF', '#FFF5F9', '#FFF0F8']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <FloatingOrb color="#FF6B9D" size={140} style={{ top: -30, right: -30 }} duration={4500} />
            <FloatingOrb color="#9D71E8" size={90}  style={{ bottom: 60, left: -20 }} duration={5800} />

            <View style={styles.modalHandleWrap}>
              <LinearGradient colors={['#FF6B9D', '#9D71E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalHandle} />
            </View>

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <LinearGradient colors={['#FF6B9D', '#D873C9', '#9D71E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalDateRing}>
                  <View style={styles.modalDateRingInner}>
                    <CalendarDays size={18} color={Colors.primary} strokeWidth={2.5} />
                  </View>
                </LinearGradient>
                <View>
                  <Text style={styles.modalTitle}>{selectedDate ? formatReadable(selectedDate) : ''}</Text>
                  <Text style={styles.modalSubtitle}>Log your day</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton} activeOpacity={0.8}>
                <LinearGradient colors={['#FF6B9D', '#9D71E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.closeButtonGradient}>
                  <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={['#FF6B9D30', '#9D71E828']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.modalDivider}
            />

            {selectedDate && (
              <View style={[styles.modalFormWrap, { paddingBottom: insets.bottom || spacing.xl }]}>
                <DayLogForm
                  date={selectedDate}
                  onClose={closeModal}
                  onDelete={(dateToDelete) => {
                    deleteDayLog(dateToDelete);
                    closeModal();
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBackground },

  header: {
    paddingBottom: spacing.lg, paddingHorizontal: spacing.xl,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  headerIconWrap: { width: 48, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 2, letterSpacing: 0.2 },
  headerPhasePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base, borderRadius: radius.full,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerPhaseLabel: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
  headerPhaseDay:   { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.2 },

  content:       { flex: 1 },
  contentScroll: { paddingTop: spacing.lg },

  noDataBanner: {
    marginTop: spacing.base,
    backgroundColor: Colors.primary + '12',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '22',
  },
  noDataText: { fontSize: 14, fontWeight: '600', color: Colors.lightText, textAlign: 'center', lineHeight: 20 },

  insightsSection: {
    marginTop: spacing.xl, marginBottom: spacing.xxl,
    borderRadius: radius.xxl, padding: 2, overflow: 'visible',
    ...Platform.select({
      ios: { shadowColor: '#9D71E8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24 },
      android: { elevation: 6 },
    }),
  },
  insightsInner: { borderRadius: radius.xxl - 1, padding: spacing.xl, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  sectionIconWrap: { width: 48, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  sectionTitleBlock: { flex: 1, marginLeft: spacing.base, minWidth: 0 },
  sectionTitle:    { fontSize: 20, fontWeight: '800', color: Colors.text, letterSpacing: 0.2 },
  sectionSubtitle: { fontSize: 13, fontWeight: '600', color: Colors.lightText, marginTop: 4, lineHeight: 18 },
  logCount: {
    backgroundColor: Colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    minWidth: 32, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  logCountText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },

  insightCardWrap:   { marginBottom: spacing.lg },
  insightCardBorder: { borderRadius: radius.xl, padding: 2 },
  insightCardBody:   { backgroundColor: '#FFFFFF', borderRadius: radius.xl - 2, padding: spacing.lg },
  insightCardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  dateBlock:         { flex: 1, minWidth: 0 },
  insightDatePrimary: { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: 0.2 },
  insightDateIso:    { marginTop: 4, fontSize: 12, fontWeight: '700', color: Colors.lightText, letterSpacing: 0.5 },
  insightTopActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 0 },
  insightDeleteBtn:  { borderRadius: radius.md, overflow: 'hidden' },
  insightDeleteInner: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  symptomChip: {
    backgroundColor: Colors.lightBackground, paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1, borderColor: Colors.primary + '22',
  },
  moodChip:       { borderColor: Colors.secondary + '33', backgroundColor: Colors.secondary + '12' },
  symptomChipText: { fontSize: 12, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  tipsBlock: {
    backgroundColor: Colors.lightBackground, borderRadius: radius.lg, padding: spacing.base,
    borderWidth: 1, borderColor: Colors.primary + '14',
  },
  tipsLabel:   { fontSize: 11, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  tipLine:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  tipDot:      { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  tipLineText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text, lineHeight: 21 },
  insightNotes: { marginTop: spacing.md, fontSize: 13, fontStyle: 'italic', color: Colors.lightText, lineHeight: 20 },
  miniDisclaimer: { marginTop: spacing.lg, textAlign: 'center', fontSize: 11, fontWeight: '600', color: Colors.lightText, opacity: 0.85 },
  flowBadge: {
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: radius.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  flowText:   { fontSize: 12, color: Colors.text, fontWeight: '700', textTransform: 'capitalize', letterSpacing: 0.2 },
  whiteText:  { color: '#FFFFFF' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.base },
  emptyIconBubble: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: spacing.sm },
  emptyText:  { textAlign: 'center', color: Colors.lightText, fontSize: 15, fontWeight: '600', lineHeight: 22 },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.52)' },
  modalContent: {
    borderTopLeftRadius: radius.xxl + 4, borderTopRightRadius: radius.xxl + 4,
    minHeight: '72%', maxHeight: '90%', overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#C060D0', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.28, shadowRadius: 24 },
      android: { elevation: 18 },
    }),
  },
  modalFormWrap:   { flex: 1, minHeight: 320 },
  modalHandleWrap: { alignItems: 'center', paddingTop: spacing.base, paddingBottom: spacing.xs },
  modalHandle:     { width: 44, height: 5, borderRadius: 3 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.base + 2,
  },
  modalHeaderLeft:    { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  modalDateRing:      { width: 48, height: 48, borderRadius: 16, padding: 2, justifyContent: 'center', alignItems: 'center' },
  modalDateRingInner: { width: '100%', height: '100%', borderRadius: 14, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  modalTitle:    { fontSize: 20, fontWeight: '800', color: Colors.text, letterSpacing: 0.2 },
  modalSubtitle: { fontSize: 13, fontWeight: '600', color: Colors.lightText, marginTop: 2 },
  closeButton:         { borderRadius: radius.lg, overflow: 'hidden' },
  closeButtonGradient: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  modalDivider: { height: 1.5, marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderRadius: 1 },
});