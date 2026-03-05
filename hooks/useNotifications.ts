import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface NotificationCycleData {
  lastPeriodStart: string; // "YYYY-MM-DD"
  cycleLength: number;
  periodDuration: number;
}

export interface NotificationSettings {
  periodAlerts: boolean;
  fertileAlerts: boolean;
  ovulationAlerts: boolean;
  safeDayAlerts: boolean;
  dailyTips: boolean;
  preferredHour: number;
  preferredMinute: number;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  triggerDate: Date;
  phase: "period" | "fertile" | "ovulation" | "safe" | "tip";
}

// ─────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────

const KEYS = {
  LAST_SCHEDULED: "@app:lastScheduledAt",
  TIP_INDEX: "@app:tipIndex",
};

// ─────────────────────────────────────────────────────────────
// DEFAULT NOTIFICATION SETTINGS
// ─────────────────────────────────────────────────────────────

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  periodAlerts: true,
  fertileAlerts: true,
  ovulationAlerts: true,
  safeDayAlerts: false,
  dailyTips: true,
  preferredHour: 8,
  preferredMinute: 0,
};

// ─────────────────────────────────────────────────────────────
// DAILY TIPS BANK (phase-aware)
// ─────────────────────────────────────────────────────────────

const TIPS = {
  period: [
    { title: "Period Tip 🔴", body: "Staying hydrated can help reduce bloating and cramps 💧" },
    { title: "Period Tip 🔴", body: "Light movement like walking or yoga can ease period pain 🧘🏽‍♀️" },
    { title: "Period Tip 🔴", body: "Iron-rich foods like spinach and beans help replace what your body loses 🥬" },
    { title: "Period Tip 🔴", body: "A heating pad on your lower abdomen for 15–20 mins helps with cramps 🌡️" },
    { title: "Period Tip 🔴", body: "Dark chocolate (70%+) can actually help with mood swings 🍫" },
  ],
  safe: [
    { title: "Wellness Tip 🟢", body: "Your energy is rising — great time to start a new workout routine 💪🏽" },
    { title: "Wellness Tip 🟢", body: "Leafy greens this week support healthy estrogen balance 🥗" },
    { title: "Wellness Tip 🟢", body: "Great week to schedule checkups or focus on self-care 🌿" },
    { title: "Wellness Tip 🟢", body: "Reducing caffeine and salt helps reduce bloating later in your cycle 🫖" },
    { title: "Wellness Tip 🟢", body: "Getting 7–8 hours of sleep helps regulate your hormones 😴" },
  ],
  fertile: [
    { title: "Fertile Window Tip 🟡", body: "Your energy and confidence are naturally higher this week ✨" },
    { title: "Fertile Window Tip 🟡", body: "Zinc-rich foods like pumpkin seeds support reproductive health 🌱" },
    { title: "Fertile Window Tip 🟡", body: "Your body temperature rises slightly during fertile days — totally normal 🌡️" },
  ],
  ovulation: [
    { title: "Ovulation Tip 🌸", body: "You're at peak fertility today — your body is working hard 🌸" },
    { title: "Ovulation Tip 🌸", body: "Feeling more social or energetic? Ovulation naturally boosts mood 😊" },
    { title: "Ovulation Tip 🌸", body: "Staying active today supports hormonal balance 🏃🏽‍♀️" },
  ],
};

// ─────────────────────────────────────────────────────────────
// DATE UTILITIES
// ─────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function toYMD(date: Date): string {
  return date.toISOString().split("T")[0];
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  d.setHours(0, 0, 0, 0);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
}

function setTime(date: Date, hour: number, minute: number): Date {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

// ─────────────────────────────────────────────────────────────
// CYCLE CALCULATION
// ─────────────────────────────────────────────────────────────

function getNextKeyDates(cycleData: NotificationCycleData, totalCycles = 3) {
  const { lastPeriodStart, cycleLength, periodDuration } = cycleData;
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);

  const keyDates = [];

  for (let i = 0; i < totalCycles; i++) {
    const cycleStart = addDays(start, i * cycleLength);
    const periodEnd = addDays(cycleStart, periodDuration - 1);
    const ovulationDay = addDays(cycleStart, cycleLength - 14);
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd = addDays(ovulationDay, -1);
    const postFertileStart = addDays(ovulationDay, 1);
    const postFertileEnd = addDays(ovulationDay, 2);

    keyDates.push({
      cycle: i + 1,
      periodStart: cycleStart,
      periodEnd,
      fertileStart,
      fertileEnd,
      ovulationDay,
      postFertileStart,
      postFertileEnd,
    });
  }

  return keyDates;
}

