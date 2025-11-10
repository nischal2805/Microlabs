// TypeScript type definitions for the Fever Triage System

export interface TriageInput {
  temperature: number;
  duration_hours: number;
  symptoms: string[];
  age: number;
  medical_history?: string;
}

export interface DiagnosisSuggestion {
  condition: string;
  probability: number;
  reasoning: string;
}

export interface TriageOutput {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  diagnosis_suggestions: DiagnosisSuggestion[];
  recommended_action: string;
  explanation: string;
  red_flags: string[];
  time_sensitive: boolean;
  follow_up_timeline: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  ai_service: string;
}

export interface MetricsResponse {
  total_assessments: number;
  severity_breakdown: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export interface DemoCase {
  name: string;
  icon: string;
  temperature: number;
  duration_hours: number;
  age: number;
  symptoms: string[];
  medical_history?: string;
}
