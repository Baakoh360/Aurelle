import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, addMonths, parseISO } from '@/utils/dateUtils';
import { useAppStore } from '@/hooks/useAppStore';
import { CalendarDay } from '@/types';
import Colors from '@/constants/colors';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const CALENDAR_COLORS = {
  period: '#FF85A2',
  fertile: '#CE93D8',
  ovulation: '#64B5F6',
  safe: '#81C784',
} as const;

const TODAY_RING_GOLD = '#FFD54F';

function TodayGlowRing({ children }: { children: React.ReactNode }) {
  const ringBlink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(ringBlink, {
          toValue: 0.45,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(ringBlink, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [ringBlink]);

  return (
    <View style={styles.todayRingWrapper}>
      {/* Glow layer (blinks) */}
      <Animated.View
        style={[styles.todayGlowOuter, { opacity: ringBlink }]}
        pointerEvents="none"
      />
      {/* Ring border only (blinks); date stays in non-animated view below */}
      <Animated.View
        style={[styles.todayRingBorder, { opacity: ringBlink }]}
        pointerEvents="none"
      />
      <View style={styles.todayRing} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

interface CalendarViewProps {
  onDayPress: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onDayPress }) => {
  const { getCalendarData } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  useEffect(() => {
    setCalendarDays(getCalendarData(currentMonth));
  }, [currentMonth, getCalendarData]);
  
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const getDayColor = (type: CalendarDay['type']) => {
    switch (type) {
      case 'period':
        return CALENDAR_COLORS.period;
      case 'fertile':
        return CALENDAR_COLORS.fertile;
      case 'ovulation':
        return CALENDAR_COLORS.ovulation;
      case 'safe':
        return CALENDAR_COLORS.safe;
      default:
        return 'transparent';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF8FC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <LinearGradient
            colors={['#FF6B9D', '#9D71E8']}
            style={styles.navButtonGradient}
          >
            <ChevronLeft size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <LinearGradient
            colors={['#FF6B9D', '#9D71E8']}
            style={styles.navButtonGradient}
          >
            <ChevronRight size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekDaysContainer}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDayContainer}>
            <Text style={styles.weekDay}>{day}</Text>
          </View>
        ))}
      </View>
      
      <ScrollView style={styles.daysContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.daysGrid}>
          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.emptyDay} />
          ))}
          
          {/* Calendar days */}
          {calendarDays.map(day => {
            const dayColor = getDayColor(day.type);
            const isColored = dayColor !== 'transparent';
            const dayContent = (
              <>
                {isColored ? (
                  <LinearGradient
                    colors={[`${dayColor}E0`, `${dayColor}B8`]}
                    style={styles.dayBackground}
                  >
                    <Text style={[
                      styles.dayText,
                      day.isToday && styles.todayText,
                      isColored && styles.coloredDayText
                    ]}>
                      {parseISO(day.date).getDate()}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.dayBackground}>
                    <Text style={[styles.dayText, day.isToday && styles.todayText]}>
                      {parseISO(day.date).getDate()}
                    </Text>
                  </View>
                )}
              </>
            );
            return (
              <TouchableOpacity
                key={day.date}
                style={[styles.day, day.isToday && styles.dayToday]}
                onPress={() => onDayPress(day.date)}
                testID={`calendar-day-${day.date}`}
                activeOpacity={0.8}
              >
                {day.isToday ? (
                  <View style={styles.todayCell}>
                    <TodayGlowRing>
                      {dayContent}
                    </TodayGlowRing>
                  </View>
                ) : (
                  dayContent
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      <LinearGradient
        colors={['#FFF5F9', '#FFFFFF']}
        style={styles.legend}
      >
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: CALENDAR_COLORS.period }]} />
            <Text style={styles.legendText}>Period</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: CALENDAR_COLORS.fertile }]} />
            <Text style={styles.legendText}>Fertile</Text>
          </View>
        </View>
        <View style={[styles.legendRow, styles.legendRowLast]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: CALENDAR_COLORS.ovulation }]} />
            <Text style={styles.legendText}>Ovulation</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: CALENDAR_COLORS.safe }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    padding: 24,
    margin: 16,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  navButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDay: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.lightText,
  },
  daysContainer: {
    maxHeight: 320,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  dayToday: {
    overflow: 'visible',
  },
  todayCell: {
    flex: 1,
    overflow: 'visible',
    margin: -8,
    padding: 8,
  },
  dayBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  coloredDayText: {
    color: Colors.text,
    fontWeight: '800',
  },
  todayText: {
    fontWeight: '800',
    color: Colors.primary,
  },
  todayRingWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayGlowOuter: {
    ...StyleSheet.absoluteFillObject,
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
    borderWidth: 6,
    borderColor: TODAY_RING_GOLD,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: TODAY_RING_GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 18,
      },
      android: { elevation: 16 },
    }),
  },
  todayRingBorder: {
    ...StyleSheet.absoluteFillObject,
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: TODAY_RING_GOLD,
  },
  todayRing: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  legend: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  legendRowLast: {
    marginBottom: 0,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.3,
  },
});

export default CalendarView;