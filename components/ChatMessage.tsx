import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Message } from '@/types';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.assistantText
        ]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
  },
  userBubble: {
    backgroundColor: Colors.primary,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.15)',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.lightText,
    alignSelf: 'flex-end',
  },
});

export default ChatMessage;