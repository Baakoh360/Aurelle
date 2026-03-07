import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Message } from '@/types';
import { useAppStore } from './useAppStore';

export const [ChatStoreProvider, useChatStore] = createContextHook(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, cycleData, getNextPeriodDate, getFertileWindow, getOvulationDate } = useAppStore();

  const getWelcomeContent = () =>
    user ? `Hi ${user.name}! I'm AuraBot, your personal health assistant. How can I help you today?` : 'Hi there! I\'m AuraBot, your personal health assistant. How can I help you today?';

  // Load messages from AsyncStorage on mount only; do not overwrite if user already sent something (avoid race).
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('chatMessages');
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: getWelcomeContent(),
          timestamp: Date.now()
        };
        setMessages((prev) => {
          if (prev.length > 0) return prev;
          if (storedMessages) return JSON.parse(storedMessages);
          return [welcomeMessage];
        });
        if (!storedMessages) {
          await saveMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [user]);

  // When the user's name changes, update the welcome message so the bot shows the new name.
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const first = prev[0];
      if (first.role !== 'assistant' || !first.content.includes('AuraBot')) return prev;
      const newContent = getWelcomeContent();
      if (first.content === newContent) return prev;
      const updated = [{ ...first, content: newContent }, ...prev.slice(1)];
      saveMessages(updated);
      return updated;
    });
  }, [user?.name]);

  // Save messages to AsyncStorage
  const saveMessages = async (updatedMessages: Message[]) => {
    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  // Add a new message (functional update so we never use stale messages; user message stays visible).
  const addMessage = async (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now()
    };
    let updated: Message[] = [];
    setMessages((prev) => {
      updated = [...prev, newMessage];
      return updated;
    });
    await saveMessages(updated);
    return newMessage;
  };

  // Send a message to the AI assistant
  const sendMessage = async (content: string) => {
    // Add user message
    await addMessage(content, 'user');
    setIsLoading(true);
    
    try {
      // Prepare context for the AI
      let contextInfo = '';
      if (user && cycleData) {
        const nextPeriod = getNextPeriodDate();
        const fertileWindow = getFertileWindow();
        const ovulationDate = getOvulationDate();
        
        contextInfo = `User's name: ${user.name}
        Is pregnant: ${user.isPregnant ? 'Yes' : 'No'}
        ${nextPeriod ? `Next period expected: ${nextPeriod}` : ''}
        ${ovulationDate ? `Ovulation date: ${ovulationDate}` : ''}
        ${fertileWindow ? `Fertile window: ${fertileWindow.start} to ${fertileWindow.end}` : ''}`;
      }
      
      // Prepare messages for the AI
      const aiMessages = [
        {
          role: 'system',
          content: `You are AuraBot, a friendly and supportive AI assistant for the Aurelle women's health app. 
          You help users track their menstrual cycles, fertility, and pregnancy. 
          Be empathetic, informative, and supportive. 
          Provide helpful advice about women's health, but always clarify you're not a medical professional.
          If users report concerning symptoms, suggest they consult a healthcare provider.
          Here is some context about the user: ${contextInfo}`
        },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content }
      ];
      
      // Make API request to AI service
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: aiMessages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      await addMessage(data.completion, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      await addMessage('Sorry, I encountered an error. Please try again later.', 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all messages
  const clearMessages = async () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: user ? `Hi ${user.name}! I'm AuraBot, your personal health assistant. How can I help you today?` : 'Hi there! I\'m AuraBot, your personal health assistant. How can I help you today?',
      timestamp: Date.now()
    };
    
    setMessages([welcomeMessage]);
    await saveMessages([welcomeMessage]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
});