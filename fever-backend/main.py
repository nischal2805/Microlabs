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


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Fever Triage System API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
