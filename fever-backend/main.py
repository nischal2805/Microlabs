"""
AI-Assisted Fever Triage System - FastAPI Backend
Production-ready backend with OpenAI GPT-4 integration
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from openai import OpenAI
import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Fever Triage System",
    description="Intelligent medical assessment for fever-related symptoms",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai_client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = OpenAI(api_key=api_key)
        logger.info("OpenAI client initialized successfully")
    else:
        logger.warning("OPENAI_API_KEY not found in environment variables")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")

# Global metrics
metrics = {
    "total_assessments": 0,
    "severity_breakdown": {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
        "CRITICAL": 0
    }
}

# Pydantic Models
class TriageInput(BaseModel):
    temperature: float = Field(..., ge=95.0, le=110.0, description="Temperature in Fahrenheit")
    duration_hours: int = Field(..., ge=1, le=720, description="Fever duration in hours")
    symptoms: List[str] = Field(..., min_length=1, description="List of symptoms")
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    medical_history: Optional[str] = Field(None, max_length=500, description="Medical history")

    @field_validator('symptoms')
    @classmethod
    def validate_symptoms(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one symptom is required')
        return v


class DiagnosisSuggestion(BaseModel):
    condition: str
    probability: float = Field(..., ge=0.0, le=1.0)
    reasoning: str


class TriageOutput(BaseModel):
    severity: str = Field(..., pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    confidence: float = Field(..., ge=0.0, le=1.0)
    diagnosis_suggestions: List[DiagnosisSuggestion]
    recommended_action: str
    explanation: str
    red_flags: List[str]
    time_sensitive: bool
    follow_up_timeline: str


class HealthStatus(BaseModel):
    status: str
    timestamp: str
    ai_service: str


class MetricsResponse(BaseModel):
    total_assessments: int
    severity_breakdown: Dict[str, int]


# AI Integration Functions
def create_system_prompt() -> str:
    """Create the system prompt for GPT-4"""
    return """You are an expert clinical decision support AI with specialization in:
- Emergency medicine and acute care
- Infectious diseases and fever management
- Pediatric and geriatric considerations
- Sepsis identification (SIRS, qSOFA criteria)
- Differential diagnosis methodology

Your responsibilities:
1. Perform systematic symptom analysis
2. Apply evidence-based triage protocols
3. Identify life-threatening red flags (meningitis signs: stiff neck + fever + altered mental status; sepsis signs: fever + hypotension + tachycardia + confusion; severe pneumonia: respiratory distress + chest pain)
4. Consider age-specific vulnerabilities (infants <3 months: any fever >100.4°F is high risk; elderly >65: atypical presentations common)
5. Provide probability-ranked differential diagnoses
6. Recommend appropriate care level (home care, primary care visit, urgent care, emergency department)
7. Always err on the side of patient safety

Return only valid JSON matching the specified schema. Be concise but thorough."""


def create_user_prompt(data: TriageInput) -> str:
    """Create the user prompt with patient data"""
    symptoms_formatted = "\n".join([f"- {symptom}" for symptom in data.symptoms])
    medical_history_text = data.medical_history if data.medical_history else "No significant medical history reported"
    
    return f"""PATIENT ASSESSMENT REQUEST

Demographics:
- Age: {data.age} years

Vital Signs:
- Temperature: {data.temperature}°F
- Fever duration: {data.duration_hours} hours

Presenting Symptoms:
{symptoms_formatted}

Medical Context:
{medical_history_text}

REQUIRED OUTPUT (JSON):
{{
  "severity": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "confidence": <0.0-1.0>,
  "diagnosis_suggestions": [
    {{
      "condition": "Most likely diagnosis",
      "probability": <0.0-1.0>,
      "reasoning": "Clinical reasoning"
    }}
  ],
  "recommended_action": "Specific actionable recommendation",
  "explanation": "Patient-friendly explanation of assessment",
  "red_flags": ["List any urgent warning signs present"],
  "time_sensitive": <true|false>,
  "follow_up_timeline": "Timeframe for action"
}}

