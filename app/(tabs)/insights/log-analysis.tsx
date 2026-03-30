import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useAppStore } from '@/hooks/useAppStore';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import { analyzeDayLogs } from '@/utils/logInsights';

export default function LogAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dayLogs } = useAppStore();

  const { sections, totalLogs, highPainDays } = useMemo(
    () => analyzeDayLogs(dayLogs),
    [dayLogs]
  );

  const paddingTop = insets.top + spacing.sm;
  const paddingBottom = insets.bottom + 40;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9D71E8', '#D873C9', '#FF6B9D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop }]}
      >
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.85}
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerIconWrap}>
          <Sparkles size={28} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <Text style={styles.headerTitle}>Your log insights</Text>
        <Text style={styles.headerSubtitle}>
          Suggestions based on what you have saved — not a medical diagnosis
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {totalLogs === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptyBody}>
              Open Calendar, pick a day, and log flow, symptoms, and how you feel. This page will
              turn those entries into gentle wellness ideas — like walking, warmth on your abdomen
              for cramps, hydration, and rest.
            </Text>
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Log a bit more detail</Text>
            <Text style={styles.emptyBody}>
              You have {totalLogs} saved {totalLogs === 1 ? 'day' : 'days'}, but we did not find
              symptom chips or higher pain to analyze. Tap symptoms like Cramps, Bloating, or
              Headache on your day log for tailored tips here.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.summary}>
              Based on {totalLogs} logged {totalLogs === 1 ? 'day' : 'days'}
              {highPainDays > 0 ? ` · ${highPainDays} with moderate–severe pain` : ''}.
            </Text>
            {sections.map((section) => (
              <View key={section.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{section.emoji}</Text>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle}>{section.title}</Text>
                    {section.mentionCount > 0 ? (
                      <Text style={styles.cardMeta}>
                        Logged on {section.mentionCount}{' '}
                        {section.mentionCount === 1 ? 'day' : 'days'}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {section.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Aurelle offers general wellness ideas only. If you have severe pain, heavy bleeding,
            fever, or anything that worries you, contact a qualified healthcare professional.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.base,
    alignSelf: 'flex-start',
  },
  backText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '700',
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  summary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.lightText,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary + '18',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.lightText,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  tipBullet: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '800',
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: Colors.background,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.lightText,
    lineHeight: 22,
  },
  disclaimer: {
    marginTop: spacing.lg,
    paddingVertical: spacing.base,
  },
  disclaimerText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.lightText,
    lineHeight: 18,
    textAlign: 'center',
  },
});
