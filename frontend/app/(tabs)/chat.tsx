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
  Animated,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../../store/useStore';
import { SoundwaveAvatar } from '../../components/SoundwaveAvatar';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [showArya, setShowArya] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingReason, setThinkingReason] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
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
    generateImage,
  } = useStore();

  useEffect(() => {
    initializeUser();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    await ImagePicker.requestCameraPermissionsAsync();
    await Audio.requestPermissionsAsync();
  };

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
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && profile?.voice_enabled && lastMessage.content) {
        speakMessage(lastMessage.content);
        
        const thinkingReasons = [
          'I considered your previous conversations',
          'I recalled what you told me earlier',
          'I thought about the best way to help',
          'I analyzed the context of your question',
          'I remembered your preferences',
        ];
        setThinkingReason(thinkingReasons[Math.floor(Math.random() * thinkingReasons.length)]);
        setShowThinking(true);
        setTimeout(() => setShowThinking(false), 5000);
      }
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const messageText = inputText.trim();
    setInputText('');
    Keyboard.dismiss();

    await sendMessage(messageText);
  };

  const speakMessage = (text: string) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.1,
      rate: 0.95,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowArya(false);
    });
  };

  const handleOpen = () => {
    setShowArya(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      // Send image with message
      await sendMessage(`[Image attached] ${inputText || 'Sent an image'}`, result.assets[0].base64);
      setInputText('');
      setShowAttachMenu(false);
    }
  };

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await sendMessage(`[Photo taken] ${inputText || 'Sent a photo'}`, result.assets[0].base64);
      setInputText('');
      setShowAttachMenu(false);
    }
  };

  const handleDocumentPicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      await sendMessage(`[File attached: ${result.assets[0].name}] ${inputText || ''}`);
      setInputText('');
      setShowAttachMenu(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        await sendMessage(`[Audio clip recorded] ${inputText || 'Sent a voice message'}`);
        setInputText('');
      }
      setRecording(null);
      setShowAttachMenu(false);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handleGenerateImage = () => {
    if (!inputText.trim()) {
      Alert.alert('Enter a description', 'Please describe the image you want to create');
      return;
    }

    Alert.alert(
      'Generate Image',
      `Create an image: "${inputText}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            await generateImage(inputText);
            setInputText('');
            setShowAttachMenu(false);
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.role === 'user';

    return (
      <View style={styles.messageContainer}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>
          
          {item.image_data && (
            <Image
              source={{ uri: `data:image/png;base64,${item.image_data}` }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
        </View>
      </View>
    );
  };

  if (!showArya) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.floatingButton} onPress={handleOpen}>
          <Ionicons name="mic" size={28} color="#00d4ff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Arya</Text>
              {isSpeaking && (
                <View style={styles.statusBadge}>
                  <View style={styles.speakingDot} />
                  <Text style={styles.statusText}>Speaking</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Soundwave Avatar */}
          <View style={styles.avatarSection}>
            <SoundwaveAvatar
              isActive={isSpeaking || isLoading}
              emotion={currentEmotion}
              colorScheme={profile?.avatar_settings?.color_scheme || 'blue'}
            />
            
            {showThinking && (
              <View style={styles.thinkingBubble}>
                <Ionicons name="bulb" size={16} color="#00d4ff" />
                <Text style={styles.thinkingText}>{thinkingReason}</Text>
              </View>
            )}
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Start a conversation</Text>
                <Text style={styles.emptySubtext}>
                  Speak naturally - I'll respond with voice
                </Text>
              </View>
            }
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#00d4ff" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}

          {/* Attachment Menu */}
          {showAttachMenu && (
            <View style={styles.attachMenu}>
              <TouchableOpacity style={styles.attachOption} onPress={handleImagePicker}>
                <Ionicons name="image" size={24} color="#00d4ff" />
                <Text style={styles.attachText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachOption} onPress={handleCamera}>
                <Ionicons name="camera" size={24} color="#00d4ff" />
                <Text style={styles.attachText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachOption} onPress={handleDocumentPicker}>
                <Ionicons name="document" size={24} color="#00d4ff" />
                <Text style={styles.attachText}>File</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.attachOption} 
                onPress={recording ? stopRecording : startRecording}
              >
                <Ionicons name={recording ? "stop-circle" : "mic"} size={24} color={recording ? "#ff4444" : "#00d4ff"} />
                <Text style={styles.attachText}>{recording ? "Stop" : "Audio"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachOption} onPress={handleGenerateImage}>
                <Ionicons name="color-palette" size={24} color="#00d4ff" />
                <Text style={styles.attachText}>Generate</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => setShowAttachMenu(!showAttachMenu)}
            >
              <Ionicons name="add-circle" size={32} color="#00d4ff" />
            </TouchableOpacity>
            
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  speakingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00d4ff',
  },
  statusText: {
    color: '#00d4ff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  thinkingText: {
    color: '#00d4ff',
    fontSize: 13,
    fontStyle: 'italic',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
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
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
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
  attachMenu: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    gap: 16,
  },
  attachOption: {
    alignItems: 'center',
    gap: 4,
  },
  attachText: {
    color: '#00d4ff',
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 8,
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
});