function getPhaseForDate(
  date: Date,
  cycleData: NotificationCycleData,
  totalCycles = 4
): "period" | "fertile" | "ovulation" | "safe" {
  const { lastPeriodStart, cycleLength, periodDuration } = cycleData;
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < totalCycles; i++) {
    const cycleStart = addDays(start, i * cycleLength);
    const periodEnd = addDays(cycleStart, periodDuration - 1);
    const ovulationDay = addDays(cycleStart, cycleLength - 14);
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd = addDays(ovulationDay, -1);
    const nextPeriod = addDays(cycleStart, cycleLength);

    if (isBetween(date, cycleStart, periodEnd)) return "period";
    if (isBetween(date, addDays(periodEnd, 1), addDays(fertileStart, -1))) return "safe";
    if (isBetween(date, fertileStart, fertileEnd)) return "fertile";
    if (toYMD(date) === toYMD(ovulationDay)) return "ovulation";
    if (isBetween(date, addDays(ovulationDay, 1), addDays(ovulationDay, 2))) return "fertile";
    if (isBetween(date, addDays(ovulationDay, 3), addDays(nextPeriod, -1))) return "safe";
  }

  return "safe";
}

// ─────────────────────────────────────────────────────────────
// TIP ROTATION
// ─────────────────────────────────────────────────────────────

async function getNextTip(phase: "period" | "fertile" | "ovulation" | "safe") {
  const raw = await AsyncStorage.getItem(KEYS.TIP_INDEX);
  const indices = raw
    ? JSON.parse(raw)
    : { period: 0, fertile: 0, ovulation: 0, safe: 0 };

  const tipBank = TIPS[phase];
  const currentIndex = indices[phase] % tipBank.length;
  const tip = tipBank[currentIndex];

  indices[phase] = (currentIndex + 1) % tipBank.length;
  await AsyncStorage.setItem(KEYS.TIP_INDEX, JSON.stringify(indices));

  return tip;
}

// ─────────────────────────────────────────────────────────────
// BUILD NOTIFICATION QUEUE
// ─────────────────────────────────────────────────────────────

function buildCycleNotifications(
  cycleData: NotificationCycleData,
  settings: NotificationSettings
): NotificationItem[] {
  const { preferredHour, preferredMinute } = settings;
  const queue: NotificationItem[] = [];
  const keyDates = getNextKeyDates(cycleData, 3);
  const now = new Date();

  for (const cycle of keyDates) {
    const c = cycle.cycle;

    if (settings.periodAlerts) {
      const twoDaysBefore = addDays(cycle.periodStart, -2);
      const oneDayBefore = addDays(cycle.periodStart, -1);
      const endingSoon = addDays(cycle.periodEnd, -1);

      queue.push(
        {
          id: `period-2days-cycle${c}`,
          title: "Period Coming Soon 🔴",
          body: "Your period is expected in 2 days. Be prepared 💊",
          triggerDate: setTime(twoDaysBefore, preferredHour, preferredMinute),
          phase: "period",
        },
        {
          id: `period-1day-cycle${c}`,
          title: "Period Tomorrow 🔴",
          body: "Your period is expected tomorrow. Stock up on supplies 🧴",
          triggerDate: setTime(oneDayBefore, preferredHour, preferredMinute),
          phase: "period",
        },
        {
          id: `period-start-cycle${c}`,
          title: "Period Started 🔴",
          body: "Your period likely started today. Remember to log it 📝",
          triggerDate: setTime(cycle.periodStart, preferredHour, preferredMinute),
          phase: "period",
        },
        {
          id: `period-ending-cycle${c}`,
          title: "Period Ending Soon 🔴",
          body: "Your period should be ending in a day or two 🌿",
          triggerDate: setTime(endingSoon, preferredHour, preferredMinute),
          phase: "period",
        }
      );
    }

    if (settings.fertileAlerts) {
      const fertileOneDayBefore = addDays(cycle.fertileStart, -1);
      const fertileMidpoint = addDays(cycle.fertileStart, 2);

      queue.push(
        {
          id: `fertile-1day-cycle${c}`,
          title: "Fertile Window Tomorrow 🟡",
          body: "Your fertile window opens tomorrow. Plan accordingly 🌱",
          triggerDate: setTime(fertileOneDayBefore, preferredHour, preferredMinute),
          phase: "fertile",
        },
        {
          id: `fertile-start-cycle${c}`,
          title: "Fertile Window Open 🟡",
          body: "You are now in your fertile window 🌱",
          triggerDate: setTime(cycle.fertileStart, preferredHour, preferredMinute),
          phase: "fertile",
        },
        {
          id: `fertile-mid-cycle${c}`,
          title: "Fertile Window 🟡",
          body: "You have 2 days left in your fertile window",
          triggerDate: setTime(fertileMidpoint, preferredHour, preferredMinute),
          phase: "fertile",
        }
      );
    }

    if (settings.ovulationAlerts) {
      const ovulationOneDayBefore = addDays(cycle.ovulationDay, -1);

      queue.push(
        {
          id: `ovulation-1day-cycle${c}`,
          title: "Ovulation Tomorrow 🌸",
          body: "Your ovulation day is tomorrow — peak fertility approaching",
          triggerDate: setTime(ovulationOneDayBefore, preferredHour, preferredMinute),
          phase: "ovulation",
        },
        {
          id: `ovulation-day-cycle${c}`,
          title: "Ovulation Day 🌸",
          body: "You are ovulating today — peak fertility 🌸",
          triggerDate: setTime(cycle.ovulationDay, preferredHour, preferredMinute),
          phase: "ovulation",
        }
      );
    }

    if (settings.fertileAlerts) {
      const postFertileStart = addDays(cycle.ovulationDay, 1);
      queue.push({
        id: `fertile-post-ovulation-cycle${c}`,
        title: "Still Fertile 🟡",
        body: "You are still in a fertile window today — the egg is still viable",
        triggerDate: setTime(postFertileStart, preferredHour, preferredMinute),
        phase: "fertile",
      });
    }
  }

  return queue.filter((item) => item.triggerDate > now);
}

