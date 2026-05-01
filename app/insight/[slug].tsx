import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { getArticleBySlug, CATEGORIES } from '@/constants/healthGuide';
import { ThumbsUp, ThumbsDown, ChevronLeft, BookOpen, Clock } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Local discharge images ───────────────────────────────────────────────────
const DISCHARGE_IMAGES = {
  normal: require('@/assets/images/discharge-normal.png'),
  mustWatch: require('@/assets/images/discharge-must-watch.png'),
  seeDoctor: require('@/assets/images/discharge-see-doctor.png'),
};

// ─── Remote illustration images per article slug ──────────────────────────────
// afterSection: insert image AFTER sections[n]. -1 = above sections (after intro).
// source: use require('@/assets/...') for local, or uri: 'https://...' for remote
// label/labelColor/labelBg: add a coloured badge below the image (like discharge cards)
type ArticleImageEntry = {
  afterSection: number;
  caption: string;
  label?: string;
  labelColor?: string;
  labelBg?: string;
  imageHeight?: number; // override default height (SCREEN_WIDTH * 0.60)
} & ({ source: ReturnType<typeof require>; uri?: never } | { uri: string; source?: never });

const ARTICLE_IMAGES: Record<string, ArticleImageEntry[]> = {
  'how-to-clean-your-vulva': [
    {
      afterSection: -1,
      source: require('@/assets/images/clean-vulva.png'),
      caption: 'Gentle warm water is all your vulva needs — no soaps inside.',
    },
  ],
  'spotting-vs-period': [
    {
      afterSection: 0,
      source: require('@/assets/images/spotting-light.png'),
      label: '💧 Spotting — light, a few drops only',
      labelColor: '#1D4ED8',
      labelBg: '#DBEAFE',
      caption: "Spotting usually doesn't fill a liner and can be pink, brown or red.",
      imageHeight: SCREEN_WIDTH * 0.75,
    },
    {
      afterSection: 1,
      source: require('@/assets/images/period-normal.png'),
      label: '🩸 Normal period — steady flow, 3–7 days',
      labelColor: '#9D174D',
      labelBg: '#FCE7F3',
      caption: 'A normal period needs a pad, tampon or cup and follows a predictable pattern.',
      imageHeight: SCREEN_WIDTH * 0.75,
    },
    {
      afterSection: 2,
      source: require('@/assets/images/period-heavy (2).png'),
      label: '🔴 Heavy / abnormal — see a doctor',
      labelColor: '#7F1D1D',
      labelBg: '#FEE2E2',
      caption: 'Soaking through a pad in under 2 hours or passing large clots is worth checking.',
      imageHeight: SCREEN_WIDTH * 0.75,
    },
  ],
  'early-signs-of-pregnancy': [
    {
      afterSection: 1,
      source: require('@/assets/images/pregnancy-test.png'),
      caption: 'Home pregnancy tests are reliable from the first day of a missed period.',
    },
  ],
  'normal-vs-abnormal-period-pain': [
    {
      afterSection: 0,
      source: require('@/assets/images/pain-mild.png'),
      label: '😌 Mild — manageable with heat & rest',
      labelColor: '#065F46',
      labelBg: '#D1FAE5',
      caption: 'Mild cramps usually ease within 1–2 days and respond well to a heating pad.',
      imageHeight: SCREEN_WIDTH * 0.75,
    },
    {
      afterSection: 1,
      source: require('@/assets/images/pain-severe.png'),
      label: '🆘 Severe — disrupts daily life',
      labelColor: '#7F1D1D',
      labelBg: '#FEE2E2',
      caption: 'Pain that stops you working, sleeping or moving normally deserves medical attention.',
      imageHeight: SCREEN_WIDTH * 0.75,
    },
  ],
  'what-ovulation-feels-like': [
    {
      afterSection: 0,
      source: require('@/assets/images/ovulation-discharge.png'),
      caption: 'Clear, stretchy discharge around ovulation is a healthy sign of a fertile window.',
    },
  ],
  'vaginal-dryness': [
    {
      afterSection: 0,
      source: require('@/assets/images/vaginal-dryness.png'),
      caption: 'Water-based lubricants are safe, effective and widely available without a prescription.',
    },
  ],
  'vaginal-odor': [
    {
      afterSection: 1,
      source: require('@/assets/images/vaginal-odor.png'),
      caption: 'A strong or new smell alongside discharge is worth getting checked.',
    },
  ],
  'yeast-infection-vs-bv': [
    {
      afterSection: 0,
      source: require('@/assets/images/yeast-infection.png'),
      label: '🍞 Yeast infection — thick white discharge, itching',
      labelColor: '#92400E',
      labelBg: '#FEF3C7',
      caption: 'Yeast causes cottage-cheese-like discharge with itching — usually no strong smell.',
      imageHeight: SCREEN_WIDTH * 0.75,
    },
    {
      afterSection: 1,
      source: require('@/assets/images/bv-infection.png'),
      label: '🐟 BV — thin grey discharge, fishy smell',
      labelColor: '#1E3A5F',
      labelBg: '#DBEAFE',
      caption: 'BV has a distinctive fishy odour, especially after sex. Both are treatable.',
      imageHeight: SCREEN_WIDTH * 0.75,
    },
  ],
  'utis-signs-and-prevention': [
    {
      afterSection: 0,
      source: require('@/assets/images/uti-hydration.png'),
      caption: 'Staying well hydrated keeps your urinary tract flushed and less infection-prone.',
    },
    {
      afterSection: 2,
      source: require('@/assets/images/uti-antibiotics.png'),
      caption: 'Finishing the full antibiotic course prevents the infection from coming back.',
    },
  ],
  'pcos-signs': [
    {
      afterSection: 1,
      source: require('@/assets/images/pcos.png'),
      caption: 'PCOS is common and manageable — a doctor can confirm it and guide you.',
    },
  ],
  'when-to-see-doctor-cycle': [
    {
      afterSection: 0,
      source: require('@/assets/images/doctor-visit.png'),
      caption: 'Tracking cycle changes over time makes your doctor visits far more productive.',
    },
  ],
  'mood-and-your-cycle': [
    {
      afterSection: 0,
      source: require('@/assets/images/mood-cycle.png'),
      caption: 'Estrogen and progesterone shifts directly shape mood, energy and sleep quality.',
    },
    {
      afterSection: 2,
      source: require('@/assets/images/mood-rest.png'),
      caption: 'Gentle movement and intentional rest can ease the luteal phase dip.',
    },
  ],
  
  'anxiety-around-periods': [
    {
      afterSection: 1,
      source: require('@/assets/images/period-anxiety.png'),
      caption: 'Logging your cycle over a few months reveals patterns that ease period anxiety.',
    },
  ],
  'body-image-and-your-cycle': [
    {
      afterSection: 0,
      source: require('@/assets/images/body-image.png'),
      caption: 'Pre-period bloating is water retention — temporary, normal, and not your fault.',
    },
  ],
 
 
   

};


// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_GRADIENTS: Record<string, [string, string, string]> = {
  cycle: ['#FF6B9D', '#E84A7A', '#C73666'],
  vaginal: ['#B794F6', '#9D71E8', '#7C52CC'],
  reproductive: ['#7DD3F0', '#5BBFDD', '#3A9EC4'],
  mental: ['#FBBF24', '#F59E0B', '#D97706'],
  nutrition: ['#34D399', '#22C55E', '#16A34A'],
};

const CATEGORY_ACCENT: Record<string, string> = {
  cycle: '#FF6B9D',
  vaginal: '#9D71E8',
  reproductive: '#5BBFDD',
  mental: '#F59E0B',
  nutrition: '#22C55E',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSlug(params: Record<string, unknown>): string | undefined {
  const s = params.slug;
  if (typeof s === 'string') return s;
  if (Array.isArray(s) && s.length > 0 && typeof s[0] === 'string') return s[0];
  return undefined;
}

// ─── Article image card (local or remote, optional label badge) ───────────────
function ArticleImage({ source, uri, caption, label, labelColor, labelBg, imageHeight }: ArticleImageEntry) {
  const imageSource = source ?? { uri };
  const imgH = imageHeight ?? SCREEN_WIDTH * 0.60;
  return (
    <View style={remoteImgStyles.wrapper}>
      <Image
        source={imageSource}
        style={[remoteImgStyles.image, { height: imgH }]}
        resizeMode="cover"
        accessibilityLabel={caption}
      />
      {/* Gradient caption overlay — hidden when a solid label badge is shown */}
      {!label ? (
        <LinearGradient
          colors={['transparent', 'rgba(10,10,20,0.72)']}
          style={remoteImgStyles.captionOverlay}
        >
          <Text style={remoteImgStyles.captionText}>{caption}</Text>
        </LinearGradient>
      ) : (
        <View style={[remoteImgStyles.labelBadge, { backgroundColor: labelBg ?? '#F1F5F9' }]}>
          <Text style={[remoteImgStyles.labelText, { color: labelColor ?? '#1A1A2E' }]}>{label}</Text>
          {caption ? <Text style={[remoteImgStyles.labelCaption, { color: labelColor ?? '#4A5568' }]}>{caption}</Text> : null}
        </View>
      )}
    </View>
  );
}

// ─── Local discharge image card ───────────────────────────────────────────────
function DischargeImageCard({
  source,
  label,
  labelColor,
  labelBg,
  alt,
}: {
  source: ReturnType<typeof require>;
  label: string;
  labelColor: string;
  labelBg: string;
  alt: string;
}) {
  return (
    <View style={localImgStyles.card}>
      <Image
        source={source}
        style={localImgStyles.image}
        resizeMode="cover"
        accessibilityLabel={alt}
      />
      <View style={[localImgStyles.badge, { backgroundColor: labelBg }]}>
        <Text style={[localImgStyles.badgeText, { color: labelColor }]}>{label}</Text>
      </View>
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({
  section,
  index,
  accentColor,
}: {
  section: { heading: string; body: string };
  index: number;
  accentColor: string;
}) {
  return (
    <View style={[sectionStyles.card, { borderLeftColor: accentColor + '70' }]}>
      <View style={[sectionStyles.numberBadge, { backgroundColor: accentColor + '18' }]}>
        <Text style={[sectionStyles.numberText, { color: accentColor }]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
      </View>
      <Text style={sectionStyles.heading}>{section.heading}</Text>
      <Text style={sectionStyles.body}>{section.body}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ArticleScreen() {
  const params = useLocalSearchParams();
  const slug = getSlug(params as Record<string, unknown>);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [helpful, setHelpful] = useState<'yes' | 'no' | null>(null);

  const article = slug ? getArticleBySlug(slug) : undefined;
  const category = article ? CATEGORIES.find((c) => c.key === article.category) : undefined;
  const gradientColors: [string, string, string] = article
    ? CATEGORY_GRADIENTS[article.category] ?? ['#9D71E8', '#B794F6', '#C9A8FF']
    : ['#9D71E8', '#B794F6', '#C9A8FF'];
  const accentColor = article
    ? CATEGORY_ACCENT[article.category] ?? Colors.primary
    : Colors.primary;

  if (!article) {
    return (
      <View style={[styles.center, styles.pad]}>
        <Text style={styles.errorText}>Article not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: Colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = Array.isArray(article.sections) ? article.sections : [];
  const visualGuide = Array.isArray(article.visualGuide) ? article.visualGuide : [];
  const colorGuide = Array.isArray(article.colorGuide) ? article.colorGuide : [];
  const bottom = insets.bottom + 32;
  const isDischargeArticle = article.slug === 'vaginal-discharge-color-guide';

  const remoteImages = ARTICLE_IMAGES[article.slug] ?? [];
  const imagesBeforeSections = remoteImages.filter((img) => img.afterSection === -1);

  const wordCount = sections.reduce((acc, s) => acc + s.body.split(' ').length, 0);
  const readMins = Math.max(1, Math.round(wordCount / 200));

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroGradient, { paddingTop: insets.top + 8 }]}
          >
            <View style={[styles.decCircle, styles.decCircle1]} />
            <View style={[styles.decCircle, styles.decCircle2]} />
            <View style={[styles.decCircle, styles.decCircle3]} />

            <View style={styles.heroTopBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.heroBackBtn}>
                <ChevronLeft size={20} color="#FFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryPillText}>{category.label}</Text>
              </View>
            ) : null}

            <Text style={styles.heroTitle}>{article.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Clock size={12} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                <Text style={styles.metaText}>{readMins} min read</Text>
              </View>
              <View style={styles.metaChip}>
                <BookOpen size={12} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                <Text style={styles.metaText}>{sections.length} sections</Text>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.heroClip} />
        </View>

        {/* ── Intro card ── */}
        <View style={[styles.introCard, { borderLeftColor: accentColor }]}>
          <Text style={styles.introText}>{article.intro}</Text>
        </View>

        {/* ── Images before sections ── */}
        {imagesBeforeSections.length > 0 ? (
          <View style={styles.imageBlock}>
            {imagesBeforeSections.map((img, i) => (
              <ArticleImage key={`pre-${i}`} {...img} />
            ))}
          </View>
        ) : null}

        {/* ── At a glance ── */}
        {visualGuide.length > 0 ? (
          <View style={styles.glanceSection}>
            <Text style={[styles.sectionLabel, { color: accentColor }]}>AT A GLANCE</Text>
            <View style={styles.glanceRow}>
              {visualGuide.map((item, i) => (
                <View key={`v-${i}`} style={styles.glanceCard}>
                  <View style={[styles.glanceEmojiWrap, { backgroundColor: accentColor + '18' }]}>
                    <Text style={styles.glanceEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={styles.glanceLabel}>{item.label}</Text>
                  <Text style={styles.glanceDesc}>{item.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Sections + inline images ── */}
        <View style={styles.sectionsWrapper}>
          <Text style={[styles.sectionLabel, { color: accentColor }]}>IN DETAIL</Text>

          {sections.map((sec, i) => (
            <View key={`s-${i}`}>
              <SectionCard section={sec} index={i} accentColor={accentColor} />

              {/* Discharge-specific local images */}
              {isDischargeArticle && i === 0 ? (
                <DischargeImageCard
                  source={DISCHARGE_IMAGES.normal}
                  label="✓  Normal — healthy discharge"
                  labelColor="#2D6A4F"
                  labelBg="#D8F3DC"
                  alt="Normal healthy discharge"
                />
              ) : null}
              {isDischargeArticle && i === 2 ? (
                <DischargeImageCard
                  source={DISCHARGE_IMAGES.mustWatch}
                  label="⚠  Must watch — possible infection"
                  labelColor="#92400E"
                  labelBg="#FEF3C7"
                  alt="Must watch discharge"
                />
              ) : null}
              {isDischargeArticle && i === 3 ? (
                <DischargeImageCard
                  source={DISCHARGE_IMAGES.seeDoctor}
                  label="🩺  See a doctor — warning signs"
                  labelColor="#9B1C1C"
                  labelBg="#FEE2E2"
                  alt="See a doctor"
                />
              ) : null}

              {/* Remote images for all other articles */}
              {!isDischargeArticle
                ? remoteImages
                    .filter((img) => img.afterSection === i)
                    .map((img, j) => (
                      <ArticleImage key={`img-${i}-${j}`} {...img} />
                    ))
                : null}
            </View>
          ))}
        </View>

        {/* ── Quick Reference color guide ── */}
        {colorGuide.length > 0 ? (
          <View style={styles.colorBox}>
            <Text style={[styles.sectionLabel, { color: accentColor }]}>QUICK REFERENCE</Text>
            {colorGuide.map((item, i) => (
              <View
                key={`c-${i}`}
                style={[styles.colorRow, i < colorGuide.length - 1 && styles.colorRowBorder]}
              >
                <View style={[styles.colorEmojiWrap, { backgroundColor: accentColor + '14' }]}>
                  <Text style={styles.colorEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.colorText}>
                  <Text style={styles.colorLabel}>{item.label}</Text>
                  <Text style={styles.colorMeaning}>{item.meaning}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── When to see a doctor ── */}
        {article.whenToSeeDoctor ? (
          <View style={styles.doctorBox}>
            <LinearGradient
              colors={[gradientColors[0] + '28', gradientColors[1] + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.doctorGradient}
            >
              <View style={[styles.doctorIcon, { backgroundColor: gradientColors[0] }]}>
                <Text style={styles.doctorIconEmoji}>🩺</Text>
              </View>
              <Text style={styles.doctorHeading}>When to see a doctor</Text>
              <Text style={styles.doctorText}>{article.whenToSeeDoctor}</Text>
            </LinearGradient>
          </View>
        ) : null}

        {/* ── Feedback ── */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>Was this article helpful?</Text>
          <Text style={styles.feedbackSub}>Your feedback helps us improve</Text>
          <View style={styles.feedbackRow}>
            <TouchableOpacity
              style={[
                styles.feedbackBtn,
                helpful === 'yes'
                  ? { backgroundColor: accentColor, borderColor: accentColor }
                  : { borderColor: accentColor + '55' },
              ]}
              onPress={() => setHelpful('yes')}
              activeOpacity={0.82}
            >
              <ThumbsUp size={18} color={helpful === 'yes' ? '#FFF' : accentColor} strokeWidth={2} />
              <Text style={[styles.feedbackBtnText, { color: helpful === 'yes' ? '#FFF' : accentColor }]}>
                Yes, helpful
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackBtn,
                helpful === 'no'
                  ? { backgroundColor: '#64748B', borderColor: '#64748B' }
                  : { borderColor: '#CBD5E1' },
              ]}
              onPress={() => setHelpful('no')}
              activeOpacity={0.82}
            >
              <ThumbsDown size={18} color={helpful === 'no' ? '#FFF' : '#94A3B8'} strokeWidth={2} />
              <Text style={[styles.feedbackBtnText, { color: helpful === 'no' ? '#FFF' : '#94A3B8' }]}>
                Not really
              </Text>
            </TouchableOpacity>
          </View>
          {helpful ? (
            <Text style={[styles.feedbackThanks, { color: accentColor }]}>
              {helpful === 'yes'
                ? '💛 Thanks for letting us know!'
                : "🙏 Thank you — we'll keep improving."}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Article image styles (remote + local with label) ────────────────────────
const remoteImgStyles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: SCREEN_WIDTH * 0.60, // overridden per-image via imageHeight prop
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  captionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.90)',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  labelBadge: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  labelCaption: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: 17,
  },
});

// ─── Local discharge image styles ─────────────────────────────────────────────
const localImgStyles = StyleSheet.create({
  card: {
    marginTop: 4,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: SCREEN_WIDTH * 0.85,
  },
  badge: {
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

// ─── Section card styles ──────────────────────────────────────────────────────
const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  numberBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  numberText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
    lineHeight: 22,
  },
  body: {
    fontSize: 14.5,
    color: '#4A5568',
    lineHeight: 23,
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FB' },
  container: { flex: 1 },
  content: { paddingBottom: 40 },

  // Hero
  heroWrapper: { marginBottom: 0 },
  heroGradient: {
    paddingHorizontal: 24,
    paddingBottom: 52,
    overflow: 'hidden',
  },
  decCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decCircle1: { width: 200, height: 200, top: -60, right: -40 },
  decCircle2: { width: 130, height: 130, bottom: 10, left: -30 },
  decCircle3: { width: 80, height: 80, top: 70, right: 90 },
  heroTopBar: { flexDirection: 'row', marginBottom: 20 },
  heroBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
    gap: 6,
  },
  categoryPillEmoji: { fontSize: 14 },
  categoryPillText: { fontSize: 12, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 34,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.92)' },
  heroClip: {
    height: 28,
    backgroundColor: '#F4F6FB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
  },

  // Intro
  introCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  introText: { fontSize: 15, color: '#2D3748', lineHeight: 24 },

  // Pre-section images
  imageBlock: { marginHorizontal: 20, marginBottom: 8 },

  // At a glance
  glanceSection: { marginHorizontal: 20, marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  glanceRow: { flexDirection: 'row', gap: 10 },
  glanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  glanceEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glanceEmoji: { fontSize: 22 },
  glanceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
    textAlign: 'center',
  },
  glanceDesc: { fontSize: 11, color: '#718096', textAlign: 'center', lineHeight: 15 },

  // Sections
  sectionsWrapper: { marginHorizontal: 20, marginBottom: 28 },

  // Color guide
  colorBox: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  colorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  colorRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  colorEmojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  colorEmoji: { fontSize: 20 },
  colorText: { flex: 1 },
  colorLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  colorMeaning: { fontSize: 13, color: '#718096', lineHeight: 18 },

  // Doctor box
  doctorBox: {
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  doctorGradient: { padding: 22 },
  doctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doctorIconEmoji: { fontSize: 22 },
  doctorHeading: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  doctorText: { fontSize: 14, color: '#374151', lineHeight: 22 },

  // Feedback
  feedbackSection: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
    textAlign: 'center',
  },
  feedbackSub: { fontSize: 13, color: '#94A3B8', marginBottom: 20, textAlign: 'center' },
  feedbackRow: { flexDirection: 'row', gap: 12, width: '100%' },
  feedbackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  feedbackBtnText: { fontSize: 14, fontWeight: '700' },
  feedbackThanks: { fontSize: 13, fontWeight: '600', marginTop: 14, textAlign: 'center' },

  // Error state
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6FB' },
  pad: { padding: 32 },
  errorText: { fontSize: 16, color: '#94A3B8', marginBottom: 16 },
  backBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  backBtnText: { fontSize: 16, fontWeight: '700' },
});