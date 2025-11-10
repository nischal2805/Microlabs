# 🏥 AI Fever Triage System - Frontend

Next.js 14 frontend application for the AI-Assisted Fever Triage System.

## Features

- ✅ Modern, responsive UI built with Next.js 14 and TypeScript
- ✅ Tailwind CSS for beautiful, mobile-first design
- ✅ Comprehensive symptom input form with validation
- ✅ Interactive results display with severity indicators
- ✅ Quick demo cases for testing
- ✅ Temperature unit conversion (°F ↔ °C)
- ✅ Accessibility-focused design
- ✅ Print-friendly assessment reports
- ✅ Real-time API integration with error handling

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ installed
- Backend API running on http://localhost:8000

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local if you need a different API URL
# Default is http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm start
```

## Demo Cases

Pre-configured scenarios for testing:
- 🤧 Common Cold (LOW severity)
- 🤒 Flu (MEDIUM severity)
- 🫁 Pneumonia (HIGH severity)
- 🚨 Critical (CRITICAL severity)

## License

MIT License
