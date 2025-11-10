# 🏥 AI Fever Triage System - Backend

FastAPI backend for the AI-Assisted Fever Triage System with OpenAI GPT-4 integration.

## Features

- ✅ RESTful API with FastAPI
- ✅ OpenAI GPT-4-Turbo integration
- ✅ Advanced medical prompt engineering
- ✅ Comprehensive input validation with Pydantic
- ✅ Retry logic with exponential backoff
- ✅ Fallback responses for service unavailability
- ✅ CORS configuration for frontend integration
- ✅ Health check and metrics endpoints
- ✅ Structured logging

## API Endpoints

### POST /api/triage
Main triage assessment endpoint.

**Request Body:**
```json
{
  "temperature": 102.5,
  "duration_hours": 24,
  "symptoms": ["fever", "cough", "fatigue"],
  "age": 35,
  "medical_history": "No significant history"
}
```

**Response:**
```json
{
  "severity": "MEDIUM",
  "confidence": 0.85,
  "diagnosis_suggestions": [
    {
      "condition": "Influenza",
      "probability": 0.7,
      "reasoning": "Fever with respiratory symptoms"
    }
  ],
  "recommended_action": "Visit primary care within 24-48 hours",
  "explanation": "Your symptoms suggest a viral infection...",
  "red_flags": [],
  "time_sensitive": false,
  "follow_up_timeline": "24-48 hours"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "ai_service": "connected"
}
```

### GET /api/metrics
System metrics endpoint.

**Response:**
```json
{
  "total_assessments": 150,
  "severity_breakdown": {
    "LOW": 45,
    "MEDIUM": 60,
    "HIGH": 35,
    "CRITICAL": 10
  }
}
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
# Navigate to backend directory
cd fever-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your_actual_api_key_here
```

### 4. Run the Server

```bash
# Development mode
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Configuration

Environment variables (optional):
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `LOG_LEVEL` - Logging level (default: INFO)
- `MAX_RETRIES` - Number of retry attempts for OpenAI API (default: 3)

## Medical Decision Logic

### Severity Levels

**LOW (Green)**
- Temperature: 99-101°F
- Duration: <48 hours
- Symptoms: Upper respiratory (runny nose, mild sore throat)
- Action: Self-care, rest, hydration

**MEDIUM (Yellow)**
- Temperature: 101-103°F
- Duration: 24-72 hours
- Symptoms: Flu-like (body aches, chills, fatigue)
- Action: Primary care visit within 24-48 hours

**HIGH (Orange)**
- Temperature: 103-105°F or fever >72 hours
- Symptoms: Productive cough + chest pain, severe headache
- Age: <3 months any fever, >65 with fever
- Action: Urgent care or ED evaluation within 2-4 hours

**CRITICAL (Red)**
- Temperature: >105°F or <95°F
- Red flags: Stiff neck + altered mental status, difficulty breathing, confusion
- Action: Call 911 or go to ER immediately

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (422)
- AI service unavailable (503)
- API key issues (503)
- Rate limit exceeded (handled with retries)
- Timeout handling (30 seconds)
- Fallback responses for service failures

## Testing

Test the API using the interactive docs at http://localhost:8000/docs or with curl:

```bash
# Health check
curl http://localhost:8000/api/health

# Triage assessment
curl -X POST http://localhost:8000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 102.5,
    "duration_hours": 24,
    "symptoms": ["fever", "cough", "fatigue"],
    "age": 35,
    "medical_history": "No significant history"
  }'
```

## Security Considerations

- ✅ CORS configured for localhost:3000 only
- ✅ Input validation on all endpoints
- ✅ API key stored in environment variables
- ✅ No personal data logged
- ✅ Rate limiting ready (add middleware in production)

## Production Deployment

For production deployment:
1. Set `allow_origins` in CORS to your production domain
2. Enable HTTPS
3. Add rate limiting middleware
4. Configure proper logging (e.g., to file or external service)
5. Set up monitoring and alerting
6. Consider caching responses for identical inputs

## Medical Disclaimer

This system is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.

## License

MIT License
