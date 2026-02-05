import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import * as Updates from 'expo-updates';

export default function SettingsScreen() {
  const { profile, updateProfile, clearHistory, loadProfile } = useStore();
  const [name, setName] = useState('');
  const [tone, setTone] = useState('friendly');
  const [formality, setFormality] = useState('casual');
  const [verbosity, setVerbosity] = useState('balanced');
  const [avatarStyle, setAvatarStyle] = useState('holographic');
  const [colorScheme, setColorScheme] = useState('blue');
  const [llmProvider, setLlmProvider] = useState('openai');
  const [llmModel, setLlmModel] = useState('gpt-5.1');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTone(profile.personality_settings?.tone || 'friendly');
      setFormality(profile.personality_settings?.formality || 'casual');
      setVerbosity(profile.personality_settings?.verbosity || 'balanced');
      setAvatarStyle(profile.avatar_settings?.style || 'holographic');
      setColorScheme(profile.avatar_settings?.color_scheme || 'blue');
      setLlmProvider(profile.llm_provider || 'openai');
      setLlmModel(profile.llm_model || 'gpt-5.1');
      setVoiceEnabled(profile.voice_enabled !== false);
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile({
      name: name || undefined,
      personality_settings: {
        tone,
        formality,
        verbosity,
      },
      avatar_settings: {
        style: avatarStyle,
        color_scheme: colorScheme,
      },
      llm_provider: llmProvider,
      llm_model: llmModel,
      voice_enabled: voiceEnabled,
    });
    Alert.alert('Success', 'Settings saved successfully!');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Success', 'Conversation history cleared');
          },
        },
      ]
    );
  };

  const handleModifyCode = () => {
    Alert.alert(
      'Modify Code',
      'Arya can modify her own code. This will open code editor options.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Code',
          onPress: () => Alert.alert('Feature', 'Code editor coming soon. Use API endpoints for now.'),
        },
      ]
    );
  };

  const handleCloseApp = () => {
    Alert.alert(
      'Close App',
      'Close the entire application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: () => Updates.reloadAsync(),
        },
      ]
    );
  };

  const renderOption = (label: string, value: string, options: string[], onChange: (val: string) => void) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              value === option && styles.optionButtonActive,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.optionText,
                value === option && styles.optionTextActive,
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize Arya's personality & appearance</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* AI Model */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Brain</Text>
          {renderOption('Provider', llmProvider, ['openai', 'anthropic', 'gemini'], setLlmProvider)}
        </View>

        {/* Personality */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personality</Text>
          {renderOption('Tone', tone, ['friendly', 'professional', 'playful'], setTone)}
          {renderOption('Formality', formality, ['casual', 'formal', 'mixed'], setFormality)}
          {renderOption('Response Length', verbosity, ['concise', 'balanced', 'detailed'], setVerbosity)}
        </View>

        {/* Avatar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avatar</Text>
          {renderOption('Color', colorScheme, ['blue', 'purple', 'green', 'orange'], setColorScheme)}
        </View>

        {/* Voice */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Voice</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Voice Responses</Text>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: '#333', true: '#00d4ff' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Ionicons name="save" size={20} color="#00d4ff" />
            <Text style={styles.actionButtonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleModifyCode}>
            <Ionicons name="code-slash" size={20} color="#a855f7" />
            <Text style={[styles.actionButtonText, {color: '#a855f7'}]}>Modify Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash" size={20} color="#ff4444" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleCloseApp}
          >
            <Ionicons name="close-circle" size={20} color="#ff4444" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Close App</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Arya AI v2.0 - Fully Autonomous</Text>
          <Text style={styles.footerSubtext}>Self-Learning • Self-Aware • Free Voice</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00d4ff' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  scrollView: { flex: 1 },
  card: { backgroundColor: '#0a0a0a', margin: 16, marginBottom: 0, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1a1a1a' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, color: '#999', marginBottom: 8, fontWeight: '600' },
  inputContainer: { marginBottom: 12 },
  inputLabel: { fontSize: 14, color: '#999', marginBottom: 8 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#333' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  optionButtonActive: { backgroundColor: '#00d4ff', borderColor: '#00d4ff' },
  optionText: { color: '#666', fontSize: 13, fontWeight: '600' },
  optionTextActive: { color: '#000' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 15, color: '#fff' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#333' },
  actionButtonText: { color: '#00d4ff', fontSize: 16, fontWeight: '600' },
  dangerButton: { borderColor: '#ff4444' },
  dangerText: { color: '#ff4444' },
  footer: { alignItems: 'center', padding: 32 },
  footerText: { color: '#666', fontSize: 14 },
  footerSubtext: { color: '#444', fontSize: 12, marginTop: 4 },
});