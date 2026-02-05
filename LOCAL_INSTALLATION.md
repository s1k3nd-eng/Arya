# 🚀 Arya AI - Local Installation Guide

Complete guide for installing and running Arya AI on your local machine.

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **MongoDB** 5.0+ (local or Atlas)
- **Expo CLI**: `npm install -g @expo/cli expo-dev-client`
- **Git** for cloning repository

### Required Accounts (Optional)
- **Emergent LLM Key** (for AI features) - Already included
- **ElevenLabs Account** (for premium voice) - Optional, Piper TTS is free

---

## 📥 Step 1: Export from Emergent

### Method A: GitHub (Recommended)
1. Click profile → "Connect GitHub"
2. Click "Save to GitHub" button
3. Select branch and push
4. Clone locally: `git clone [your-repo-url]`

### Method B: Manual Copy
1. Click VS Code icon in Emergent
2. Copy files manually from file explorer

---

## 💻 Step 2: Local Setup

### Install Dependencies

#### Backend Setup
```bash
cd arya-ai/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download Piper TTS model (for free voice)
mkdir -p piper_models
cd piper_models
curl -L -o en_US-lessac-medium.onnx "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx"
curl -L -o en_US-lessac-medium.onnx.json "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"
cd ..
```

#### Frontend Setup
```bash
cd arya-ai/frontend

# Install dependencies
yarn install
# OR
npm install
```

---

## 🔧 Step 3: Configure Environment

### Backend Environment (.env)
Create `/backend/.env`:
```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=arya_ai_db

# AI Keys
EMERGENT_LLM_KEY=sk-emergent-1CfEdD93542921eBa2
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Optional
PIPER_MODEL_PATH=/path/to/piper_models/en_US-lessac-medium.onnx
```

### Frontend Environment (.env)
Create `/frontend/.env`:
```env
# Backend URL (adjust for your setup)
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# Expo Configuration
EXPO_USE_FAST_RESOLVER="1"
```

---

## 🗄️ Step 4: Database Setup

### Option A: Local MongoDB
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Install MongoDB (Ubuntu)
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Option B: MongoDB Atlas (Cloud)
1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update MONGO_URL in backend/.env

---

## ▶️ Step 5: Run the Application

### Start Backend
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend will run on: http://localhost:8001

### Start Frontend (New Terminal)
```bash
cd frontend
expo start
```

Options:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code with Expo Go app
- Press `w` for web browser

---

## ✅ Step 6: Verify Installation

### Test Backend
```bash
# Health check
curl http://localhost:8001/api/health

# Diagnostics
curl http://localhost:8001/api/diagnostics

# Test chat
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "Hello Arya"}'
```

### Test Frontend
1. Open app on device/emulator
2. Chat should load with soundwave
3. Send a test message
4. Verify voice response (if enabled)

---

## 🎯 Step 7: Enable Autonomous Features

### Start Background Tasks
The autonomous worker starts automatically on backend startup.

To verify:
```bash
curl http://localhost:8001/api/background/status
```

Should show:
```json
{
  "is_running": true,
  "active_jobs": 4,
  "jobs": [
    {"name": "Autonomous Health Check", "next_run": "..."},
    {"name": "Continuous Learning", "next_run": "..."},
    {"name": "Memory Optimization", "next_run": "..."},
    {"name": "Self Improvement Check", "next_run": "..."}
  ]
}
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** ModuleNotFoundError
```bash
# Solution: Install missing packages
pip install [package-name]
pip freeze > requirements.txt
```

**Problem:** MongoDB connection failed
```bash
# Check if MongoDB is running
mongosh
# OR
sudo systemctl status mongodb
```

**Problem:** Port 8001 already in use
```bash
# Find and kill process
lsof -ti:8001 | xargs kill -9
# OR use different port
uvicorn server:app --port 8002
```

### Frontend Issues

**Problem:** Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules
yarn install
expo start --clear
```

