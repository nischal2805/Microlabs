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

// Food History Types
export interface FoodEntry {
  timestamp: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  notes?: string;
}

export interface FoodHistoryInput {
  entries: FoodEntry[];
}

export interface FoodHistoryResponse {
  success: boolean;
  message: string;
}

// Temperature History Types
export interface TemperatureEntry {
  timestamp: string;
  temperature: number;
  notes?: string;
}

export interface TemperatureHistoryInput {
  entries: TemperatureEntry[];
}

export interface TemperatureHistoryResponse {
  success: boolean;
  message: string;
}

// Location-based Fever Detection Types
export interface LocationData {
  latitude: number;
  longitude: number;
  location_name?: string;
}

export interface FeverReportInput {
  location: LocationData;
  temperature: number;
  timestamp: string;
  symptoms: string[];
}

export interface LocationFeverStats {
  location_name: string;
  fever_count: number;
  alert_level: 'normal' | 'elevated' | 'high';
}

// Reminder System Types
export interface Reminder {
  id: string;
  type: 'medicine' | 'diet' | 'checkup' | 'temperature';
  title: string;
  description: string;
  time: string; // Format: HH:MM
  frequency: 'once' | 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly';
  start_date: string;
  end_date?: string;
  enabled: boolean;
}

export interface ReminderInput {
  reminders: Reminder[];
}

export interface ReminderResponse {
  success: boolean;
  message: string;
  reminders: Reminder[];
}
