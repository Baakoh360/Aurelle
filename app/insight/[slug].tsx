import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import { getArticleBySlug, CATEGORIES } from '@/constants/healthGuide';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';

function getSlug(params: Record<string, unknown>): string | undefined {
  const s = params.slug;
  if (typeof s === 'string') return s;
  if (Array.isArray(s) && s.length > 0 && typeof s[0] === 'string') return s[0];
  return undefined;
}

export default function ArticleScreen() {
  const params = useLocalSearchParams();
  const slug = getSlug(params as Record<string, unknown>);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [helpful, setHelpful] = useState<'yes' | 'no' | null>(null);

  const article = slug ? getArticleBySlug(slug) : undefined;
  const categoryLabel = article ? CATEGORIES.find((c) => c.key === article.category)?.label : '';

  if (!article) {
    return (
      <View style={[styles.center, styles.pad]}>
        <Text style={styles.errorText}>Article not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = Array.isArray(article.sections) ? article.sections : [];
  const visualGuide = Array.isArray(article.visualGuide) ? article.visualGuide : [];
  const colorGuide = Array.isArray(article.colorGuide) ? article.colorGuide : [];
  const bottom = insets.bottom + 24;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {categoryLabel ? <Text style={styles.categoryLabel}>{categoryLabel}</Text> : null}
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.intro}>{article.intro}</Text>

      {visualGuide.length > 0 ? (
        <View style={styles.visualBox}>
          <Text style={styles.visualTitle}>At a glance</Text>
          <View style={styles.visualRow}>
            {visualGuide.map((item, i) => (
              <View key={`v-${i}`} style={styles.visualCard}>
                <Text style={styles.visualEmoji}>{item.emoji}</Text>
                <View style={styles.visualCardText}>
                  <Text style={styles.visualLabel}>{item.label}</Text>
                  <Text style={styles.visualDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {sections.map((sec, i) => (
        <View key={`s-${i}`} style={styles.section}>
          <Text style={styles.sectionHeading}>{sec.heading}</Text>
          <Text style={styles.sectionBody}>{sec.body}</Text>
        </View>
      ))}

      {colorGuide.length > 0 ? (
        <View style={styles.colorBox}>
          <Text style={styles.sectionHeading}>Quick reference</Text>
          {colorGuide.map((item, i) => (
            <View key={`c-${i}`} style={styles.colorRow}>
              <Text style={styles.colorEmoji}>{item.emoji}</Text>
              <View style={styles.colorText}>
                <Text style={styles.colorLabel}>{item.label}</Text>
                <Text style={styles.colorMeaning}>{item.meaning}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {article.whenToSeeDoctor ? (
        <View style={styles.doctorBox}>
          <Text style={styles.doctorHeading}>When to see a doctor</Text>
          <Text style={styles.doctorText}>{article.whenToSeeDoctor}</Text>
        </View>
      ) : null}

      <View style={styles.feedback}>
        <Text style={styles.feedbackLabel}>Was this helpful?</Text>
        <View style={styles.feedbackRow}>
          <TouchableOpacity
            style={[styles.feedbackBtn, helpful === 'yes' && styles.feedbackYes]}
            onPress={() => setHelpful('yes')}
          >
            <ThumbsUp size={18} color={helpful === 'yes' ? '#FFF' : Colors.primary} strokeWidth={2} />
            <Text style={[styles.feedbackBtnText, helpful === 'yes' && styles.feedbackBtnTextYes]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.feedbackBtn, helpful === 'no' && styles.feedbackNo]}
            onPress={() => setHelpful('no')}
          >
            <ThumbsDown size={18} color={helpful === 'no' ? '#FFF' : Colors.lightText} strokeWidth={2} />
            <Text style={[styles.feedbackBtnText, helpful === 'no' && styles.feedbackBtnTextYes]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBackground },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pad: { padding: spacing.xl },
  errorText: { fontSize: 16, color: Colors.lightText, marginBottom: spacing.base },
  backBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.base },
  backBtnText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: spacing.base },
  intro: { fontSize: 16, color: Colors.text, lineHeight: 24, marginBottom: spacing.xl },
  visualBox: {
    marginBottom: spacing.xl,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  visualTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: spacing.base },
  visualRow: { gap: spacing.base },
  visualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  visualEmoji: { fontSize: 36, marginRight: spacing.lg },
  visualCardText: { flex: 1, minWidth: 0 },
  visualLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  visualDesc: { fontSize: 14, color: Colors.lightText, marginTop: 2, lineHeight: 20 },
  section: { marginBottom: spacing.xl },
  sectionHeading: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: spacing.sm },
  sectionBody: { fontSize: 15, color: Colors.text, lineHeight: 24 },
  colorBox: {
    marginBottom: spacing.xl,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.base },
  colorEmoji: { fontSize: 22, marginRight: spacing.base, width: 28, textAlign: 'center' },
  colorText: { flex: 1 },
  colorLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  colorMeaning: { fontSize: 14, color: Colors.lightText, marginTop: 2 },
  doctorBox: {
    backgroundColor: Colors.primary + '15',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: spacing.xxl,
  },
  doctorHeading: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: spacing.sm },
  doctorText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  feedback: { marginTop: spacing.lg },
  feedbackLabel: { fontSize: 14, fontWeight: '600', color: Colors.lightText, marginBottom: spacing.sm },
  feedbackRow: { flexDirection: 'row', gap: spacing.base },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: Colors.primary + '50',
    backgroundColor: '#FFF',
  },
  feedbackYes: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  feedbackNo: { backgroundColor: Colors.lightText, borderColor: Colors.lightText },
  feedbackBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  feedbackBtnTextYes: { color: '#FFF' },
});
