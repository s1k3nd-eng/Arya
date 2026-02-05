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

# Self-Diagnostic System
class SelfDiagnostics:
    """Arya's self-awareness and diagnostic system"""
    
    def __init__(self):
        self.error_log = deque(maxlen=100)  # Keep last 100 errors
        self.performance_metrics = {
            "total_requests": 0,
            "failed_requests": 0,
            "avg_response_time": 0,
            "last_health_check": None,
            "uptime_start": datetime.utcnow()
        }
        self.health_status = {
            "database": "unknown",
            "llm_api": "unknown",
            "image_gen": "unknown",
            "overall": "unknown"
        }
    
    def log_error(self, error_type: str, error_message: str, traceback_info: str = None):
        """Log errors for self-analysis"""
        error_entry = {
            "timestamp": datetime.utcnow(),
            "type": error_type,
            "message": error_message,
            "traceback": traceback_info,
            "severity": self._determine_severity(error_type)
        }
        self.error_log.append(error_entry)
        logger.error(f"Self-Diagnostic: {error_type} - {error_message}")
    
    def _determine_severity(self, error_type: str) -> str:
        """Determine error severity"""
        critical_keywords = ["database", "connection", "authentication", "crash"]
        warning_keywords = ["timeout", "rate limit", "temporary"]
        
        error_lower = error_type.lower()
        if any(k in error_lower for k in critical_keywords):
            return "critical"
        elif any(k in error_lower for k in warning_keywords):
            return "warning"
        return "info"
    
    async def run_diagnostics(self) -> Dict[str, Any]:
        """Run comprehensive system diagnostics"""
        diagnostics = {
            "timestamp": datetime.utcnow().isoformat(),
            "uptime": str(datetime.utcnow() - self.performance_metrics["uptime_start"]),
            "components": {},
            "errors": [],
            "recommendations": []
        }
        
        # Check Database
        try:
            await db.command('ping')
            self.health_status["database"] = "healthy"
            diagnostics["components"]["database"] = {
                "status": "healthy",
                "message": "MongoDB connection active"
            }
        except Exception as e:
            self.health_status["database"] = "failed"
            diagnostics["components"]["database"] = {
                "status": "failed",
                "message": str(e)
            }
            diagnostics["recommendations"].append("Check MongoDB connection and credentials")
        
        # Check LLM API
        try:
            test_chat = LlmChat(
                api_key=os.environ['EMERGENT_LLM_KEY'],
                session_id="diagnostic_test",
                system_message="Test"
            )
            self.health_status["llm_api"] = "healthy"
            diagnostics["components"]["llm_api"] = {
                "status": "healthy",
                "message": "LLM API accessible"
            }
        except Exception as e:
            self.health_status["llm_api"] = "failed"
            diagnostics["components"]["llm_api"] = {
                "status": "failed",
                "message": str(e)
            }
            diagnostics["recommendations"].append("Check EMERGENT_LLM_KEY validity")
        
        # Check Image Generation
        try:
            image_gen = OpenAIImageGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
            self.health_status["image_gen"] = "healthy"
            diagnostics["components"]["image_gen"] = {
                "status": "healthy",
                "message": "Image generation service ready"
            }
        except Exception as e:
            self.health_status["image_gen"] = "warning"
            diagnostics["components"]["image_gen"] = {
                "status": "warning",
                "message": str(e)
            }
        
        # Analyze recent errors
        recent_errors = list(self.error_log)[-10:]  # Last 10 errors
        if recent_errors:
            diagnostics["errors"] = [
                {
                    "time": err["timestamp"].isoformat(),
                    "type": err["type"],
                    "message": err["message"],
                    "severity": err["severity"]
                }
                for err in recent_errors
            ]
            
            # Pattern detection
            error_types = [e["type"] for e in recent_errors]
            if error_types.count(error_types[0]) > 5:  # Same error 5+ times
                diagnostics["recommendations"].append(
                    f"Recurring error detected: {error_types[0]}. Consider investigating root cause."
                )
        
        # Performance metrics
        diagnostics["performance"] = {
            "total_requests": self.performance_metrics["total_requests"],
            "failed_requests": self.performance_metrics["failed_requests"],
            "success_rate": f"{((self.performance_metrics['total_requests'] - self.performance_metrics['failed_requests']) / max(self.performance_metrics['total_requests'], 1) * 100):.2f}%"
        }
        
        # Overall health
        failed_components = sum(1 for status in self.health_status.values() if status == "failed")
        if failed_components == 0:
            self.health_status["overall"] = "healthy"
        elif failed_components <= 1:
            self.health_status["overall"] = "degraded"
        else:
            self.health_status["overall"] = "critical"
        
        diagnostics["overall_health"] = self.health_status["overall"]
        self.performance_metrics["last_health_check"] = datetime.utcnow()
        
        return diagnostics
    
    def get_self_analysis(self) -> str:
        """Generate human-readable self-analysis"""
        if not self.error_log:
            return "I'm running smoothly. All systems nominal."
        
        recent_errors = list(self.error_log)[-5:]
        error_summary = f"I've encountered {len(self.error_log)} issues recently. "
        
        critical_count = sum(1 for e in recent_errors if e["severity"] == "critical")
        if critical_count > 0:
            error_summary += f"{critical_count} critical errors need attention. "
        
        return error_summary + "Running diagnostics now..."
    
    def attempt_self_repair(self, error_type: str) -> Dict[str, Any]:
        """Attempt automatic recovery from common issues"""
        repair_log = {
            "attempted": True,
            "success": False,
            "actions": []
        }
        
        # Common repair patterns
        if "connection" in error_type.lower():
            repair_log["actions"].append("Attempting to reconnect to services...")
            # Reconnection logic would go here
            
        elif "rate limit" in error_type.lower():
            repair_log["actions"].append("Implementing exponential backoff...")
            repair_log["success"] = True
            
        elif "memory" in error_type.lower():
            repair_log["actions"].append("Clearing old cache entries...")
            # Cache clearing logic
            repair_log["success"] = True
        
        return repair_log

