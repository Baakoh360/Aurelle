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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '@/hooks/useChatStore';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import ChatMessage from '@/components/ChatMessage';
import { Send, MessageCircle } from 'lucide-react-native';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { messages, isLoading, sendMessage } = useChatStore();
  const [input, setInput] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: { endCoordinates: { height: number } }) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const headerPaddingTop = insets.top + spacing.sm;
  const inputBottomPadding = keyboardHeight > 0 ? Math.max(0, keyboardHeight - 56) : 16;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: headerPaddingTop }]}
      >
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
        </View>
      </LinearGradient>

      <View style={[styles.chatWrap, { paddingBottom: inputBottomPadding }]}>
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessage message={item} />}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            testID="chat-messages-list"
          />

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
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
              testID="send-button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {keyboardHeight === 0 && (
            <Text style={styles.disclaimer}>
              AuraBot is an AI assistant and not a medical professional.
              Always consult a healthcare provider for medical advice.
            </Text>
          )}
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
  header: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
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
  chatWrap: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messagesList: {
    paddingBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 8,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
    color: Colors.text,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.lightText,
  },
  disclaimer: {
    fontSize: 10,
    color: Colors.lightText,
    textAlign: 'center',
    marginTop: 8,
  },
});