CLINICAL DECISION RULES:
- Temperature >105°F or <95°F: Consider CRITICAL
- Fever >72 hours without improvement: Escalate severity
- Infants <3 months with fever: Minimum HIGH severity
- Immunocompromised patients: Escalate by one level
- Red flag symptoms present: Minimum HIGH severity
- Multiple system involvement: Increase severity assessment"""


async def call_openai_with_retry(data: TriageInput, max_retries: int = 3) -> dict:
    """Call OpenAI API with retry logic"""
    if not openai_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please check OPENAI_API_KEY."
        )
    
    system_prompt = create_system_prompt()
    user_prompt = create_user_prompt(data)
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Calling OpenAI API (attempt {attempt + 1}/{max_retries})")
            
            response = openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=1000,
                response_format={"type": "json_object"},
                timeout=30
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            logger.info("Successfully received response from OpenAI")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to parse AI response. Please try again."
                )
        except Exception as e:
            logger.error(f"OpenAI API error (attempt {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                # Return fallback response
                return create_fallback_response(data)
            # Exponential backoff
            time.sleep(2 ** attempt)
    
    return create_fallback_response(data)


def create_fallback_response(data: TriageInput) -> dict:
    """Create a conservative fallback response when AI is unavailable"""
    logger.warning("Using fallback response due to AI service unavailability")
    
    return {
        "severity": "HIGH",
        "confidence": 0.5,
        "diagnosis_suggestions": [
            {
                "condition": "Unable to determine - AI service unavailable",
                "probability": 0.5,
                "reasoning": "The AI diagnostic service is temporarily unavailable. This is a conservative assessment."
            }
        ],
        "recommended_action": "Please consult a healthcare provider immediately for proper evaluation.",
        "explanation": "AI service is temporarily unavailable. Given your symptoms and fever, we recommend seeking medical attention to ensure proper evaluation and care.",
        "red_flags": ["AI service unavailable - seek medical consultation"],
        "time_sensitive": True,
        "follow_up_timeline": "within 2-4 hours"
    }


# API Endpoints
@app.get("/api/health", response_model=HealthStatus)
async def health_check():
    """Health check endpoint"""
    ai_status = "connected" if openai_client else "disconnected"
    
    return HealthStatus(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        ai_service=ai_status
    )


@app.get("/api/metrics", response_model=MetricsResponse)
async def get_metrics():
    """Get system metrics"""
    return MetricsResponse(
        total_assessments=metrics["total_assessments"],
        severity_breakdown=metrics["severity_breakdown"]
    )


@app.post("/api/triage", response_model=TriageOutput)
async def triage_assessment(data: TriageInput):
    """Main triage assessment endpoint"""
    try:
        logger.info(f"Received triage request for age {data.age}, temp {data.temperature}°F")
        
        # Call OpenAI API with retry logic
        ai_response = await call_openai_with_retry(data)
        
        # Validate and create response
        result = TriageOutput(**ai_response)
        
        # Update metrics
        metrics["total_assessments"] += 1
        metrics["severity_breakdown"][result.severity] += 1
        
        logger.info(f"Triage assessment completed: {result.severity}")
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during triage: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during triage assessment."
        )


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatInput(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    triage_context: Dict = Field(...)
    conversation_history: List[ChatMessage] = Field(default_factory=list)


class ChatOutput(BaseModel):
    response: str


@app.post("/api/chat", response_model=ChatOutput)
async def chat_endpoint(data: ChatInput):
    """Chat endpoint for follow-up questions after triage assessment"""
    try:
        logger.info(f"Received chat message: {data.message[:50]}...")
        
        if not openai_client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured."
            )
        
        # Create system prompt with triage context
        system_prompt = f"""You are a helpful medical assistant providing follow-up information after a fever triage assessment. 

The patient received a {data.triage_context.get('severity', 'UNKNOWN')} severity assessment with the following context:
- Likely condition: {data.triage_context.get('symptoms', 'Unknown')}
- Recommendation: {data.triage_context.get('recommended_action', 'See healthcare provider')}

Your role:
1. Answer follow-up questions about their symptoms and assessment
2. Provide general health advice and home care tips
3. Explain over-the-counter medication options (general information only)
4. Clarify when to seek additional medical care
5. Always remind them this is educational information, not medical advice

