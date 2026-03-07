import { useRef, useEffect } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import {
  useNotifications,
  type NotificationCycleData,
} from "@/hooks/useNotifications";
import type { CycleData } from "@/types";

function toNotificationCycleData(c: CycleData): NotificationCycleData {
  return {
    lastPeriodStart: c.periodStartDate,
    cycleLength: c.cycleLength,
    periodDuration: c.periodLength,
  };
}

function isValidCycleData(c: CycleData | null): c is CycleData {
  if (!c?.periodStartDate) return false;
  const d = new Date(c.periodStartDate);
  return !Number.isNaN(d.getTime()) && c.periodLength > 0 && c.cycleLength > 0;
}

/**
 * Runs inside AppStoreProvider. On app open: rescheduleIfNeeded (only if > 7 days).
 * When cycleData or notification settings change after that: full schedule.
 * No permission prompts — assumes OS already granted.
 */
export function NotificationScheduler(): null {
  const { cycleData, user } = useAppStore();
  const {
    rescheduleIfNeeded,
    scheduleAllNotifications,
    settings,
    settingsLoaded,
  } = useNotifications();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!settingsLoaded || user?.isPregnant || !isValidCycleData(cycleData))
      return;

    const payload = toNotificationCycleData(cycleData!);

    if (!initialLoadDone.current) {
      rescheduleIfNeeded(payload, settings);
      initialLoadDone.current = true;
    } else {
      scheduleAllNotifications(payload, settings);
    }
    // Only re-run when data/settings actually change, not when hook function refs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleData, settings, settingsLoaded, user?.isPregnant]);

  return null;
}
