import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

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

const KEYS = {
  LAST_SCHEDULED: "@app:lastScheduledAt",
  TIP_INDEX: "@app:tipIndex",
};

const IOS_MAX_SCHEDULED = 60;

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  periodAlerts: true,
  fertileAlerts: true,
  ovulationAlerts: true,
  safeDayAlerts: false,
  dailyTips: true,
  preferredHour: 8,
  preferredMinute: 0,
};

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

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toYMD(date: Date): string {
  return date.toISOString().split("T")[0];
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = new Date(end);   e.setHours(0, 0, 0, 0);
  return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
}

function setTime(date: Date, hour: number, minute: number): Date {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function getNextKeyDates(cycleData: NotificationCycleData, totalCycles = 3) {
  const { lastPeriodStart, cycleLength, periodDuration } = cycleData;
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: totalCycles }, (_, i) => {
    const cycleStart   = addDays(start, i * cycleLength);
    const periodEnd    = addDays(cycleStart, periodDuration - 1);
    const ovulationDay = addDays(cycleStart, cycleLength - 14);
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd   = addDays(ovulationDay, -1);
    return { cycle: i + 1, cycleStart, periodEnd, fertileStart, fertileEnd, ovulationDay };
  });
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
    const cycleStart   = addDays(start, i * cycleLength);
    const periodEnd    = addDays(cycleStart, periodDuration - 1);
    const ovulationDay = addDays(cycleStart, cycleLength - 14);
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd   = addDays(ovulationDay, -1);
    const nextPeriod   = addDays(cycleStart, cycleLength);

    if (isBetween(date, cycleStart, periodEnd)) return "period";
    if (isBetween(date, addDays(periodEnd, 1), addDays(fertileStart, -1))) return "safe";
    if (isBetween(date, fertileStart, fertileEnd)) return "fertile";
    if (toYMD(date) === toYMD(ovulationDay)) return "ovulation";
    if (isBetween(date, addDays(ovulationDay, 1), addDays(ovulationDay, 2))) return "fertile";
    if (isBetween(date, addDays(ovulationDay, 3), addDays(nextPeriod, -1))) return "safe";
  }
  return "safe";
}

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

