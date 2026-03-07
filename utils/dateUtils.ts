import { format as dateFnsFormat, parseISO as dateFnsParseISO, addDays as dateFnsAddDays, differenceInDays as dateFnsDifferenceInDays, addMonths as dateFnsAddMonths, isWithinInterval as dateFnsIsWithinInterval } from 'date-fns';

// Format a date to a string
export const format = (date: Date, formatStr: string): string => {
  return dateFnsFormat(date, formatStr);
};

// Parse an ISO string to a Date object
export const parseISO = (dateStr: string): Date => {
  return dateFnsParseISO(dateStr);
};

// Add days to a date
export const addDays = (date: Date, days: number): Date => {
  return dateFnsAddDays(date, days);
};

// Add months to a date
export const addMonths = (date: Date, months: number): Date => {
  return dateFnsAddMonths(date, months);
};

// Get difference in days between two dates
export const differenceInDays = (dateLeft: Date, dateRight: Date): number => {
  return dateFnsDifferenceInDays(dateLeft, dateRight);
};

// Check if date is within [start, end] (inclusive)
export const isWithinInterval = (date: Date, interval: { start: Date; end: Date }): boolean => {
  return dateFnsIsWithinInterval(date, interval);
};

// Format date to a readable format (e.g., "July 27, 2025")
export const formatReadable = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, 'MMMM d, yyyy');
};

// Format date to a short format (e.g., "Jul 27")
export const formatShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, 'MMM d');
};

// Get days remaining until a date
export const getDaysRemaining = (targetDate: Date | string): number => {
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const today = new Date();
  return Math.max(0, dateFnsDifferenceInDays(target, today));
};