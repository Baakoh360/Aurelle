import React from 'react';
import { StyleSheet, View, Text, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/hooks/useAppStore';
import { formatReadable, formatShort } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { Heart, Clock, Flower2 } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      <View style={styles.cardOuter}>
        {/* Soft feminine shape: rounded "heart-like" blob with asymmetric radii */}
        <LinearGradient
          colors={['#FFE8F2', '#FFEEF6', '#F5EDFF', '#F0E8FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative background heart — watermark */}
          <View style={[styles.heartWatermark, { opacity: 0.12 }]} pointerEvents="none">
            <Heart
              size={Math.min(140, SCREEN_WIDTH * 0.32)}
              color={Colors.primary}
              fill={Colors.primary}
              strokeWidth={0}
            />
          </View>
          {/* Decorative flower accent — top right */}
          <View style={[styles.flowerAccent, { opacity: 0.15 }]} pointerEvents="none">
            <Flower2 size={56} color={Colors.secondary} strokeWidth={1.5} />
          </View>

          <View style={styles.cardInner}>
            <View style={styles.titleRow}>
              <LinearGradient
                colors={[Colors.primary, '#FF8FB3', '#E879A4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heartBadge}
              >
                <Heart size={22} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
              </LinearGradient>
              <Text style={styles.title}>Your Cycle</Text>
            </View>

            {nextPeriodDate ? (
              <>
                <LinearGradient
                  colors={['#FF6B9D', '#E06BA8', '#C96BB8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0.6 }}
                  style={styles.heroBlock}
                >
                  <View style={styles.heroHeartWrap}>
                    <Heart size={28} color="rgba(255,255,255,0.9)" fill="rgba(255,255,255,0.9)" strokeWidth={0} />
                  </View>
                  <View style={styles.heroContent}>
                    <Text style={styles.heroNumber}>{Math.max(0, daysUntil)}</Text>
                    <View style={styles.heroLabels}>
                      <Text style={styles.heroLabel}>days until</Text>
                      <Text style={styles.heroSublabel}>next period</Text>
                    </View>
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
                      <Text style={styles.miniCardLabel} numberOfLines={2}>
                        Ovulation {formatShort(ovulationDate)}
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
                      <Flower2 size={16} color="#FFFFFF" />
                      <Text style={styles.miniCardLabel} numberOfLines={2}>
                        Fertile {formatShort(fertileWindow.start)}
                      </Text>
                    </LinearGradient>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.emptyBlock}>
                <View style={styles.emptyIconWrap}>
                  <Heart size={32} color={Colors.primary} fill={Colors.primary + '40'} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyText}>
                  Add your last period date in Settings to see predictions and cycle insights.
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
  },
  cardOuter: {
    borderRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#E06BA8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
    }),
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.18)',
    padding: spacing.xl,
    minHeight: 140,
  },
  heartWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -10,
  },
  flowerAccent: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.lg,
  },
  cardInner: {
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  heartBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  heroBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 24,
    marginBottom: spacing.sm,
    gap: spacing.base,
  },
  heroHeartWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    flex: 1,
  },
  heroNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroLabels: {
    marginTop: 2,
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
    borderRadius: 20,
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
    alignItems: 'center',
  },
  emptyIconWrap: {
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.lightText,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CycleInfoCard;
