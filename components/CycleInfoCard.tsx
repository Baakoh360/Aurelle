import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/hooks/useAppStore';
import { formatReadable } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { Droplet, Clock, Heart } from 'lucide-react-native';

const CycleInfoCard: React.FC = () => {
  const { getNextPeriodDate, getOvulationDate, getFertileWindow } = useAppStore();

  const nextPeriodDate = getNextPeriodDate();
  const ovulationDate = getOvulationDate();
  const fertileWindow = getFertileWindow();

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 0;
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntil = nextPeriodDate ? getDaysUntil(nextPeriodDate) : 0;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#FFE8F0', '#FFF0F8', '#F8F0FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <LinearGradient
              colors={[Colors.primary, '#FF8FB3']}
              style={styles.iconBadge}
            >
              <Droplet size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>Your Cycle</Text>
          </View>
        </View>

        {nextPeriodDate ? (
          <>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroBlock}
            >
              <Text style={styles.heroNumber}>{Math.max(0, daysUntil)}</Text>
              <View style={styles.heroLabels}>
                <Text style={styles.heroLabel}>days until</Text>
                <Text style={styles.heroSublabel}>next period</Text>
              </View>
            </LinearGradient>
            <Text style={styles.dateLine}>Expected {formatReadable(nextPeriodDate)}</Text>

            <View style={styles.miniCardsRow}>
              {ovulationDate && (
                <LinearGradient
                  colors={[Colors.ovulation, '#7DD3F0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.miniCard}
                >
                  <Clock size={16} color="#FFFFFF" />
                  <Text style={styles.miniCardLabel} numberOfLines={1}>
                    Ovulation {formatReadable(ovulationDate).split(',')[0]}
                  </Text>
                </LinearGradient>
              )}
              {fertileWindow && (
                <LinearGradient
                  colors={[Colors.fertile, '#B794F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.miniCard}
                >
                  <Heart size={16} color="#FFFFFF" />
                  <Text style={styles.miniCardLabel} numberOfLines={1}>
                    Fertile {formatReadable(fertileWindow.start).split(',')[0]}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>Add your last period date in Settings to see predictions and cycle insights.</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  heroBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    gap: spacing.base,
  },
  heroNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroLabels: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textTransform: 'lowercase',
  },
  heroSublabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textTransform: 'lowercase',
  },
  dateLine: {
    fontSize: 14,
    color: Colors.lightText,
    marginBottom: spacing.base,
    fontWeight: '600',
    paddingLeft: 2,
  },
  miniCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    gap: spacing.sm,
    minWidth: 0,
    flex: 1,
  },
  miniCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  emptyBlock: {
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.lightText,
    lineHeight: 24,
    fontWeight: '500',
  },
});

export default CycleInfoCard;