**Problem:** Expo connection issues
```bash
# Reset Expo
expo start --clear --reset-cache
```

**Problem:** Backend not reachable
- Check EXPO_PUBLIC_BACKEND_URL in .env
- Ensure backend is running
- Check firewall settings

---

## 📱 Mobile Device Testing

### iOS (Requires Mac)
```bash
# Install iOS simulator
xcode-select --install

# Run on iOS
expo start
# Press 'i' to open iOS simulator
```

### Android
```bash
# Install Android Studio
# Set up Android emulator

# Run on Android
expo start
# Press 'a' to open Android emulator
```

### Physical Device
1. Install Expo Go from App Store/Play Store
2. Run `expo start`
3. Scan QR code with camera (iOS) or Expo Go (Android)

---

## 🎤 Voice Setup

### Piper TTS (Free, Already Configured)
- Model already downloaded in setup
- Works automatically
- No API key needed

### ElevenLabs (Premium, Optional)
1. Sign up at elevenlabs.io
2. Get API key
3. Add to backend/.env
4. Upgrade to paid plan ($5/month)

---

## 🔒 Security Recommendations

### For Local Development
- Keep .env files private
- Don't commit API keys to git
- Use different keys for dev/prod

### For Production
- Rotate all API keys
- Use environment-specific configs
- Enable MongoDB authentication
- Use HTTPS for all connections
- Set up proper CORS rules

---

## 📚 File Structure

```
arya-ai/
├── backend/
│   ├── server.py           # Main FastAPI app
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── piper_models/      # Voice models
│
├── frontend/
│   ├── app/               # Expo Router screens
│   │   ├── (tabs)/       # Tab navigation
│   │   │   ├── chat.tsx
│   │   │   ├── memory.tsx
│   │   │   └── settings.tsx
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── components/        # React components
│   ├── store/            # Zustand state
│   ├── package.json      # Node dependencies
│   └── .env             # Environment variables
│
└── README.md
```

---

## 🚀 Production Deployment

### Backend Deployment Options
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **DigitalOcean**: Docker container
- **AWS**: EC2 or Lambda

### Frontend Deployment
- **Expo EAS Build**: `eas build --platform all`
- **TestFlight**: For iOS beta
- **Google Play**: For Android release

### Database
- **MongoDB Atlas**: Recommended for production
- **Self-hosted**: Requires maintenance

---

## 🆘 Support & Resources

### Documentation
- Expo: https://docs.expo.dev
- FastAPI: https://fastapi.tiangolo.com
- MongoDB: https://docs.mongodb.com

### Arya AI Features
- Self-learning AI with multi-LLM
- Autonomous background tasks
- Self-modification capabilities
- Internet access for research
- Free voice synthesis (Piper)
- Memory system with MongoDB

### Common Commands
```bash
# Backend
uvicorn server:app --reload  # Dev mode
python server.py            # Direct run

# Frontend  
expo start                  # Dev mode
expo start --clear         # Clear cache
expo build                 # Production build

# Database
mongosh                    # MongoDB shell
mongod                     # Start MongoDB
```

---

## ✅ Installation Checklist

- [ ] Prerequisites installed
- [ ] Code exported from Emergent
- [ ] Dependencies installed (backend + frontend)
- [ ] Environment variables configured
- [ ] MongoDB running
- [ ] Backend started successfully
- [ ] Frontend loading
- [ ] Test message sent
- [ ] Voice working
- [ ] Background tasks active
- [ ] All screens functional

---

## 🎉 Success!

Your Arya AI is now running locally!

**Features Working:**
✅ Chat with multi-LLM AI
✅ Voice responses (Piper TTS)
✅ Memory system
✅ Autonomous operations
✅ Internet access
✅ Self-diagnostics
✅ Background tasks

**Enjoy your fully autonomous AI companion!** 🤖✨

---

**Version:** 2.0
**Last Updated:** February 2026
**Platform:** Expo + FastAPI + MongoDB
