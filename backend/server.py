from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
import json
import asyncio
import base64
import traceback
import sys
from collections import deque
from datetime import datetime, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== Models ====================

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    emotion: Optional[str] = None  # For assistant messages
    image_data: Optional[str] = None  # base64 image
    audio_data: Optional[str] = None  # base64 audio
    file_name: Optional[str] = None  # attachment filename

class ConversationHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Memory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    memory_type: str  # "preference", "fact", "context", "personal"
    key: str
    value: str
    importance: int = 5  # 1-10 scale
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    accessed_count: int = 0

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: Optional[str] = None
    preferences: Dict[str, Any] = {}
    personality_settings: Dict[str, str] = {
        "tone": "friendly",
        "formality": "casual",
        "verbosity": "balanced"
    }
    avatar_settings: Dict[str, str] = {
        "style": "holographic",
        "color_scheme": "blue"
    }
    llm_provider: str = "openai"  # "openai", "anthropic", "gemini"
    llm_model: str = "gpt-5.1"
    voice_enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    user_id: str
    message: str
    provider: Optional[str] = "openai"
    model: Optional[str] = "gpt-5.1"
    image_data: Optional[str] = None  # base64 encoded image
    audio_data: Optional[str] = None  # base64 encoded audio

class ImageGenerationRequest(BaseModel):
    user_id: str
    prompt: str
    model: Optional[str] = "gpt-image-1"

class VideoGenerationRequest(BaseModel):
    user_id: str
    prompt: str
    duration: Optional[int] = 5  # seconds

class MemoryCreate(BaseModel):
    user_id: str
    memory_type: str
    key: str
    value: str
    importance: int = 5

class ProfileUpdate(BaseModel):
    user_id: str
    name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    personality_settings: Optional[Dict[str, str]] = None
    avatar_settings: Optional[Dict[str, str]] = None
    llm_provider: Optional[str] = None
    llm_model: Optional[str] = None
    voice_enabled: Optional[bool] = None

# ==================== Helper Functions ====================

async def get_user_profile(user_id: str) -> UserProfile:
    """Get or create user profile"""
    profile_doc = await db.profiles.find_one({"user_id": user_id})
    if profile_doc:
        return UserProfile(**profile_doc)
    else:
        # Create new profile
        new_profile = UserProfile(user_id=user_id)
        await db.profiles.insert_one(new_profile.dict())
        return new_profile

async def get_relevant_memories(user_id: str, limit: int = 10) -> List[Memory]:
    """Get most relevant/recent memories for context"""
    memories_cursor = db.memories.find({"user_id": user_id}).sort([
        ("importance", -1),
        ("updated_at", -1)
    ]).limit(limit)
    memories = await memories_cursor.to_list(length=limit)
    return [Memory(**m) for m in memories]

async def get_conversation_history(user_id: str, limit: int = 20) -> List[ChatMessage]:
    """Get recent conversation history"""
    conv_doc = await db.conversations.find_one({"user_id": user_id})
    if conv_doc:
        conv = ConversationHistory(**conv_doc)
        return conv.messages[-limit:]  # Return last N messages
    return []

