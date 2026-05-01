import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '@/hooks/useChatStore';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import ChatMessage from '@/components/ChatMessage';
import { Send, MessageCircle, Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// BUBBLE CONFIG
// ─────────────────────────────────────────────────────────────
const BUBBLES = [
  { size: 100, left: -25,                   top: 80,  color: 'rgba(255,107,157,0.08)', duration: 8000,  delay: 0    },
  { size: 65,  left: SCREEN_WIDTH - 55,     top: 160, color: 'rgba(157,113,232,0.09)', duration: 9500,  delay: 1000 },
  { size: 45,  left: 30,                    top: 280, color: 'rgba(91,191,221,0.08)',  duration: 7000,  delay: 500  },
  { size: 80,  left: SCREEN_WIDTH - 70,     top: 380, color: 'rgba(255,107,157,0.07)', duration: 10000, delay: 1800 },
  { size: 38,  left: SCREEN_WIDTH / 2 - 19, top: 220, color: 'rgba(157,113,232,0.08)', duration: 6500,  delay: 300  },
  { size: 55,  left: 15,                    top: 480, color: 'rgba(255,182,193,0.09)', duration: 8500,  delay: 1500 },
  { size: 30,  left: SCREEN_WIDTH - 45,     top: 560, color: 'rgba(91,191,221,0.10)', duration: 7500,  delay: 800  },
];

function FloatingBubble({
  size, left, top, color, duration, delay,
}: {
  size: number; left: number; top: number;
  color: string; duration: number; delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 1400, delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1, duration: 1400, delay,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -16, duration, delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0, duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: 1,
        borderColor: color.replace(/[\d.]+\)$/, '0.2)'),
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyState() {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 700, delay: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, duration: 700, delay: 300,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const suggestions = [
    "When is my next period?",
    "Am I in my fertile window?",
    "Tips for period cramps 🌿",
    "What's ovulation?",
  ];

  return (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* Icon blob */}
      <LinearGradient
        colors={['#FF6B9D', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIconBlob}
      >
        <Sparkles size={32} color="#FFFFFF" strokeWidth={2} />
      </LinearGradient>

      <Text style={styles.emptyTitle}>Hey there! 👋</Text>
      <Text style={styles.emptySubtitle}>
        I'm AuraBot, your personal cycle companion. Ask me anything about your cycle, fertility, or wellness.
      </Text>

      {/* Quick suggestion chips */}
      <View style={styles.suggestionsWrap}>
        {suggestions.map((s, i) => (
          <View key={i} style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>{s}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { messages, isLoading, sendMessage } = useChatStore();
  const [input, setInput] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Animated send button scale
  const sendScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: { endCoordinates: { height: number } }) => setKeyboardHeight(e.endCoordinates.height);
    const onHide = () => setKeyboardHeight(0);
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Bounce animation on send
    Animated.sequence([
      Animated.timing(sendScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(sendScale,  { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const headerPaddingTop    = insets.top + spacing.sm;
  const inputBottomPadding  = keyboardHeight > 0 ? Math.max(0, keyboardHeight - 56) : 16;
  const canSend             = !!input.trim() && !isLoading;

  return (
    <View style={styles.container}>
      {/* Background tint */}
      <LinearGradient
        colors={['#FFF0F6', '#FFFFFF', '#F5F0FF']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Floating background bubbles */}
      {BUBBLES.map((b, i) => <FloatingBubble key={i} {...b} />)}

      {/* ── Header (unchanged colors) ── */}
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: headerPaddingTop }]}
      >
        {/* Static header accent bubbles */}
        <View style={styles.headerBubble1} pointerEvents="none" />
        <View style={styles.headerBubble2} pointerEvents="none" />

        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.2)']}
              style={styles.headerIconWrap}
            >
              <MessageCircle size={24} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>AuraBot</Text>
              <Text style={styles.headerSubtitle}>Your cycle companion</Text>
            </View>
          </View>

          {/* Online indicator */}
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Chat area ── */}
      <View style={[styles.chatWrap, { paddingBottom: inputBottomPadding }]}>
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessage message={item} />}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesListEmpty,
            ]}
            ListEmptyComponent={<EmptyState />}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            testID="chat-messages-list"
          />

          {/* ── Input bar ── */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask AuraBot anything..."
                placeholderTextColor={Colors.lightText}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                testID="chat-input"
              />
              <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <TouchableOpacity
                  style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                  onPress={handleSend}
                  disabled={!canSend}
                  activeOpacity={0.85}
                  testID="send-button"
                >
                  <LinearGradient
                    colors={canSend ? ['#FF6B9D', '#9D71E8'] : [Colors.lightText, Colors.lightText]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendButtonGradient}
                  >
                    {isLoading
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
                      : <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {keyboardHeight === 0 && (
              <Text style={styles.disclaimer}>
                AuraBot is an AI assistant, not a medical professional.{'\n'}Always consult a healthcare provider for medical advice.
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },

  // ── Header ──
  header: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  headerBubble1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -18,
    right: 24,
  },
  headerBubble2: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 12,
    right: 88,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.3,
  },

  // ── Chat wrap ──
  chatWrap: { flex: 1 },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messagesList: {
    paddingBottom: 12,
  },
  messagesListEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyIconBlob: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...Platform.select({
      ios:     { shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    fontWeight: '500',
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: Colors.primary + '12',
    borderWidth: 1,
    borderColor: Colors.primary + '25',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  // ── Input ──
  inputWrapper: {
    paddingBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary + '20',
    ...Platform.select({
      ios:     { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16 },
      android: { elevation: 3 },
    }),
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  sendButton: {
    borderRadius: 22,
    overflow: 'hidden',
    marginLeft: 6,
    ...Platform.select({
      ios:     { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  sendButtonDisabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonGradient: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 10,
    color: Colors.lightText,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 15,
    opacity: 0.85,
  },
});