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

export function NotificationScheduler(): null {
  const { cycleData, user } = useAppStore();

  // FIX: settings removed from destructure — the hook owns settings internally,
  // so we no longer need to pass it back in. This removes the need for
  // eslint-disable-next-line and makes the dependency array fully honest.
  const { rescheduleIfNeeded, scheduleAllNotifications, settingsLoaded } =
    useNotifications();

  const initialLoadDone = useRef(false);

  const cycleKey = isValidCycleData(cycleData)
    ? `${cycleData.periodStartDate}|${cycleData.periodLength}|${cycleData.cycleLength}`
    : null;

  useEffect(() => {
    if (!settingsLoaded || user?.isPregnant || !isValidCycleData(cycleData) || !cycleKey) return;

    const payload = toNotificationCycleData(cycleData);

    if (!initialLoadDone.current) {
      // First mount: only reschedule if >7 days since last schedule
      rescheduleIfNeeded(payload);
      initialLoadDone.current = true;
    } else {
      // cycleData changed: do a full reschedule
      scheduleAllNotifications(payload);
    }
  // All deps are stable primitives or stable function refs — no eslint-disable needed
  }, [cycleKey, settingsLoaded, user?.isPregnant, rescheduleIfNeeded, scheduleAllNotifications]);

  return null;
}