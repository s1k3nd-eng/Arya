import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../../store/useStore';
import { HolographicAvatar } from '../../components/HolographicAvatar';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const {
    userId,
    messages,
    profile,
    isLoading,
    currentEmotion,
    setUserId,
    sendMessage,
    loadHistory,
    loadProfile,
  } = useStore();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      let storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('userId', storedUserId);
      }
      setUserId(storedUserId);
      loadProfile();
      loadHistory();
    } catch (error) {
      console.error('Init error:', error);
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const messageText = inputText.trim();
    setInputText('');
    Keyboard.dismiss();

    await sendMessage(messageText);
  };

  const speakMessage = (text: string) => {
    if (profile?.voice_enabled) {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
  };

  const renderMessage = ({ item, index }: any) => {
    const isUser = item.role === 'user';
    const isLastMessage = index === messages.length - 1;

    // Auto-speak last assistant message if voice is enabled
    if (!isUser && isLastMessage && profile?.voice_enabled && item.content) {
      setTimeout(() => speakMessage(item.content), 500);
    }

    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && item.emotion && (
          <View style={styles.emotionBadge}>
            <Text style={styles.emotionText}>{getEmotionEmoji(item.emotion)}</Text>
          </View>
        )}
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.content}
        </Text>
        {!isUser && profile?.voice_enabled && (
          <TouchableOpacity
            onPress={() => speakMessage(item.content)}
            style={styles.speakButton}
          >
            <Ionicons name="volume-medium" size={16} color="#00d4ff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Arya AI</Text>
          <Text style={styles.subtitle}>Your Self-Learning Companion</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <HolographicAvatar
            emotion={currentEmotion}
            style={profile?.avatar_settings?.style || 'holographic'}
            colorScheme={profile?.avatar_settings?.color_scheme || 'blue'}
          />
          <Text style={styles.emotionLabel}>
            {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
          </Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles" size={60} color="#333" />
              <Text style={styles.emptyText}>Start a conversation with Arya</Text>
              <Text style={styles.emptySubtext}>
                I learn from our interactions and remember everything!
              </Text>
            </View>
          }
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#00d4ff" />
            <Text style={styles.loadingText}>Arya is thinking...</Text>
          </View>
        )}

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message Arya..."
            placeholderTextColor="#666"
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() && !isLoading ? '#00d4ff' : '#666'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getEmotionEmoji = (emotion: string): string => {
  switch (emotion) {
    case 'happy': return '😊';
    case 'excited': return '🤩';
    case 'sad': return '😔';
    case 'thinking': return '🤔';
    case 'curious': return '🧐';
    default: return '😌';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emotionLabel: {
    color: '#00d4ff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#00d4ff',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#000',
  },
  aiText: {
    color: '#fff',
  },
  emotionBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  emotionText: {
    fontSize: 16,
  },
  speakButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#666',
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
