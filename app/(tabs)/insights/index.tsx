import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
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
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Floating Orb ──────────────────────────────────────────────────────────────
function FloatingOrb({
  color,
  size,
  style,
  duration = 4000,
}: {
  color: string;
  size: number;
  style?: object;
  duration?: number;
}) {
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -10,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 10,
          duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.15,
          transform: [{ translateY: floatY }],
        },
        style,
      ]}
    />
  );
}

// ─── Shimmer Overlay ───────────────────────────────────────────────────────────
function ShimmerOverlay() {
  const shimmerX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerX, {
        toValue: SCREEN_WIDTH * 2,
        duration: 2400,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { transform: [{ translateX: shimmerX }] },
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(255,255,255,0)',
          'rgba(255,255,255,0.16)',
          'rgba(255,255,255,0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

// ─── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  onPress,
  index,
  articleCount,
}: {
  cat: (typeof CATEGORIES)[number];
  onPress: () => void;
  index: number;
  articleCount: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(mountAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 55,
      friction: 8,
    }).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const translateY = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <Animated.View
      style={[
        styles.categoryCard,
        {
          opacity: mountAnim,
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={cat.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          {/* Background orbs */}
          <FloatingOrb
            color="#fff"
            size={90}
            style={{ right: -24, top: -24 }}
            duration={3500 + index * 300}
          />
          <FloatingOrb
            color="#fff"
            size={45}
            style={{ right: 55, bottom: -18 }}
            duration={4200 + index * 200}
          />

          {/* Shimmer */}
          <ShimmerOverlay />

          {/* Top row */}
          <View style={styles.categoryTopRow}>
            <View style={styles.categoryEmojiBox}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            </View>
            <View style={styles.articleCountBadge}>
              <Text style={styles.articleCountNum}>{articleCount}</Text>
              <Text style={styles.articleCountSub}>articles</Text>
            </View>
          </View>

          {/* Label + tagline */}
          <Text style={styles.categoryLabel}>{cat.label}</Text>
          <Text style={styles.categoryTagline}>{cat.tagline}</Text>

          {/* CTA strip */}
          <View style={styles.categoryCTA}>
            <Text style={styles.categoryCTAText}>Explore now</Text>
            <ChevronRight size={14} color="rgba(255,255,255,0.95)" strokeWidth={3} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Featured Banner ───────────────────────────────────────────────────────────
function FeaturedBanner() {
  const pulse = useRef(new Animated.Value(1)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(mountAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 55,
      friction: 8,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity: mountAnim, transform: [{ translateY: mountAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      <LinearGradient
        colors={['#FF6B9D22', '#9D71E818']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredBanner}
      >
        <Animated.View style={[styles.featuredDot, { transform: [{ scale: pulse }] }]} />
        <View style={styles.featuredTextBlock}>
          <Text style={styles.featuredLabel}>✦  TRENDING TODAY</Text>
          <Text style={styles.featuredTitle}>New articles added across all topics</Text>
        </View>
        <View style={styles.featuredIconWrap}>
          <Zap size={18} color="#FF6B9D" strokeWidth={2.5} fill="#FF6B9D" />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function TopicStatsBar({
  count,
  accentColor,
}: {
  count: number;
  accentColor: string;
}) {
  const stats = [
    {
      icon: <BookOpen size={12} color={accentColor} strokeWidth={2.5} />,
      label: `${count} Articles`,
    },
    {
      icon: <TrendingUp size={12} color={accentColor} strokeWidth={2.5} />,
      label: 'Expert reviewed',
    },
  ];
  return (
    <View style={styles.statsBar}>
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          <View style={styles.statItem}>
            {s.icon}
            <Text style={[styles.statLabel, { color: accentColor }]}>{s.label}</Text>
          </View>
          {i < stats.length - 1 && (
            <View
              style={[styles.statDivider, { backgroundColor: accentColor + '35' }]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Article Row ───────────────────────────────────────────────────────────────
function ArticleRow({
  article,
  accentColor,
  onPress,
  index,
}: {
  article: Article;
  accentColor: string;
  onPress: () => void;
  index: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(mountAnim, {
      toValue: 1,
      delay: index * 70,
      useNativeDriver: true,
      tension: 65,
      friction: 9,
    }).start();
  }, []);

  const translateX = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22 }).start();

  return (
    <Animated.View
      style={{ opacity: mountAnim, transform: [{ scale }, { translateX }] }}
    >
      <TouchableOpacity
        style={styles.articleRow}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Left accent bar */}
        <View style={[styles.articleAccentBar, { backgroundColor: accentColor }]} />

        {/* Icon */}
        <View style={[styles.articleIconWrap, { backgroundColor: accentColor + '18' }]}>
          <BookOpen size={18} color={accentColor} strokeWidth={2} />
        </View>

        {/* Content */}
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.articleIntro} numberOfLines={1}>
            {article.intro}
          </Text>
          {index === 0 ? (
            <View style={styles.articleMeta}>
              <View
                style={[styles.topPickBadge, { backgroundColor: accentColor + '20' }]}
              >
                <Star
                  size={9}
                  color={accentColor}
                  strokeWidth={2.5}
                  fill={accentColor}
                />
                <Text style={[styles.topPickText, { color: accentColor }]}>
                  Top pick
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Arrow */}
        <View style={[styles.articleArrow, { backgroundColor: accentColor + '15' }]}>
          <ChevronRight size={14} color={accentColor} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function HealthGuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const articles = selectedCategory ? getArticlesByCategory(selectedCategory) : [];
  const selectedCat = selectedCategory
    ? CATEGORIES.find((c) => c.key === selectedCategory)
    : null;

  const paddingTop = insets.top + spacing.sm;
  const paddingBottom = insets.bottom + 52;

  const handleCategorySelect = (key: CategoryKey) => {
    setSelectedCategory(key);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
  };

  return (
    <View style={styles.container}>
      {/* Background ambient orbs */}
      <FloatingOrb
        color="#FF6B9D"
        size={220}
        style={{ top: 100, right: -70, zIndex: 0 }}
        duration={5200}
      />
      <FloatingOrb
        color="#9D71E8"
        size={160}
        style={{ top: 340, left: -60, zIndex: 0 }}
        duration={6400}
      />
      <FloatingOrb
        color="#D873C9"
        size={100}
        style={{ bottom: 120, right: 20, zIndex: 0 }}
        duration={4800}
      />

      {/* ── Header (unchanged colors) ── */}
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop, zIndex: 2 }]}
      >
        {/* Gloss layer */}
        <View style={styles.headerGloss} pointerEvents="none" />
        <Text style={styles.headerTitle}>Health Guide</Text>
        <Text style={styles.headerSubtitle}>Trusted answers about your body</Text>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory === null ? (
          <>
            <FeaturedBanner />

            <View style={styles.sectionRow}>
              <Sparkles size={13} color="#D873C9" strokeWidth={2} />
              <Text style={styles.sectionLabel}>Browse Topics</Text>
              <Sparkles size={13} color="#D873C9" strokeWidth={2} />
            </View>

            {CATEGORIES.map((cat, i) => {
              const count = getArticlesByCategory(cat.key).length;
              return (
                <CategoryCard
                  key={cat.key}
                  cat={cat}
                  index={i}
                  articleCount={count}
                  onPress={() => handleCategorySelect(cat.key)}
                />
              );
            })}
          </>
        ) : selectedCat ? (
          <>
            {/* Back */}
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.75}
            >
              <View style={styles.backIconWrap}>
                <ArrowLeft size={15} color={Colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.backText}>All Topics</Text>
            </TouchableOpacity>

            {/* Hero card */}
            <View style={styles.topicHero}>
              <LinearGradient
                colors={[
                  selectedCat.gradient[0] + '2E',
                  selectedCat.gradient[1] + '12',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topicHeroGradient}
              >
                <FloatingOrb
                  color={selectedCat.gradient[0]}
                  size={130}
                  style={{ right: -25, top: -25, opacity: 0.22 }}
                  duration={4000}
                />
                <View
                  style={[
                    styles.topicEmojiRing,
                    { borderColor: selectedCat.gradient[0] + '55' },
                  ]}
                >
                  <Text style={styles.topicEmoji}>{selectedCat.emoji}</Text>
                </View>
                <Text style={styles.topicTitle}>{selectedCat.label}</Text>
                <Text style={styles.topicTagline}>{selectedCat.tagline}</Text>
              </LinearGradient>
              <TopicStatsBar
                count={articles.length}
                accentColor={selectedCat.gradient[0]}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: selectedCat.gradient[0] + '38' },
                ]}
              />
              <View
                style={[
                  styles.dividerPill,
                  { backgroundColor: selectedCat.gradient[0] + '18' },
                ]}
              >
                <Text
                  style={[styles.dividerText, { color: selectedCat.gradient[0] }]}
                >
                  ARTICLES
                </Text>
              </View>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: selectedCat.gradient[0] + '38' },
                ]}
              />
            </View>

            {articles.map((article, i) => (
              <ArticleRow
                key={article.id}
                article={article}
                accentColor={selectedCat.gradient[0]}
                index={i}
                onPress={() => router.push(`/insight/${article.slug}`)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3F8' },

  // Header (unchanged colors/text)
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg + 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#C060D0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
      },
      android: { elevation: 7 },
    }),
  },
  headerGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
    fontWeight: '500',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  // Featured Banner
  featuredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base + 2,
    borderRadius: radius.lg + 2,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(157,113,232,0.14)',
    ...Platform.select({
      ios: {
        shadowColor: '#D873C9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  featuredDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B9D',
  },
  featuredTextBlock: { flex: 1 },
  featuredLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF6B9D',
    letterSpacing: 1.3,
    marginBottom: 2,
  },
  featuredTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
  featuredIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FF6B9D18',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section label
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.base + 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D873C9',
    letterSpacing: 0.8,
  },

  // Category card
  categoryCard: {
    marginBottom: spacing.base + 6,
    borderRadius: radius.lg + 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#C060D0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.24,
        shadowRadius: 20,
      },
      android: { elevation: 7 },
    }),
  },
  categoryGradient: {
    padding: spacing.xl,
    overflow: 'hidden',
    minHeight: 148,
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  categoryEmojiBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  categoryEmoji: { fontSize: 30 },
  articleCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  articleCountNum: { fontSize: 20, fontWeight: '900', color: '#fff' },
  articleCountSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  categoryLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  categoryTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '500',
    marginBottom: spacing.base,
  },
  categoryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  categoryCTAText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
  },

  // Back
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  backIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: Colors.primary + '16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { fontSize: 15, fontWeight: '700', color: Colors.primary },

  // Topic hero
  topicHero: {
    borderRadius: radius.lg + 6,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.09,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  topicHeroGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  topicEmojiRing: {
    width: 78,
    height: 78,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  topicEmoji: { fontSize: 42 },
  topicTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  topicTagline: {
    fontSize: 14,
    color: Colors.lightText,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.base + 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.base,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { fontSize: 12, fontWeight: '700' },
  statDivider: { width: 1, height: 14 },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base + 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dividerText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },

  // Article row
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    marginBottom: spacing.sm + 2,
    overflow: 'hidden',
    gap: spacing.sm,
    paddingRight: spacing.base,
    paddingVertical: spacing.base,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  articleAccentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  articleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: { flex: 1, minWidth: 0 },
  articleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
  },
  articleIntro: {
    fontSize: 12,
    color: Colors.lightText,
    marginTop: 2,
    lineHeight: 17,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  topPickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
  },
  topPickText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  articleArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});