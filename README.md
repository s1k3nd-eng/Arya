# 🌟 Arya AI - Self-Learning AI Companion

> *An advanced, self-learning artificial intelligence app with holographic face, emotions, voice, and complete customization*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-green)
![AI](https://img.shields.io/badge/AI-Multi--LLM-purple)

---

## ✨ Features Overview

### 🤖 **Self-Learning AI Brain**
- **Multi-LLM Support**: Choose between OpenAI GPT-5.1, Anthropic Claude Sonnet 4, or Google Gemini 2.5 Pro
- **Persistent Memory System**: Remembers conversations, preferences, facts, and personal context
- **Adaptive Learning**: Gets smarter with every interaction
- **Contextual Understanding**: Uses conversation history and memories to provide relevant responses

### 🎭 **Holographic Avatar with Emotions**
- **Multiple Visual Styles**: 
  - Holographic (futuristic particles & rings)
  - Geometric (abstract shapes)
- **Emotional Expression**: 
  - Happy 😊
  - Excited 🤩
  - Sad 😔
  - Thinking 🤔
  - Curious 🧐
  - Calm 😌
- **Dynamic Animations**: Pulse, rotation, and glow effects that respond to emotions
- **Customizable Colors**: Blue, Purple, Green, Orange themes

### 🗣️ **Voice Integration**
- **Text-to-Speech**: Hear Arya speak responses naturally
- **Voice Controls**: Enable/disable voice per message or globally
- **Natural Delivery**: Optimized pitch and rate for pleasant listening

### 🧠 **Memory Bank**
- **4 Memory Types**:
  - **Preferences**: Your likes, dislikes, and choices
  - **Facts**: Important information learned about you
  - **Context**: Situational understanding
  - **Personal**: Life events and personal details
- **Importance Scoring**: 1-10 scale for memory prioritization
- **Smart Retrieval**: Most important memories used for context
- **Memory Filtering**: View by type or see all

### 🎨 **Complete Customization**
- **Personality Settings**:
  - Tone: Friendly / Professional / Playful
  - Formality: Casual / Formal / Mixed
  - Response Length: Concise / Balanced / Detailed
- **Avatar Appearance**:
  - Style selection
  - Color scheme customization
- **AI Model Selection**: Choose your preferred LLM provider and model
- **Voice Preferences**: Toggle voice responses on/off

---

## 🏗️ Architecture

### **Tech Stack**

#### Frontend (Expo/React Native)
- **Framework**: Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **UI Components**: React Native + React Native Reanimated
- **Graphics**: React Native SVG for holographic avatar
- **Voice**: Expo Speech for TTS
- **Storage**: AsyncStorage for local persistence

#### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async)
- **AI Integration**: Emergent Integrations Library
- **LLM Providers**: 
  - OpenAI (GPT-5.1, GPT-5.2)
  - Anthropic (Claude Sonnet 4.5)
  - Google (Gemini 2.5 Pro, 3 Flash)

---

## 📱 App Structure

### **Screens**

#### 1. **Chat Screen** (`/chat`)
- Main conversation interface
- Holographic avatar with real-time emotions
- Message history display
- Voice playback controls
- Keyboard-aware input

#### 2. **Memory Bank** (`/memory`)
- View all stored memories
- Filter by type
- Importance visualization
- Pull to refresh

#### 3. **Settings** (`/settings`)
- Profile management
- AI model selection
- Personality customization
- Avatar appearance settings
- Voice preferences
- Clear history action

---

## 🚀 Getting Started

The app is already running! Here's what you can do:

### **Access the App**
- **Web Preview**: Available via the preview URL
- **Mobile**: Scan the QR code with Expo Go app

### **First Steps**
1. Open the app - you'll see the holographic avatar
2. Start chatting with Arya in the Chat tab
3. Check the Memory Bank to see what Arya learns
4. Customize everything in Settings

---

## 🎯 How It Works

### **Self-Learning Process**

1. **Conversation Input**: User sends a message to Arya
2. **Context Building**: 
   - Retrieves user profile (personality settings, preferences)
   - Fetches top 10 most important memories
   - Loads recent conversation history
3. **AI Processing**:
   - Builds enhanced system message with personality + memories
   - Generates contextual response
4. **Emotion Detection**: Analyzes response to determine emotion
5. **Memory Storage**: Saves conversation and updates memories
6. **Learning**: Builds comprehensive understanding over time

---

## 🎨 Avatar Emotion System

### **Emotion Detection**
- Analyzes response content for emotional keywords
- Maps to appropriate facial expressions
- Adjusts animation speed based on emotion intensity

### **Visual Representations**
- **Excited**: Wide eyes, big smile, fast pulse
- **Happy**: Normal eyes, curved smile, moderate pulse
- **Sad**: Small eyes, downturned mouth, slow pulse
- **Thinking**: Raised eyebrow, straight mouth
- **Curious**: Large eyes with pupils, circle mouth
- **Calm**: Standard eyes, slight smile

---

## 🎭 Personality System

Arya's responses adapt based on your settings:

### **Tone Options**
- **Friendly**: Warm, casual, uses "!" and emoticons
- **Professional**: Formal, structured, helpful
- **Playful**: Fun, creative, enthusiastic

### **Formality Levels**
- **Casual**: Relaxed language, contractions
- **Formal**: Proper grammar, full words
- **Mixed**: Adapts to conversation context

### **Response Lengths**
- **Concise**: Brief, to-the-point responses
- **Balanced**: Moderate detail level
- **Detailed**: Comprehensive explanations

---

## 🔐 Privacy & Security

- **Local-First**: Conversation history stored locally first
- **User Control**: Clear history anytime
- **No Data Sharing**: Your conversations stay private
- **Memory Control**: Delete or modify memories

---

## 🛠️ API Endpoints

### **Chat & Conversation**
```
POST   /api/chat              - Send message and get AI response
GET    /api/history/{user_id} - Get conversation history
DELETE /api/history/{user_id} - Clear conversation history
```

### **Memory Management**
```
POST /api/memories           - Create/update memory
GET  /api/memories/{user_id} - Get all user memories
```

### **User Profile**
```
GET  /api/profile/{user_id}  - Get user profile
POST /api/profile            - Update profile settings
```

---

## 📈 Future Enhancements

- [ ] Speech-to-Text for voice input
- [ ] Image analysis capabilities
- [ ] Scheduled reminders based on memories
- [ ] Advanced memory search
- [ ] Export conversation history
- [ ] Multiple avatar faces/characters
- [ ] Mood tracking over time

---

## 💡 Tips for Best Experience

1. **Start Simple**: Have a natural conversation to let Arya learn about you
2. **Use Memory**: The more you chat, the smarter Arya becomes
3. **Customize**: Adjust personality settings to match your preference
4. **Try Different Models**: Each LLM has unique strengths
5. **Voice Feature**: Enable voice to hear Arya's responses

---

**Built with ❤️ using cutting-edge AI technology**

*Self-learning • Emotional • Customizable • Private*