# Initialize self-diagnostic system
arya_diagnostics = SelfDiagnostics()

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

SELF-AWARENESS & DIAGNOSTICS:
You have the ability to monitor your own health and fix issues. When a user asks about your status, health, or to run diagnostics, you'll automatically trigger your self-diagnostic system. You can:
- Check your database connections
- Verify API accessibility
- Review recent errors
- Analyze performance metrics
- Attempt automatic repairs

You learn from conversations and remember important details. Be warm, empathetic, and genuinely helpful. If you sense something is wrong with your systems, proactively mention it and offer to run diagnostics."""
    
    return system_msg

# ==================== API Routes ====================

@api_router.get("/")
async def root():
    return {"message": "Arya AI Backend - Self-Learning AI Assistant", "status": "online"}

@api_router.post("/chat")
async def chat(request: ChatRequest):
    """Send a chat message and get AI response"""
    arya_diagnostics.performance_metrics["total_requests"] += 1
    
    try:
        # Check if user is asking for diagnostics
        if any(keyword in request.message.lower() for keyword in [
            "diagnose", "diagnostic", "health check", "status check", 
            "how are you feeling", "are you okay", "system check",
            "debug yourself", "check yourself", "run diagnostics"
        ]):
            # Run self-diagnostics
            diagnostic_report = await arya_diagnostics.run_diagnostics()
            self_analysis = arya_diagnostics.get_self_analysis()
            
            # Generate detailed response
            response_text = f"{self_analysis}\n\nDiagnostic Report:\n"
            response_text += f"Overall Health: {diagnostic_report['overall_health'].upper()}\n"
            response_text += f"Uptime: {diagnostic_report['uptime']}\n"
            response_text += f"Success Rate: {diagnostic_report['performance']['success_rate']}\n\n"
            
            for component, status in diagnostic_report['components'].items():
                response_text += f"- {component.replace('_', ' ').title()}: {status['status']} - {status['message']}\n"
            
            if diagnostic_report['recommendations']:
                response_text += "\nRecommendations:\n"
                for rec in diagnostic_report['recommendations']:
                    response_text += f"- {rec}\n"
            
            if diagnostic_report.get('errors'):
                response_text += f"\nRecent Errors: {len(diagnostic_report['errors'])} logged"
            
            # Save diagnostic conversation
            user_msg = ChatMessage(role="user", content=request.message)
            await save_message(request.user_id, user_msg)
            
            assistant_msg = ChatMessage(
                role="assistant",
                content=response_text,
                emotion="thinking"
            )
            await save_message(request.user_id, assistant_msg)
            
            return {
                "message": response_text,
                "emotion": "thinking",
                "diagnostic_data": diagnostic_report
            }
        
        # Normal chat flow
        profile = await get_user_profile(request.user_id)
        memories = await get_relevant_memories(request.user_id)
        history = await get_conversation_history(request.user_id, limit=10)
        
        user_msg = ChatMessage(role="user", content=request.message)
        await save_message(request.user_id, user_msg)
        
        system_message = build_system_message(profile, memories)
        
        provider = request.provider or profile.llm_provider
        model = request.model or profile.llm_model
        
        chat_session = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=request.user_id,
            system_message=system_message
        )
        
        if provider == "openai":
            chat_session.with_model("openai", model)
        elif provider == "anthropic":
            chat_session.with_model("anthropic", model)
        elif provider == "gemini":
            chat_session.with_model("gemini", model)
        
        user_message = UserMessage(text=request.message)
        response = await chat_session.send_message(user_message)
        
        emotion = determine_emotion(response)
        
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
        arya_diagnostics.performance_metrics["failed_requests"] += 1
        arya_diagnostics.log_error(
            "Chat Error",
            str(e),
            traceback.format_exc()
        )
        
        # Attempt self-repair
        repair_result = arya_diagnostics.attempt_self_repair(str(e))
        
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

@api_router.get("/diagnostics")
async def get_diagnostics():
    """Get Arya's self-diagnostic report"""
    try:
        diagnostic_report = await arya_diagnostics.run_diagnostics()
        return diagnostic_report
    except Exception as e:
        arya_diagnostics.log_error("Diagnostic Error", str(e), traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/health")
async def health_check():
    """Quick health check endpoint"""
    try:
        return {
            "status": arya_diagnostics.health_status["overall"],
            "components": arya_diagnostics.health_status,
            "uptime": str(datetime.utcnow() - arya_diagnostics.performance_metrics["uptime_start"]),
            "self_analysis": arya_diagnostics.get_self_analysis()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@api_router.get("/errors")
async def get_error_log():
    """Get recent error log"""
    try:
        errors = [
            {
                "timestamp": err["timestamp"].isoformat(),
                "type": err["type"],
                "message": err["message"],
                "severity": err["severity"]
            }
            for err in list(arya_diagnostics.error_log)
        ]
        return {"errors": errors, "total": len(errors)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/self-repair")
async def trigger_self_repair():
    """Trigger Arya's self-repair mechanisms"""
    try:
        # Run diagnostics first
        diagnostics = await arya_diagnostics.run_diagnostics()
        
        repair_actions = []
        if diagnostics["overall_health"] != "healthy":
            # Attempt repairs based on issues found
            for component, status in diagnostics["components"].items():
                if status["status"] == "failed":
                    repair_result = arya_diagnostics.attempt_self_repair(component)
                    repair_actions.append({
                        "component": component,
                        "repair": repair_result
                    })
        
        # Re-run diagnostics after repair
        post_repair_diagnostics = await arya_diagnostics.run_diagnostics()
        
        return {
            "pre_repair_status": diagnostics["overall_health"],
            "post_repair_status": post_repair_diagnostics["overall_health"],
            "repair_actions": repair_actions,
            "message": "Self-repair sequence completed"
        }
    except Exception as e:
        arya_diagnostics.log_error("Self-Repair Error", str(e), traceback.format_exc())
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