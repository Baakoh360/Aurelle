import React, { useState } from 'react';
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
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import {
  CATEGORIES,
  getArticlesByCategory,
  type CategoryKey,
  type Article,
} from '@/constants/healthGuide';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react-native';

export default function HealthGuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const articles = selectedCategory ? getArticlesByCategory(selectedCategory) : [];
  const selectedCat = selectedCategory ? CATEGORIES.find((c) => c.key === selectedCategory) : null;

  const paddingTop = insets.top + spacing.sm;
  const paddingBottom = insets.bottom + 40;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop }]}
      >
        <Text style={styles.headerTitle}>Health Guide</Text>
        <Text style={styles.headerSubtitle}>Trusted answers about your body</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory === null ? (
          <>
            <Text style={styles.prompt}>Choose a topic</Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.categoryCard}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={cat.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryGradient}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categoryTagline}>{cat.tagline}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </>
        ) : selectedCat ? (
          <>
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.8}
            >
              <ArrowLeft size={18} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.backLinkText}>All topics</Text>
            </TouchableOpacity>

            <View style={[styles.topicHeader, { backgroundColor: selectedCat.gradient[0] + '20' }]}>
              <Text style={styles.topicEmoji}>{selectedCat.emoji}</Text>
              <Text style={styles.topicTitle}>{selectedCat.label}</Text>
              <Text style={styles.topicTagline}>{selectedCat.tagline}</Text>
            </View>

            <Text style={styles.articleListTitle}>Articles</Text>
            {articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                accentColor={selectedCat.gradient[0]}
                onPress={() => router.push(`/insight/${article.slug}`)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ArticleRow({
  article,
  accentColor,
  onPress,
}: {
  article: Article;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.articleRow, { borderLeftColor: accentColor }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.articleIcon, { backgroundColor: accentColor + '25' }]}>
        <BookOpen size={20} color={accentColor} strokeWidth={2} />
      </View>
      <View style={styles.articleText}>
        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.articleIntro} numberOfLines={1}>{article.intro}</Text>
      </View>
      <ChevronRight size={18} color={accentColor} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3F8' },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  prompt: { fontSize: 15, color: Colors.lightText, marginBottom: spacing.lg, textAlign: 'center' },
  categoryCard: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  categoryGradient: {
    padding: spacing.xl,
  },
  categoryEmoji: { fontSize: 32, marginBottom: spacing.sm },
  categoryLabel: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  categoryTagline: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  backLinkText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  topicHeader: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  topicEmoji: { fontSize: 40, marginBottom: spacing.sm },
  topicTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  topicTagline: { fontSize: 14, color: Colors.lightText, marginTop: 4 },
  articleListTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: spacing.base },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.base,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  articleIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  articleText: { flex: 1, minWidth: 0 },
  articleTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  articleIntro: { fontSize: 13, color: Colors.lightText, marginTop: 2 },
});
