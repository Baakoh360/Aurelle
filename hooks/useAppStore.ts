import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { addDays, format, parseISO, differenceInDays, isWithinInterval } from '@/utils/dateUtils';
import { User, CycleData, DayLog, CalendarDay, CycleDayType, PregnancyData } from '@/types';
// Default values
const DEFAULT_CYCLE_LENGTH = 25;
const DEFAULT_PERIOD_LENGTH = 5;
const DEFAULT_PERIOD_START_DATE = '2026-01-15';

// ---------------------------------------------------------------------------
// MENSTRUAL CYCLE CALCULATOR (date-range based)
// Period, Safe, Fertile, Ovulation based on last period start + cycle length.
// Phases: Period → Safe1 (after period, before fertile) → Fertile (5 days before ovulation) → Ovulation (1 day) → Safe2 (after ovulation).
// ---------------------------------------------------------------------------
const OVULATION_DAYS_BEFORE_NEXT_PERIOD = 14;  // ovulation = cycleStart + (cycleLength - 14)
const FERTILE_DAYS_BEFORE_OVULATION = 5;       // fertile = ovulationDay - 5 through ovulationDay - 1 (5 days, not including ovulation)

export const [AppStoreProvider, useAppStore] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [dayLogs, setDayLogs] = useState<DayLog[]>([]);
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from AsyncStorage on mount. Never overwrite or reset saved data — only read what was persisted.
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const cycleDataRaw = await AsyncStorage.getItem('cycleData');
        const dayLogsData = await AsyncStorage.getItem('dayLogs');
        const pregnancyDataRaw = await AsyncStorage.getItem('pregnancyData');

        let parsedUser = null;
        let parsedCycleData = null;
        let parsedDayLogs: DayLog[] = [];
        let parsedPregnancyData = null;
        try {
          if (userData) parsedUser = JSON.parse(userData);
        } catch (_) { /* keep null */ }
        try {
          if (cycleDataRaw) parsedCycleData = JSON.parse(cycleDataRaw);
        } catch (_) { /* keep null */ }
        try {
          if (dayLogsData) parsedDayLogs = JSON.parse(dayLogsData);
        } catch (_) { /* keep [] */ }
        try {
          if (pregnancyDataRaw) parsedPregnancyData = JSON.parse(pregnancyDataRaw);
        } catch (_) { /* keep null */ }

        if (parsedUser) setUser(parsedUser);
        setCycleData(parsedCycleData);
        setDayLogs(Array.isArray(parsedDayLogs) ? parsedDayLogs : []);
        if (parsedPregnancyData) setPregnancyData(parsedPregnancyData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save user data to AsyncStorage
  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Save cycle data to AsyncStorage — this is the only place we write cycle data; it will persist across app restarts.
  const saveCycleData = async (data: CycleData) => {
    try {
      await AsyncStorage.setItem('cycleData', JSON.stringify(data));
      setCycleData(data);
    } catch (error) {
      console.error('Error saving cycle data:', error);
    }
  };

  // Save day log to AsyncStorage
  const saveDayLog = async (log: DayLog) => {
    try {
      const updatedLogs = [...dayLogs.filter((l: DayLog) => l.date !== log.date), log];
      await AsyncStorage.setItem('dayLogs', JSON.stringify(updatedLogs));
      setDayLogs(updatedLogs);
    } catch (error) {
      console.error('Error saving day log:', error);
    }
  };

  // Delete day log by date
  const deleteDayLog = async (date: string) => {
    try {
      const updatedLogs = dayLogs.filter((l: DayLog) => l.date !== date);
      await AsyncStorage.setItem('dayLogs', JSON.stringify(updatedLogs));
      setDayLogs(updatedLogs);
    } catch (error) {
      console.error('Error deleting day log:', error);
    }
  };

  // Save pregnancy data to AsyncStorage
  const savePregnancyData = async (data: PregnancyData) => {
    try {
      await AsyncStorage.setItem('pregnancyData', JSON.stringify(data));
      setPregnancyData(data);
    } catch (error) {
      console.error('Error saving pregnancy data:', error);
    }
  };

  // Toggle pregnancy mode
  const togglePregnancyMode = async (isPregnant: boolean, conceptionDate?: string) => {
    if (!user) return;

    const updatedUser = { ...user, isPregnant, conceptionDate: isPregnant ? conceptionDate : undefined };
    await saveUser(updatedUser);

    if (isPregnant && conceptionDate) {
      // Calculate due date (approximately 280 days after conception)
      const dueDate = addDays(parseISO(conceptionDate), 280);
      const pregnancyData = {
        conceptionDate,
        dueDate: format(dueDate, 'yyyy-MM-dd')
      };
      await savePregnancyData(pregnancyData);
    } else {
      await AsyncStorage.removeItem('pregnancyData');
      setPregnancyData(null);
    }
  };

  // Get phase for a single date (date-range logic from menstrual cycle calculator).
  const getPhaseForDate = (date: Date): CycleDayType => {
    if (!cycleData || user?.isPregnant) return null;
    const start = parseISO(cycleData.periodStartDate);
    start.setHours(0, 0, 0, 0);
    const cycleLength = cycleData.cycleLength || DEFAULT_CYCLE_LENGTH;
    const periodDuration = cycleData.periodLength || DEFAULT_PERIOD_LENGTH;
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const daysSinceStart = differenceInDays(target, start);
    const cycleIndex = Math.floor(daysSinceStart / cycleLength);
    const cycleStart = addDays(start, cycleIndex * cycleLength);
    cycleStart.setHours(0, 0, 0, 0);

    const ovulationDay = addDays(cycleStart, cycleLength - OVULATION_DAYS_BEFORE_NEXT_PERIOD);
    const fertileStart = addDays(ovulationDay, -FERTILE_DAYS_BEFORE_OVULATION);
    const fertileEnd = addDays(ovulationDay, -1);
    const periodEnd = addDays(cycleStart, periodDuration - 1);
    const nextPeriod = addDays(cycleStart, cycleLength);
    const safePhase1Start = addDays(periodEnd, 1);
    const safePhase1End = addDays(fertileStart, -1);
    const postFertileStart = addDays(ovulationDay, 1);
    const postFertileEnd = addDays(ovulationDay, 2);
    const safePhase2Start = addDays(ovulationDay, 3);
    const safePhase2End = addDays(nextPeriod, -1);

    if (isWithinInterval(target, { start: cycleStart, end: periodEnd })) return 'period';
    if (isWithinInterval(target, { start: safePhase1Start, end: safePhase1End })) return 'safe';
    if (isWithinInterval(target, { start: fertileStart, end: fertileEnd })) return 'fertile';
    if (format(target, 'yyyy-MM-dd') === format(ovulationDay, 'yyyy-MM-dd')) return 'ovulation';
    if (isWithinInterval(target, { start: postFertileStart, end: postFertileEnd })) return 'fertile';
    if (isWithinInterval(target, { start: safePhase2Start, end: safePhase2End })) return 'safe';
    return null;
  };

  // Calculate calendar data for the current month using date-range phase logic.
  const getCalendarData = (month: Date): CalendarDay[] => {
    if (!cycleData) return [];

    const today = new Date();
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const calendarDays: CalendarDay[] = [];

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d);
      const dateString = format(date, 'yyyy-MM-dd');
      const isToday = format(today, 'yyyy-MM-dd') === dateString;
      const hasLog = dayLogs.some((log: DayLog) => log.date === dateString);
      const type = getPhaseForDate(date);

      calendarDays.push({ date: dateString, type, isToday, hasLog });
    }
    return calendarDays;
  };

  // Next period = last_period_date + cycle_length (current cycle’s next start)
  const getNextPeriodDate = (): string | null => {
    if (!cycleData || user?.isPregnant) return null;
    
    const startDate = parseISO(cycleData.periodStartDate);
    const cycleLength = cycleData.cycleLength || DEFAULT_CYCLE_LENGTH;
    const today = new Date();
    
    // Calculate days since last period
    const daysSinceStart = differenceInDays(today, startDate);
    const daysUntilNext = cycleLength - (daysSinceStart % cycleLength);
    
    // If today is the start of period, return today
    if (daysUntilNext === cycleLength) return format(today, 'yyyy-MM-dd');
    
    // Calculate next period date
    const nextPeriodDate = addDays(today, daysUntilNext);
    return format(nextPeriodDate, 'yyyy-MM-dd');
  };

  // Get the ovulation date (14 days before next period)
  const getOvulationDate = (): string | null => {
    if (!cycleData || user?.isPregnant) return null;
    const nextPeriodDate = getNextPeriodDate();
    if (!nextPeriodDate) return null;
    const ovulationDate = addDays(parseISO(nextPeriodDate), -OVULATION_DAYS_BEFORE_NEXT_PERIOD);
    return format(ovulationDate, 'yyyy-MM-dd');
  };

  // Get the fertile window (5 days before ovulation, not including ovulation day)
  const getFertileWindow = (): { start: string; end: string } | null => {
    if (!cycleData || user?.isPregnant) return null;
    const nextPeriodDate = getNextPeriodDate();
    if (!nextPeriodDate) return null;
    const ovulationDate = addDays(parseISO(nextPeriodDate), -OVULATION_DAYS_BEFORE_NEXT_PERIOD);
    const fertileStart = addDays(ovulationDate, -FERTILE_DAYS_BEFORE_OVULATION);
    const fertileEnd = addDays(ovulationDate, -1);
    return {
      start: format(fertileStart, 'yyyy-MM-dd'),
      end: format(fertileEnd, 'yyyy-MM-dd')
    };
  };

  // Get pregnancy week
  const getPregnancyWeek = (): number | null => {
    if (!pregnancyData || !user?.isPregnant) return null;
    
    const conceptionDate = parseISO(pregnancyData.conceptionDate);
    const today = new Date();
    
    // Calculate weeks since conception
    const daysSinceConception = differenceInDays(today, conceptionDate);
    return Math.floor(daysSinceConception / 7) + 1;
  };

  // Get pregnancy trimester
  const getPregnancyTrimester = (): number | null => {
    const week = getPregnancyWeek();
    if (week === null) return null;
    
    if (week <= 13) return 1;
    if (week <= 26) return 2;
    return 3;
  };

  // Logout function - clears all data
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'cycleData', 'dayLogs', 'pregnancyData']);
      setUser(null);
      setCycleData(null);
      setDayLogs([]);
      setPregnancyData(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    user,
    cycleData,
    dayLogs,
    pregnancyData,
    isLoading,
    saveUser,
    saveCycleData,
    saveDayLog,
    deleteDayLog,
    togglePregnancyMode,
    getCalendarData,
    getPhaseForDate,
    getNextPeriodDate,
    getOvulationDate,
    getFertileWindow,
    getPregnancyWeek,
    getPregnancyTrimester,
    logout,
  };
});