Guidelines:
- Be empathetic and supportive
- Keep responses concise (2-3 paragraphs max)
- Do not diagnose or prescribe specific treatments
- Always defer to healthcare providers for medical decisions
- If asked about prescriptions, explain they need a doctor
- Remind them to follow their assessment recommendation"""

        # Build conversation history
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 6 messages for context)
        for msg in data.conversation_history[-6:]:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add current message
        messages.append({"role": "user", "content": data.message})
        
        # Call OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=400,
            timeout=30
        )
        
        assistant_message = response.choices[0].message.content
        logger.info("Chat response generated successfully")
        
        return ChatOutput(response=assistant_message)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        return ChatOutput(
            response="I'm sorry, I'm having trouble responding right now. Please remember to follow your assessment recommendation and consult with a healthcare provider if you have specific medical questions."
        )


# New Feature Models - Food History
class FoodEntry(BaseModel):
    timestamp: str
    meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner|snack)$")
    description: str = Field(..., min_length=1, max_length=200)
    notes: Optional[str] = Field(None, max_length=200)


class FoodHistoryInput(BaseModel):
    entries: List[FoodEntry]


class FoodHistoryResponse(BaseModel):
    success: bool
    message: str


# Temperature History
class TemperatureEntry(BaseModel):
    timestamp: str
    temperature: float = Field(..., ge=95.0, le=110.0)
    notes: Optional[str] = Field(None, max_length=200)


class TemperatureHistoryInput(BaseModel):
    entries: List[TemperatureEntry]


class TemperatureHistoryResponse(BaseModel):
    success: bool
    message: str


# Location-based Fever Detection
class LocationData(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    location_name: Optional[str] = Field(None, max_length=100)


class FeverReportInput(BaseModel):
    location: LocationData
    temperature: float = Field(..., ge=95.0, le=110.0)
    timestamp: str
    symptoms: List[str]


class LocationFeverStats(BaseModel):
    location_name: str
    fever_count: int
    alert_level: str = Field(..., pattern="^(normal|elevated|high)$")


# Reminder System
class Reminder(BaseModel):
    id: str
    type: str = Field(..., pattern="^(medicine|diet|checkup|temperature)$")
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., max_length=300)
    time: str  # Format: HH:MM
    frequency: str = Field(..., pattern="^(once|daily|twice_daily|thrice_daily|weekly)$")
    start_date: str
    end_date: Optional[str] = None
    enabled: bool = True


class ReminderInput(BaseModel):
    reminders: List[Reminder]


class ReminderResponse(BaseModel):
    success: bool
    message: str
    reminders: List[Reminder]


# API Endpoints for New Features
@app.post("/api/food-history", response_model=FoodHistoryResponse)
async def save_food_history(data: FoodHistoryInput):
    """Save food/meal history entries"""
    try:
        logger.info(f"Saving {len(data.entries)} food history entries")
        # In a real app, this would save to a database
        # For MVP, we're returning success so frontend can use localStorage
        return FoodHistoryResponse(
            success=True,
            message=f"Successfully saved {len(data.entries)} food entries"
        )
    except Exception as e:
        logger.error(f"Error saving food history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save food history"
        )


@app.post("/api/temperature-history", response_model=TemperatureHistoryResponse)
async def save_temperature_history(data: TemperatureHistoryInput):
    """Save temperature history entries"""
    try:
        logger.info(f"Saving {len(data.entries)} temperature history entries")
        # In a real app, this would save to a database
        # For MVP, we're returning success so frontend can use localStorage
        return TemperatureHistoryResponse(
            success=True,
            message=f"Successfully saved {len(data.entries)} temperature entries"
        )
    except Exception as e:
        logger.error(f"Error saving temperature history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save temperature history"
        )


@app.post("/api/location/fever-report", response_model=dict)
async def report_fever_location(data: FeverReportInput):
    """Report fever with location data for community tracking"""
    try:
        logger.info(f"Fever report from location: {data.location.location_name or 'Unknown'}")
        # In a real app, this would save to a database and aggregate data
        # For MVP, returning acknowledgment
        return {
            "success": True,
            "message": "Fever report recorded successfully",
            "alert_level": "normal"  # Would be calculated based on area data
        }
    except Exception as e:
        logger.error(f"Error recording fever report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record fever report"
        )


@app.get("/api/location/fever-stats", response_model=LocationFeverStats)
async def get_location_fever_stats(
    latitude: float,
    longitude: float,
    radius_km: float = 10.0
):
    """Get fever statistics for a specific location"""
    try:
        logger.info(f"Fetching fever stats for location: {latitude}, {longitude}")
        # In a real app, this would query a database for nearby fever reports
        # For MVP, returning simulated data
        return LocationFeverStats(
            location_name="Local Area",
            fever_count=0,
            alert_level="normal"
        )
    except Exception as e:
        logger.error(f"Error fetching fever stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch fever statistics"
        )


@app.post("/api/reminders", response_model=ReminderResponse)
async def save_reminders(data: ReminderInput):
    """Save medication and diet reminders"""
    try:
        logger.info(f"Saving {len(data.reminders)} reminders")
        # In a real app, this would save to a database
        # For MVP, we're returning success so frontend can use localStorage
        return ReminderResponse(
            success=True,
            message=f"Successfully saved {len(data.reminders)} reminders",
            reminders=data.reminders
        )
    except Exception as e:
        logger.error(f"Error saving reminders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save reminders"
        )


@app.get("/api/reminders", response_model=List[Reminder])
async def get_reminders():
    """Get all active reminders"""
    try:
        logger.info("Fetching reminders")
        # In a real app, this would fetch from a database
        # For MVP, returning empty list (frontend will use localStorage)
        return []
    except Exception as e:
        logger.error(f"Error fetching reminders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reminders"
        )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Fever Triage System API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
