import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, addMonths, parseISO } from '@/utils/dateUtils';
import { useAppStore } from '@/hooks/useAppStore';
import { CalendarDay } from '@/types';
import Colors from '@/constants/colors';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';

// Slightly toned down on Android so calendar matches iOS perceived brightness
const CALENDAR_COLORS = Platform.select({
  android: {
    period: '#F06090',
    fertile: '#7AB33D',
    ovulation: '#F0A840',
    safe: '#42B4E5',
  },
  default: {
    period: '#FF6B9D',
    fertile: '#8BC34A',
    ovulation: '#FFB74D',
    safe: '#4FC3F7',
  },
}) as { period: string; fertile: string; ovulation: string; safe: string };

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
    <View style={styles.container}>
      {/* Header: wide gradient bar, month in white, calendar icon, gray nav circles */}
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8', '#7C9EED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBar}
      >
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButtonCircle} activeOpacity={0.8}>
          <View style={styles.navButtonInner}>
            <ChevronLeft size={22} color="#666" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <CalendarIcon size={20} color="rgba(255,255,255,0.95)" strokeWidth={2} style={styles.headerCalendarIcon} />
          <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButtonCircle} activeOpacity={0.8}>
          <View style={styles.navButtonInner}>
            <ChevronRight size={22} color="#666" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </LinearGradient>
      
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => {
          const isWeekend = index === 0 || index === 6;
          return (
            <View key={day} style={styles.weekDayContainer}>
              <Text style={[styles.weekDay, isWeekend && styles.weekDayWeekend]}>{day}</Text>
            </View>
          );
        })}
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
                  <View style={[styles.dayCircle, { backgroundColor: dayColor }]}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.38)', 'rgba(255,255,255,0.08)', 'transparent']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.dayCircleGloss}
                    />
                    <Text style={[styles.dayText, day.isToday && styles.todayText]}>
                      {parseISO(day.date).getDate()}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.dayCircle, styles.dayCircleUncolored]}>
                    <Text style={[styles.dayText, styles.dayTextUncolored]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    padding: 20,
    margin: 16,
    backgroundColor: '#FDF2F8',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 18,
  },
  navButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  navButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerCalendarIcon: {
    marginRight: 8,
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDay: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  weekDayWeekend: {
    color: '#E91E63',
  },
  daysContainer: {
    maxHeight: 360,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '13.2%',
    aspectRatio: 1,
    marginHorizontal: '0.4%',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  dayCircle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  dayCircleGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    opacity: 1,
  },
  dayCircleUncolored: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  dayTextUncolored: {
    color: Colors.text,
    textShadowColor: 'transparent',
  },
  emptyDay: {
    width: '13.2%',
    aspectRatio: 1,
    marginHorizontal: '0.4%',
    marginBottom: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  todayText: {
    fontWeight: '800',
    color: '#FFFFFF',
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