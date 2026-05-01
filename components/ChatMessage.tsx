import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Message } from '@/types';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';

interface ChatMessageProps {
  message: Message;
}

/** Strip markdown # / ## so hashes don't show in the message. */
function stripHeadingHashes(text: string): string {
  return text
    .replace(/^#{1,6}\s*/gm, '')  // line-start # to ###### and optional space
    .replace(/##/g, '');
}

/** Renders text with **bold** or *bold* markdown as actual bold. */
function FormattedMessage({ content, baseStyle }: { content: string; baseStyle: object }) {
  const cleaned = stripHeadingHashes(content);
  const segments: { type: 'normal' | 'bold'; text: string }[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;
  let lastIndex = 0;
  while ((match = re.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'normal', text: cleaned.slice(lastIndex, match.index) });
    }
    const boldText = match[1] ?? match[2] ?? '';
    segments.push({ type: 'bold', text: boldText });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < cleaned.length) {
    segments.push({ type: 'normal', text: cleaned.slice(lastIndex) });
  }
  if (segments.length === 0) {
    return <Text style={baseStyle}>{cleaned}</Text>;
  }
  return (
    <Text style={baseStyle}>
      {segments.map((seg, i) =>
        seg.type === 'bold' ? (
          <Text key={i} style={[baseStyle, styles.bold]}>{seg.text}</Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  );
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const textStyle = [styles.text, isUser ? styles.userText : styles.assistantText];

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <FormattedMessage content={message.content} baseStyle={StyleSheet.flatten(textStyle)} />
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
  bold: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 10,
    color: Colors.lightText,
    alignSelf: 'flex-end',
  },
});

export default ChatMessage;