async function buildDailyTips(
  cycleData: NotificationCycleData,
  settings: NotificationSettings,
  daysAhead = 30
): Promise<NotificationItem[]> {
  if (!settings.dailyTips) return [];

  const { preferredHour, preferredMinute } = settings;
  const queue: NotificationItem[] = [];
  const now = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const baseDate = addDays(now, i);
    const phase = getPhaseForDate(baseDate, cycleData);

    // First slot: 30 minutes after preferred time on that day
    const firstSlot = setTime(
      baseDate,
      preferredHour,
      (preferredMinute + 30) % 60
    );

    // Then every 2 hours after that, staying within the same calendar day
    for (let slot = 0; slot < 12; slot++) {
      const trigger = addHours(firstSlot, slot * 2);
      if (toYMD(trigger) !== toYMD(baseDate)) break;

      const tip = await getNextTip(phase);

      queue.push({
        id: `daily-tip-${toYMD(baseDate)}-${slot}`,
        title: tip.title,
        body: tip.body,
        triggerDate: trigger,
        phase: "tip",
      });
    }
  }

  return queue.filter((item) => item.triggerDate > now);
}

// ─────────────────────────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────────────────────────

export function useNotifications() {
  // All notifications are always on; no user toggles — use defaults only
  const settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  const settingsLoaded = true;

  async function scheduleAllNotifications(
    cycleData: NotificationCycleData,
    settingsOverride?: NotificationSettings
  ) {
    const s = settingsOverride ?? settings;
    if (Platform.OS === "web") return;

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("period-tracker", {
          name: "Period & cycle",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const cycleQueue = buildCycleNotifications(cycleData, s);
      const tipsQueue = await buildDailyTips(cycleData, s, 30);
      const fullQueue = [...cycleQueue, ...tipsQueue];

      for (const item of fullQueue) {
        await Notifications.scheduleNotificationAsync({
          identifier: item.id,
          content: {
            title: item.title,
            body: item.body,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: item.triggerDate,
          },
        });
      }

      await AsyncStorage.setItem(KEYS.LAST_SCHEDULED, new Date().toISOString());
      console.log(`✅ Scheduled ${fullQueue.length} notifications`);
    } catch (error) {
      console.error("❌ Failed to schedule notifications:", error);
    }
  }

  async function cancelAllNotifications() {
    if (Platform.OS === "web") return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(KEYS.LAST_SCHEDULED);
    console.log("🔕 All notifications cancelled");
  }

  async function shouldReschedule(): Promise<boolean> {
    const raw = await AsyncStorage.getItem(KEYS.LAST_SCHEDULED);
    if (!raw) return true;
    const lastScheduled = new Date(raw);
    const daysSince = (Date.now() - lastScheduled.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  }

  async function rescheduleIfNeeded(
    cycleData: NotificationCycleData | null,
    settingsOverride?: NotificationSettings | null
  ) {
    if (!cycleData || Platform.OS === "web") return;
    const s = settingsOverride ?? settings;
    const needed = await shouldReschedule();
    if (needed) {
      await scheduleAllNotifications(cycleData, s);
    }
  }

  return {
    scheduleAllNotifications,
    cancelAllNotifications,
    rescheduleIfNeeded,
    shouldReschedule,
    settings,
    settingsLoaded,
  };
}