async def save_message(user_id: str, message: ChatMessage):
    """Save a message to conversation history"""
    conv_doc = await db.conversations.find_one({"user_id": user_id})
    if conv_doc:
        await db.conversations.update_one(
            {"user_id": user_id},
            {
                "$push": {"messages": message.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    else:
        new_conv = ConversationHistory(user_id=user_id, messages=[message])
        await db.conversations.insert_one(new_conv.dict())

def determine_emotion(text: str) -> str:
    """Simple emotion detection based on content"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['!', 'wow', 'amazing', 'great', 'awesome', 'excellent']):
        return "excited"
    elif any(word in text_lower for word in ['?', 'how', 'what', 'why', 'when', 'where']):
        return "thinking"
    elif any(word in text_lower for word in ['sorry', 'unfortunately', 'sad', 'concern']):
        return "sad"
    elif any(word in text_lower for word in ['yes', 'sure', 'certainly', 'of course']):
        return "happy"
    elif any(word in text_lower for word in ['hmm', 'interesting', 'tell me more']):
        return "curious"
    else:
        return "calm"

def build_system_message(profile: UserProfile, memories: List[Memory]) -> str:
    """Build enhanced system message with personality and memories"""
    tone = profile.personality_settings.get("tone", "friendly")
    formality = profile.personality_settings.get("formality", "casual")
    verbosity = profile.personality_settings.get("verbosity", "balanced")
    
    name_context = f"The user's name is {profile.name}." if profile.name else "You don't know the user's name yet."
    
    memory_context = ""
    if memories:
        memory_context = "\n\nWhat you remember about the user:\n"
        for mem in memories[:5]:  # Top 5 most important memories
            memory_context += f"- {mem.key}: {mem.value}\n"
    
    system_msg = f"""You are Arya, an advanced self-learning AI companion designed for natural voice interaction.

Your personality traits:
- Tone: {tone}
- Formality: {formality} 
- Response length: {verbosity}

{name_context}{memory_context}

CRITICAL RULES:
1. NEVER use emojis or emoticons in your responses
2. Keep responses conversational and natural for voice
3. Be direct and concise - say only what's necessary
4. Speak like a real person, not a text chatbot
5. When you learn something important, simply acknowledge it naturally
6. Show emotions through your words and tone, not symbols

You learn from conversations and remember important details. Be warm, empathetic, and genuinely helpful."""
    
    return system_msg

# ==================== API Routes ====================

@api_router.get("/")
async def root():
    return {"message": "Arya AI Backend - Self-Learning AI Assistant", "status": "online"}

@api_router.post("/chat")
async def chat(request: ChatRequest):
    """Send a chat message and get AI response"""
    try:
        # Get user profile and context
        profile = await get_user_profile(request.user_id)
        memories = await get_relevant_memories(request.user_id)
        history = await get_conversation_history(request.user_id, limit=10)
        
        # Save user message
        user_msg = ChatMessage(role="user", content=request.message)
        await save_message(request.user_id, user_msg)
        
        # Build system message with context
        system_message = build_system_message(profile, memories)
        
        # Determine which LLM to use
        provider = request.provider or profile.llm_provider
        model = request.model or profile.llm_model
        
        # Initialize LLM chat
        chat_session = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=request.user_id,
            system_message=system_message
        )
        
        # Set the model based on provider
        if provider == "openai":
            chat_session.with_model("openai", model)
        elif provider == "anthropic":
            chat_session.with_model("anthropic", model)
        elif provider == "gemini":
            chat_session.with_model("gemini", model)
        
        # Get response
        user_message = UserMessage(text=request.message)
        response = await chat_session.send_message(user_message)
        
        # Determine emotion from response
        emotion = determine_emotion(response)
        
        # Save assistant message
        assistant_msg = ChatMessage(
            role="assistant",
            content=response,
            emotion=emotion
        )
        await save_message(request.user_id, assistant_msg)
        
        return {
            "message": response,
            "emotion": emotion,
            "provider": provider,
            "model": model
        }
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/memories")
async def create_memory(memory: MemoryCreate):
    """Create a new memory"""
    try:
        # Check if memory with same key exists
        existing = await db.memories.find_one({
            "user_id": memory.user_id,
            "key": memory.key
        })
        
        if existing:
            # Update existing memory
            await db.memories.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        "value": memory.value,
                        "importance": memory.importance,
                        "updated_at": datetime.utcnow()
                    },
                    "$inc": {"accessed_count": 1}
                }
            )
            return {"status": "updated", "memory": memory.dict()}
        else:
            # Create new memory
            new_memory = Memory(**memory.dict())
            await db.memories.insert_one(new_memory.dict())
            return {"status": "created", "memory": new_memory.dict()}
            
    except Exception as e:
        logger.error(f"Memory creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/memories/{user_id}")
async def get_memories(user_id: str):
    """Get all memories for a user"""
    try:
        memories = await get_relevant_memories(user_id, limit=100)
        return {"memories": [m.dict() for m in memories]}
    except Exception as e:
        logger.error(f"Get memories error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 50):
    """Get conversation history"""
    try:
        history = await get_conversation_history(user_id, limit)
        return {"history": [m.dict() for m in history]}
    except Exception as e:
        logger.error(f"Get history error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/profile")
async def update_profile(update: ProfileUpdate):
    """Update user profile settings"""
    try:
        profile = await get_user_profile(update.user_id)
        
        update_dict = {"updated_at": datetime.utcnow()}
        if update.name:
            update_dict["name"] = update.name
        if update.preferences:
            update_dict["preferences"] = {**profile.preferences, **update.preferences}
        if update.personality_settings:
            update_dict["personality_settings"] = {**profile.personality_settings, **update.personality_settings}
        if update.avatar_settings:
            update_dict["avatar_settings"] = {**profile.avatar_settings, **update.avatar_settings}
        if update.llm_provider:
            update_dict["llm_provider"] = update.llm_provider
        if update.llm_model:
            update_dict["llm_model"] = update.llm_model
        if update.voice_enabled is not None:
            update_dict["voice_enabled"] = update.voice_enabled
        
        await db.profiles.update_one(
            {"user_id": update.user_id},
            {"$set": update_dict}
        )
        
        # Get updated profile
        updated_profile = await get_user_profile(update.user_id)
        return {"profile": updated_profile.dict()}
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile"""
    try:
        profile = await get_user_profile(user_id)
        return {"profile": profile.dict()}
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/history/{user_id}")
async def clear_history(user_id: str):
    """Clear conversation history"""
    try:
        await db.conversations.delete_one({"user_id": user_id})
        return {"status": "cleared"}
    except Exception as e:
        logger.error(f"Clear history error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate-image")
async def generate_image(request: ImageGenerationRequest):
    """Generate an image from text prompt"""
    try:
        # Initialize image generator
        image_gen = OpenAIImageGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
        
        # Generate image
        images = await image_gen.generate_images(
            prompt=request.prompt,
            model=request.model or "gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            # Convert to base64
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            
            # Save to conversation history
            user_msg = ChatMessage(
                role="user",
                content=f"Generate an image: {request.prompt}"
            )
            await save_message(request.user_id, user_msg)
            
            assistant_msg = ChatMessage(
                role="assistant",
                content="I've created the image for you.",
                emotion="excited"
            )
            assistant_msg.image_data = image_base64
            await save_message(request.user_id, assistant_msg)
            
            return {
                "image_base64": image_base64,
                "message": "Image generated successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="No image was generated")
            
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate-video")
async def generate_video(request: VideoGenerationRequest):
    """Generate a video from text prompt (placeholder for now)"""
    try:
        # Note: Real video generation would require services like Runway, Pika, etc.
        # For now, return a placeholder response
        return {
            "video_url": None,
            "message": "Video generation coming soon! This feature requires specialized video AI services.",
            "status": "placeholder"
        }
    except Exception as e:
        logger.error(f"Video generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()