function buildCycleNotifications(
  cycleData: NotificationCycleData,
  settings: NotificationSettings
): NotificationItem[] {
  const { preferredHour, preferredMinute } = settings;
  const queue: NotificationItem[] = [];
  const now = new Date();
  const keyDates = getNextKeyDates(cycleData, 3);

  for (const cycle of keyDates) {
    const c = cycle.cycle;

    if (settings.periodAlerts) {
      queue.push(
        {
          id: `period-2days-cycle${c}`,
          title: "Period Coming Soon 🔴",
          body: "Your period is expected in 2 days. Be prepared 💊",
          triggerDate: setTime(addDays(cycle.cycleStart, -2), preferredHour, preferredMinute),
          phase: "period",
        },
        {
          id: `period-1day-cycle${c}`,
          title: "Period Tomorrow 🔴",
          body: "Your period is expected tomorrow. Stock up on supplies 🧴",
          triggerDate: setTime(addDays(cycle.cycleStart, -1), preferredHour, preferredMinute),
          phase: "period",
        },
        {
          id: `period-start-cycle${c}`,
          title: "Period Started 🔴",
          body: "Your period likely started today. Remember to log it 📝",
          triggerDate: setTime(cycle.cycleStart, preferredHour, preferredMinute),
          phase: "period",
        },
        {
          id: `period-ending-cycle${c}`,
          title: "Period Ending Soon 🔴",
          body: "Your period should be ending in a day or two 🌿",
          triggerDate: setTime(addDays(cycle.periodEnd, -1), preferredHour, preferredMinute),
          phase: "period",
        }
      );
    }

    if (settings.fertileAlerts) {
      queue.push(
        {
          id: `fertile-1day-cycle${c}`,
          title: "Fertile Window Tomorrow 🟡",
          body: "Your fertile window opens tomorrow. Plan accordingly 🌱",
          triggerDate: setTime(addDays(cycle.fertileStart, -1), preferredHour, preferredMinute),
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
          triggerDate: setTime(addDays(cycle.fertileStart, 2), preferredHour, preferredMinute),
          phase: "fertile",
        },
        {
          id: `fertile-post-ovulation-cycle${c}`,
          title: "Still Fertile 🟡",
          body: "You are still in a fertile window today — the egg is still viable",
          triggerDate: setTime(addDays(cycle.ovulationDay, 1), preferredHour, preferredMinute),
          phase: "fertile",
        }
      );
    }

    if (settings.ovulationAlerts) {
      queue.push(
        {
          id: `ovulation-1day-cycle${c}`,
          title: "Ovulation Tomorrow 🌸",
          body: "Your ovulation day is tomorrow — peak fertility approaching",
          triggerDate: setTime(addDays(cycle.ovulationDay, -1), preferredHour, preferredMinute),
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
  }

  return queue.filter((item) => item.triggerDate > now);
}

// Schedules two tips per day:
//   Morning  → 30 min after preferredHour:preferredMinute (default 8:30 AM)
//   Afternoon → fixed at 3:00 PM
// 7 days × 2 tips = 14 slots, leaving 46 slots for cycle alerts.
async function buildDailyTips(
  cycleData: NotificationCycleData,
  settings: NotificationSettings,
  daysAhead = 7
): Promise<NotificationItem[]> {
  if (!settings.dailyTips) return [];

  const { preferredHour, preferredMinute } = settings;
  const queue: NotificationItem[] = [];
  const now = new Date();

  // Morning tip: 30 min after preferred time (default 8:30 AM)
  const morningMinute = (preferredMinute + 30) % 60;
  const morningHour   = preferredMinute + 30 >= 60 ? preferredHour + 1 : preferredHour;

  // Afternoon tip: fixed at 3:00 PM
  const afternoonHour   = 15;
  const afternoonMinute = 0;

  for (let i = 0; i < daysAhead; i++) {
    const baseDate = addDays(now, i);
    const phase    = getPhaseForDate(baseDate, cycleData);

    // Morning tip
    const morningTrigger = setTime(baseDate, morningHour, morningMinute);
    if (morningTrigger > now) {
      const morningTip = await getNextTip(phase);
      queue.push({
        id: `daily-tip-morning-${toYMD(baseDate)}`,
        title: morningTip.title,
        body:  morningTip.body,
        triggerDate: morningTrigger,
        phase: "tip",
      });
    }

    // Afternoon tip
    const afternoonTrigger = setTime(baseDate, afternoonHour, afternoonMinute);
    if (afternoonTrigger > now) {
      const afternoonTip = await getNextTip(phase);
      queue.push({
        id: `daily-tip-afternoon-${toYMD(baseDate)}`,
        title: afternoonTip.title,
        body:  afternoonTip.body,
        triggerDate: afternoonTrigger,
        phase: "tip",
      });
    }
  }

  return queue;
}

async function askUserForNotificationConsent(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "Allow notifications?",
      "Aurelle would like to send you gentle reminders about your cycle and wellness. You can change this anytime in Settings.",
      [
        { text: "Not now", style: "cancel", onPress: () => resolve(false) },
        { text: "Allow",                    onPress: () => resolve(true)  },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

async function ensurePermission(): Promise<"granted" | "denied"> {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === "granted") return "granted";

  if (status === "undetermined") {
    const userConsented = await askUserForNotificationConsent();
    if (!userConsented) return "denied";
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === "granted" ? "granted" : "denied";
  }

  return "denied";
}

export function useNotifications() {
  const settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  const settingsLoaded = true;

  async function scheduleAllNotifications(
    cycleData: NotificationCycleData,
    settingsOverride?: NotificationSettings
  ) {
    if (Platform.OS === "web") return;

    try {
      const permission = await ensurePermission();
      if (permission !== "granted") {
        console.log("[Notifications] Permission not granted — skipping schedule.");
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("period-tracker", {
          name: "Period & cycle",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }

      const s = settingsOverride ?? settings;

      await Notifications.cancelAllScheduledNotificationsAsync();

      const cycleQueue = buildCycleNotifications(cycleData, s);
      const tipsQueue  = await buildDailyTips(cycleData, s, 7); // 7 days × 2 tips = 14 slots

      const sorted = [...cycleQueue, ...tipsQueue]
        .sort((a, b) => a.triggerDate.getTime() - b.triggerDate.getTime())
        .slice(0, IOS_MAX_SCHEDULED);

      let scheduled = 0;
      for (const item of sorted) {
        try {
          await Notifications.scheduleNotificationAsync({
            identifier: item.id,
            content: {
              title: item.title,
              body:  item.body,
              sound: "default",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: item.triggerDate,
            },
          });
          scheduled++;
        } catch (err) {
          console.warn(`[Notifications] Failed to schedule "${item.id}":`, err);
        }
      }

      await AsyncStorage.setItem(KEYS.LAST_SCHEDULED, new Date().toISOString());
      console.log(`[Notifications] ✅ Scheduled ${scheduled} notifications`);
    } catch (error) {
      console.error("[Notifications] ❌ Failed to schedule notifications:", error);
    }
  }

  async function cancelAllNotifications() {
    if (Platform.OS === "web") return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(KEYS.LAST_SCHEDULED);
    console.log("[Notifications] 🔕 All notifications cancelled");
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
    const needed = await shouldReschedule();
    if (needed) {
      await scheduleAllNotifications(cycleData, settingsOverride ?? settings);
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