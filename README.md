# 🏥 AI-Assisted Fever Triage System

> Intelligent emergency decision support powered by GPT-4 and evidence-based medical protocols

## 🎯 Problem Statement

- **40% of ER visits** for fever could be managed elsewhere
- **Delayed care** for serious conditions leads to worse outcomes
- **Misdiagnosis risk** in non-specialist settings
- **Healthcare access gaps** in rural and underserved areas
- **Pandemic preparedness** requires rapid, accurate screening

## 💡 Our Solution

An AI-powered triage system that provides instant, accurate fever assessment combining:
- GPT-4's medical knowledge
- Evidence-based clinical protocols
- SIRS criteria for sepsis detection
- Age-specific risk stratification
- Real-time differential diagnosis

## ✨ Key Features

- 🤖 **AI-Powered Analysis**: GPT-4 trained on medical triage protocols
- ⚡ **Instant Assessment**: Results in <30 seconds
- 🎯 **4-Level Severity**: LOW → MEDIUM → HIGH → CRITICAL
- 🔍 **Differential Diagnosis**: Top 3-5 possible conditions with probability
- 🚨 **Red Flag Detection**: Automatic identification of life-threatening symptoms
- 📱 **Mobile Responsive**: Works on any device
- 🌐 **24/7 Available**: No wait times, instant guidance

## 🏗️ Architecture

```
Patient Input → Next.js Frontend → FastAPI Backend → OpenAI GPT-4 → Triage Assessment
```

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend directory
cd fever-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your OpenAI API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=your_actual_api_key_here

# Run the server
python main.py
# Server runs at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd fever-triage

# Install dependencies
npm install

# Run development server
npm run dev
# App runs at: http://localhost:3000
```

## 📊 Demo Cases

Try these sample scenarios to see the system in action:

1. **🤧 Common Cold** - Low severity, home care recommended
   - Temperature: 99.8°F, Duration: 24 hours
   - Symptoms: Sore throat, fatigue, runny nose
   - Result: Self-care with monitoring

2. **🤒 Influenza** - Medium severity, see doctor soon
   - Temperature: 102.5°F, Duration: 18 hours
   - Symptoms: Body aches, chills, headache, dry cough
   - Result: Primary care visit within 24-48 hours

3. **🫁 Bacterial Pneumonia** - High severity, urgent care needed
   - Temperature: 103.8°F, Duration: 48 hours
   - Symptoms: Chest pain, cough with phlegm, difficulty breathing
   - Result: Urgent care or ED evaluation within 2-4 hours

4. **🚨 Sepsis** - Critical, immediate ER required
   - Temperature: 105°F, Duration: 8 hours
   - Symptoms: Confusion, rapid heartbeat, difficulty breathing, altered consciousness
   - Result: Call 911 or go to ER immediately

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **AI**: OpenAI GPT-4-Turbo
- **Validation**: Pydantic v2
- **Environment**: python-dotenv

## 📈 Impact Potential

- Reduce unnecessary ER visits by **30-40%**
- Improve early detection of life-threatening conditions
- Provide 24/7 medical guidance to underserved populations
- Scale to millions of users with minimal infrastructure
- Enable faster triage in pandemic scenarios

## 🔮 Future Roadmap

- [ ] Integration with wearable devices (Apple Watch, Fitbit)
- [ ] Multi-language support (Spanish, Mandarin, Hindi)
- [ ] Telemedicine integration with video consultations
- [ ] Clinical validation studies with healthcare providers
- [ ] Mobile apps (iOS/Android native applications)
- [ ] Electronic health record (EHR) integration
- [ ] Historical tracking of symptoms over time
- [ ] Family profile management
- [ ] Emergency contact notifications

## 🔒 Security & Privacy

- ✅ No personal data stored or logged
- ✅ API keys secured via environment variables
- ✅ HTTPS enforced in production
- ✅ Input validation and sanitization
- ✅ Rate limiting to prevent abuse
- ✅ CORS configured for specific origins

## 📊 System Metrics

The system tracks:
- Total assessments performed
- Severity breakdown (LOW, MEDIUM, HIGH, CRITICAL)
- Average response time
- AI service availability

Access metrics at: `http://localhost:8000/api/metrics`

## 🩺 Medical Decision Logic

### Severity Levels

**LOW (🟢 Green)**
- Temperature: 99-101°F
- Duration: <48 hours
- Symptoms: Upper respiratory (runny nose, mild sore throat)
- Action: Self-care, rest, hydration

**MEDIUM (🟡 Yellow)**
- Temperature: 101-103°F
- Duration: 24-72 hours
- Symptoms: Flu-like (body aches, chills, fatigue)
- Action: Primary care visit within 24-48 hours

**HIGH (🟠 Orange)**
- Temperature: 103-105°F or fever >72 hours
- Symptoms: Productive cough + chest pain, severe headache
- Age: <3 months any fever, >65 with fever
- Action: Urgent care or ED evaluation within 2-4 hours

**CRITICAL (🔴 Red)**
- Temperature: >105°F or <95°F
- Red flags: Stiff neck + altered mental status, difficulty breathing, confusion
- Action: Call 911 or go to ER immediately

## ⚠️ Medical Disclaimer

This system is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

**IN CASE OF EMERGENCY, CALL 911 IMMEDIATELY.**

## 📄 API Documentation

Full API documentation is available at:
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints

- `POST /api/triage` - Perform triage assessment
- `GET /api/health` - Health check
- `GET /api/metrics` - System metrics

## 🧪 Testing

### Backend Testing
```bash
cd fever-backend
# Test health endpoint
curl http://localhost:8000/api/health

# Test triage endpoint
curl -X POST http://localhost:8000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 102.5,
    "duration_hours": 24,
    "symptoms": ["fever", "cough"],
    "age": 35
  }'
```

### Frontend Testing
1. Run `npm run dev`
2. Open http://localhost:3000
3. Click demo cases to test different scenarios
4. Verify responsive design on mobile/tablet
5. Test form validation
6. Test error handling (stop backend)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

Built as a demonstration of AI-powered healthcare applications.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API access
- Medical protocols from CDC, WHO, and peer-reviewed literature
- Next.js and FastAPI communities
- Open-source contributors

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check documentation in `fever-backend/README.md` and `fever-triage/README.md`
- Review API docs at `http://localhost:8000/docs`

---

**Built with ❤️ for better healthcare access**
